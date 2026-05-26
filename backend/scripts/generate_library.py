"""One-time backfill: generate ~10,000 curated icebreakers and store them in MongoDB.

Idempotent + resumable: for every (category, tone, language) cell, count what's already
in the DB and only generate the delta to reach TARGET_PER_CELL.

Run from /app/backend:
    python -m scripts.generate_library

This uses the same Claude Sonnet 4.5 + emergentintegrations path as the live assistant,
BUT only for this one-time content backfill — runtime library reads from MongoDB and
never calls the LLM. Cost estimate: ~180 LLM calls × ~$0.005 = ~$0.90 total.
"""
import os
import sys
import json
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path

# Make `icebreakers_seed` importable when running as a script
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from icebreakers_seed import get_categories, get_tones  # noqa: E402

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

TARGET_PER_CELL = 56  # 15 cats × 6 tones × 2 langs × 56 ≈ 10,080
BATCH_SIZE = 50  # lines per LLM call
CONCURRENCY = 16  # parallel LLM calls

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("backfill")


def now_utc():
    return datetime.now(timezone.utc)


# ------------------------- Prompts -------------------------

TONE_GUIDE = {
    "funny": {
        "en": "Light, observational humor. Self-deprecating or playful. No corny pickup lines.",
        "fr": "Humour léger, observation, autodérision. Pas de blague ringarde.",
    },
    "romantic": {
        "en": "Sincere, warm, slightly poetic. Confident, not desperate. Avoid clichés.",
        "fr": "Sincère, chaleureux, un peu poétique. Confiant, pas désespéré.",
    },
    "casual": {
        "en": "Conversational, low-stakes. Like asking a stranger a normal question.",
        "fr": "Conversationnel, anodin. Comme une vraie question à un inconnu.",
    },
    "bold": {
        "en": "Direct, confident, slightly daring. Not aggressive — assertive and warm.",
        "fr": "Direct, confiant, un peu osé. Pas agressif — assertif et chaleureux.",
    },
    "witty": {
        "en": "Clever wordplay, smart observations. Quick and a bit unexpected.",
        "fr": "Jeu de mots intelligent, observations malicieuses. Vif et inattendu.",
    },
    "sweet": {
        "en": "Genuine compliments, kindness, warmth. No flirty undertone needed.",
        "fr": "Compliments sincères, gentillesse, chaleur. Pas forcément flirt.",
    },
}


def build_prompt(category_id: str, category_name: str, tone: str, lang: str, n: int) -> tuple[str, str]:
    """Return (system, user) prompts for one batch."""
    tone_desc = TONE_GUIDE[tone][lang]
    if lang == "fr":
        system = (
            "Tu es un coach social expert. Tu écris des phrases d'accroche (icebreakers) "
            "naturelles, créatives, variées et adaptées au contexte exact. Aucune phrase "
            "ringarde, aucun cliché. Chaque ligne doit pouvoir être dite à voix haute "
            "sans gêne. RÉPONDS UNIQUEMENT en JSON valide:\n"
            '{"lines": ["...", "...", ...]}'
        )
        user = (
            f"Lieu : {category_name}\n"
            f"Ton : {tone} — {tone_desc}\n"
            f"Génère exactement {n} icebreakers DIFFÉRENTS en français pour ce lieu et ce ton.\n"
            f"Règles :\n"
            f"- Chaque ligne entre 1 et 2 phrases, naturelle, conversationnelle.\n"
            f"- Pas de '\"' ni d'emoji.\n"
            f"- Aucune répétition, aucune variation triviale.\n"
            f"- Mélange : observations, questions, compliments, scénarios.\n"
            f"- Réponds UNIQUEMENT avec le JSON {{\"lines\": [...]}}."
        )
    else:
        system = (
            "You are an expert social coach. You write natural, creative, varied "
            "icebreaker lines tailored to a specific context. No corny lines, no clichés. "
            "Every line must be sayable out loud without cringing. RESPOND ONLY with "
            "valid JSON:\n"
            '{"lines": ["...", "...", ...]}'
        )
        user = (
            f"Setting: {category_name}\n"
            f"Tone: {tone} — {tone_desc}\n"
            f"Generate exactly {n} DIFFERENT icebreakers in English for this setting and tone.\n"
            f"Rules:\n"
            f"- Each line 1–2 sentences, natural, conversational.\n"
            f"- No quotes, no emojis.\n"
            f"- No repeats, no trivial variations.\n"
            f"- Mix: observations, questions, compliments, scenarios.\n"
            f"- Respond ONLY with JSON {{\"lines\": [...]}}."
        )
    return system, user


# ------------------------- LLM call -------------------------

async def generate_batch(category_id: str, category_name: str, tone: str, lang: str, n: int) -> list[str]:
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system, user_msg = build_prompt(category_id, category_name, tone, lang, n)
    session_id = str(uuid.uuid4())
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        resp = await asyncio.wait_for(chat.send_message(UserMessage(text=user_msg)), timeout=90)
    except Exception as e:
        log.warning(f"[{category_id}/{tone}/{lang}] LLM error: {e}")
        return []

    text = resp if isinstance(resp, str) else str(resp)
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start < 0 or end < 0:
            return []
        parsed = json.loads(text[start : end + 1])
        lines = parsed.get("lines", [])
        # Clean
        out = []
        seen = set()
        for line in lines:
            if not isinstance(line, str):
                continue
            s = line.strip().strip('"').strip("'").strip("- ").strip("• ").strip()
            if not s or len(s) < 8 or len(s) > 280:
                continue
            key = s.lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(s)
        return out
    except Exception as e:
        log.warning(f"[{category_id}/{tone}/{lang}] parse error: {e}")
        return []


# ------------------------- Backfill driver -------------------------

async def backfill():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    categories = get_categories()
    tones = get_tones()
    langs = ["en", "fr"]

    # Build the list of cells that still need lines.
    cells_to_fill = []
    for cat in categories:
        for tone in tones:
            for lang in langs:
                existing = await db.icebreakers.count_documents(
                    {"category": cat["id"], "tone": tone, "language": lang}
                )
                deficit = TARGET_PER_CELL - existing
                if deficit > 0:
                    cells_to_fill.append(
                        {
                            "category_id": cat["id"],
                            "category_name": cat["name_en"] if lang == "en" else cat["name_fr"],
                            "tone": tone,
                            "language": lang,
                            "deficit": deficit,
                        }
                    )

    total_target = sum(c["deficit"] for c in cells_to_fill)
    log.info(
        f"Plan: {len(cells_to_fill)} cells need fill, total lines to generate ≈ {total_target}"
    )
    if not cells_to_fill:
        log.info("Library already at target. Nothing to do.")
        await client.close()
        return

    sem = asyncio.Semaphore(CONCURRENCY)
    inserted_total = 0

    async def fill_cell(cell):
        nonlocal inserted_total
        remaining = cell["deficit"]
        attempts = 0
        while remaining > 0 and attempts < 4:
            attempts += 1
            n = min(BATCH_SIZE, remaining)
            async with sem:
                print(
                    f"→ [{cell['category_id']}/{cell['tone']}/{cell['language']}] "
                    f"asking for {n} (need {remaining}, attempt {attempts})",
                    flush=True,
                )
                try:
                    lines = await generate_batch(
                        cell["category_id"], cell["category_name"], cell["tone"], cell["language"], n
                    )
                except Exception as e:
                    print(f"  ! generate_batch raised: {e}", flush=True)
                    lines = []
            print(
                f"  [{cell['category_id']}/{cell['tone']}/{cell['language']}] got {len(lines)} lines",
                flush=True,
            )
            if not lines:
                await asyncio.sleep(1.5)
                continue
            # De-dupe vs DB before insert
            try:
                existing_texts = set()
                async for d in db.icebreakers.find(
                    {
                        "category": cell["category_id"],
                        "tone": cell["tone"],
                        "language": cell["language"],
                    },
                    {"_id": 0, "text": 1},
                ):
                    existing_texts.add(d["text"].lower())
            except Exception as e:
                print(f"  ! dedup query failed: {e}", flush=True)
                existing_texts = set()
            docs = []
            for line in lines:
                if line.lower() in existing_texts:
                    continue
                docs.append(
                    {
                        "id": str(uuid.uuid4()),
                        "category": cell["category_id"],
                        "tone": cell["tone"],
                        "language": cell["language"],
                        "text": line,
                        "source": "ai_backfill",
                        "created_at": now_utc(),
                    }
                )
                existing_texts.add(line.lower())
                if len(docs) >= remaining:
                    break
            print(
                f"  [{cell['category_id']}/{cell['tone']}/{cell['language']}] "
                f"after dedup: {len(docs)} new docs (had {len(existing_texts) - len(docs)} existing)",
                flush=True,
            )
            if docs:
                try:
                    await db.icebreakers.insert_many(docs)
                    inserted_total += len(docs)
                    remaining -= len(docs)
                    print(
                        f"  + inserted {len(docs)} into [{cell['category_id']}/{cell['tone']}/"
                        f"{cell['language']}] (remaining for cell: {remaining})",
                        flush=True,
                    )
                except Exception as e:
                    print(f"  ! insert_many failed: {e}", flush=True)
                    break
            else:
                break

    await asyncio.gather(*(fill_cell(c) for c in cells_to_fill))

    final = await db.icebreakers.count_documents({})
    log.info(f"DONE. Inserted ≈ {inserted_total}. Total icebreakers in DB: {final}")
    await client.close()


if __name__ == "__main__":
    asyncio.run(backfill())
