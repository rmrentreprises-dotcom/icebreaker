"""Bulk library backfill — simpler, robust version.

Strategy: process cells SEQUENTIALLY but request BIG batches (50 lines per LLM call).
No async semaphores, no parallel mess. Idempotent.

Run from /app/backend:
    python -u -m scripts.backfill_v2
"""
import os
import sys
import json
import uuid
import asyncio
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from icebreakers_seed import get_categories, get_tones  # noqa: E402

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

TARGET_PER_CELL = 56
BATCH_SIZE = 50


def now_utc():
    return datetime.now(timezone.utc)


TONE_GUIDE = {
    "funny": ("Light, observational humor. Self-deprecating or playful. No corny pickup lines.",
              "Humour léger, observation, autodérision. Pas de blague ringarde."),
    "romantic": ("Sincere, warm, slightly poetic. Confident, not desperate. Avoid clichés.",
                 "Sincère, chaleureux, un peu poétique. Confiant, pas désespéré."),
    "casual": ("Conversational, low-stakes. Like asking a stranger a normal question.",
               "Conversationnel, anodin. Comme une vraie question à un inconnu."),
    "bold": ("Direct, confident, slightly daring. Not aggressive — assertive and warm.",
             "Direct, confiant, un peu osé. Pas agressif — assertif et chaleureux."),
    "witty": ("Clever wordplay, smart observations. Quick and a bit unexpected.",
              "Jeu de mots intelligent, observations malicieuses. Vif et inattendu."),
    "sweet": ("Genuine compliments, kindness, warmth.",
              "Compliments sincères, gentillesse, chaleur."),
}


async def call_claude(system: str, user: str) -> str:
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY, session_id=str(uuid.uuid4()), system_message=system
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    resp = await asyncio.wait_for(chat.send_message(UserMessage(text=user)), timeout=120)
    return resp if isinstance(resp, str) else str(resp)


def parse_lines(text: str) -> list[str]:
    """Lenient parser. Tries JSON first, falls back to plain-line scan."""
    # Try JSON
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            obj = json.loads(text[start : end + 1])
            arr = obj.get("lines") or obj.get("icebreakers") or []
            cleaned = []
            for it in arr:
                s = it if isinstance(it, str) else it.get("line") or it.get("text") or ""
                s = s.strip().strip('"').strip("'").strip("- ").strip("• ").strip()
                if 8 <= len(s) <= 280:
                    cleaned.append(s)
            if cleaned:
                return cleaned
    except Exception:
        pass
    # Fallback: split lines, strip bullets
    cleaned = []
    for ln in text.split("\n"):
        s = ln.strip()
        if not s or s.startswith("```") or s.startswith("{") or s.startswith("}") or s.startswith('"lines"'):
            continue
        s = s.lstrip("-•* 0123456789.").strip().strip('",').strip().strip('"').strip("'").strip()
        if 8 <= len(s) <= 280:
            cleaned.append(s)
    return cleaned


async def fill_one_cell(db, cat_id: str, cat_name: str, tone: str, lang: str, need: int) -> int:
    """Generate up to `need` new lines for this cell. Returns how many were inserted."""
    tone_en, tone_fr = TONE_GUIDE[tone]
    if lang == "fr":
        system = (
            "Tu es un coach social expert. Tu écris des icebreakers naturels, créatifs et "
            "variés. Aucune phrase ringarde. RÉPONDS UNIQUEMENT en JSON valide: "
            '{"lines": ["...", "..."]}'
        )
        user = (
            f"Lieu : {cat_name}\nTon : {tone} — {tone_fr}\n"
            f"Génère exactement {BATCH_SIZE} icebreakers DIFFÉRENTS en français. "
            f"Pas d'emoji. Pas de guillemets dans le texte. JSON uniquement."
        )
    else:
        system = (
            "You are an expert social coach writing natural, creative, varied icebreaker "
            "lines. No corny lines. RESPOND ONLY with valid JSON: "
            '{"lines": ["...", "..."]}'
        )
        user = (
            f"Setting: {cat_name}\nTone: {tone} — {tone_en}\n"
            f"Generate exactly {BATCH_SIZE} DIFFERENT icebreakers in English. "
            f"No emojis. No quotes inside text. JSON only."
        )

    inserted = 0
    attempts = 0
    while inserted < need and attempts < 3:
        attempts += 1
        try:
            text = await call_claude(system, user)
        except Exception as e:
            print(f"  ! LLM call failed: {e}", flush=True)
            await asyncio.sleep(2)
            continue
        lines = parse_lines(text)
        print(f"    parsed {len(lines)} candidate lines", flush=True)
        if not lines:
            continue
        # Dedupe vs DB
        existing = set()
        async for d in db.icebreakers.find(
            {"category": cat_id, "tone": tone, "language": lang}, {"_id": 0, "text": 1}
        ):
            existing.add(d["text"].lower())
        docs = []
        for line in lines:
            key = line.lower()
            if key in existing:
                continue
            existing.add(key)
            docs.append({
                "id": str(uuid.uuid4()),
                "category": cat_id,
                "tone": tone,
                "language": lang,
                "text": line,
                "source": "ai_backfill",
                "created_at": now_utc(),
            })
            if len(docs) >= need - inserted:
                break
        if docs:
            await db.icebreakers.insert_many(docs)
            inserted += len(docs)
            print(f"    + inserted {len(docs)} (cell total now {inserted + (TARGET_PER_CELL - need)})", flush=True)
        else:
            # all duplicates — stop trying this cell
            break
    return inserted


async def main():
    print("Connecting to MongoDB…", flush=True)
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    cats = get_categories()
    tones = get_tones()
    langs = ["en", "fr"]

    # Build worklist
    worklist = []
    total_before = await db.icebreakers.count_documents({})
    print(f"DB total before: {total_before}", flush=True)
    for cat in cats:
        for tone in tones:
            for lang in langs:
                existing = await db.icebreakers.count_documents(
                    {"category": cat["id"], "tone": tone, "language": lang}
                )
                if existing < TARGET_PER_CELL:
                    worklist.append((cat["id"], cat["name_en"] if lang == "en" else cat["name_fr"], tone, lang, TARGET_PER_CELL - existing))
    print(f"Cells needing fill: {len(worklist)} (target {TARGET_PER_CELL}/cell)", flush=True)

    # Parallel processing in chunks (avoids semaphore deadlock issues)
    CHUNK = 6
    grand_total = 0
    for chunk_start in range(0, len(worklist), CHUNK):
        chunk = worklist[chunk_start : chunk_start + CHUNK]
        print(f"\n=== Chunk {chunk_start // CHUNK + 1}: cells {chunk_start + 1}-{chunk_start + len(chunk)} ===", flush=True)

        async def one(idx, args):
            cat_id, cat_name, tone, lang, need = args
            print(f"  [{chunk_start + idx + 1}/{len(worklist)}] {cat_id}/{tone}/{lang} (need {need})", flush=True)
            try:
                return await fill_one_cell(db, cat_id, cat_name, tone, lang, need)
            except Exception as e:
                print(f"  ! {cat_id}/{tone}/{lang} failed: {e}", flush=True)
                return 0

        results = await asyncio.gather(*(one(i, c) for i, c in enumerate(chunk)))
        grand_total += sum(results)
        print(f"=== chunk total: +{sum(results)} (grand: {grand_total}) ===", flush=True)

    total_after = await db.icebreakers.count_documents({})
    print(f"\nDone. Inserted {grand_total} new. DB total: {total_after}", flush=True)
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
