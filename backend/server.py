"""Icebreaker AI backend - FastAPI + MongoDB."""
import os
import uuid
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

import bcrypt
import jwt
import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from icebreakers_seed import build_seed_documents, get_categories, get_tones

# --------------------------- Setup ---------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("icebreaker")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")
PUBLIC_BASE_URL = os.environ.get(
    "PUBLIC_BASE_URL", "https://icebreaker-ai-2.preview.emergentagent.com"
)

stripe.api_key = STRIPE_API_KEY

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Icebreaker AI")
api = APIRouter(prefix="/api")

FREE_DAILY_AI_CALLS = 3
TRIAL_DAYS = 7


def now_utc():
    return datetime.now(timezone.utc)


# --------------------------- Models ---------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)
    language: str = "en"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class GuestIn(BaseModel):
    language: str = "en"


class GenerateIn(BaseModel):
    context: str = Field(min_length=3, max_length=600)
    location: Optional[str] = ""
    language: str = "en"


class FavoriteIn(BaseModel):
    text: str
    category: Optional[str] = None
    tone: Optional[str] = None
    language: str = "en"
    source: str = "library"


class CheckoutIn(BaseModel):
    plan: str = "monthly"


# --------------------------- Auth helpers ---------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": now_utc(),
        "exp": now_utc() + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def is_premium(user: dict) -> bool:
    if user.get("is_premium"):
        return True
    trial_ends = user.get("trial_ends_at")
    if trial_ends:
        # MongoDB returns naive datetimes; normalize to UTC-aware for comparison
        if trial_ends.tzinfo is None:
            trial_ends = trial_ends.replace(tzinfo=timezone.utc)
        if trial_ends > now_utc():
            return True
    return False


def serialize_user(user: dict) -> dict:
    today_key = now_utc().strftime("%Y-%m-%d")
    daily = user.get("ai_calls_by_day", {}).get(today_key, 0)
    trial_ends = user.get("trial_ends_at")
    premium = is_premium(user)
    return {
        "id": user["id"],
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "language": user.get("language", "en"),
        "is_guest": bool(user.get("is_guest")),
        "is_premium": premium,
        "trial_ends_at": trial_ends.isoformat() if trial_ends else None,
        "daily_ai_calls_used": daily,
        "daily_ai_calls_remaining": (
            9999 if premium else max(0, FREE_DAILY_AI_CALLS - daily)
        ),
    }


# --------------------------- Startup ---------------------------
@app.on_event("startup")
async def startup_event():
    count = await db.icebreakers.count_documents({})
    if count == 0:
        docs = build_seed_documents()
        for d in docs:
            d["id"] = str(uuid.uuid4())
            d["created_at"] = now_utc()
        if docs:
            await db.icebreakers.insert_many(docs)
        logger.info(f"Seeded {len(docs)} icebreakers")
    # Drop old email index if it exists with wrong config
    try:
        await db.users.drop_index("email_1")
    except Exception:
        pass
    await db.users.create_index(
        "email",
        unique=True,
        partialFilterExpression={"email": {"$type": "string"}},
    )
    await db.users.create_index("id", unique=True)
    await db.icebreakers.create_index("id", unique=True)
    await db.icebreakers.create_index([("category", 1), ("tone", 1), ("language", 1)])
    await db.favorites.create_index([("user_id", 1), ("created_at", -1)])
    await db.history.create_index([("user_id", 1), ("created_at", -1)])


@app.on_event("shutdown")
async def shutdown_event():
    client.close()


# --------------------------- Auth routes ---------------------------
@api.post("/auth/register")
async def register(payload: RegisterIn):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": payload.email.lower(),
        "full_name": payload.full_name,
        "password_hash": hash_password(payload.password),
        "language": payload.language if payload.language in ("en", "fr") else "en",
        "is_guest": False,
        "is_premium": False,
        "trial_ends_at": now_utc() + timedelta(days=TRIAL_DAYS),
        "ai_calls_by_day": {},
        "created_at": now_utc(),
    }
    await db.users.insert_one(user_doc)
    fresh = await db.users.find_one({"id": user_id}, {"_id": 0})
    return {
        "access_token": create_token(user_id),
        "token_type": "bearer",
        "user": serialize_user(fresh),
    }


@api.post("/auth/login")
async def login(payload: LoginIn):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user.pop("_id", None)
    return {
        "access_token": create_token(user["id"]),
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@api.post("/auth/guest")
async def guest(payload: GuestIn):
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "full_name": "Guest",
        "language": payload.language if payload.language in ("en", "fr") else "en",
        "is_guest": True,
        "is_premium": False,
        "trial_ends_at": None,
        "ai_calls_by_day": {},
        "created_at": now_utc(),
    }
    await db.users.insert_one(user_doc)
    fresh = await db.users.find_one({"id": user_id}, {"_id": 0})
    return {
        "access_token": create_token(user_id),
        "token_type": "bearer",
        "user": serialize_user(fresh),
    }


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": serialize_user(user)}


@api.post("/auth/language")
async def update_language(body: dict, user: dict = Depends(get_current_user)):
    lang = body.get("language", "en")
    if lang not in ("en", "fr"):
        raise HTTPException(status_code=400, detail="Invalid language")
    await db.users.update_one({"id": user["id"]}, {"$set": {"language": lang}})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"user": serialize_user(fresh)}


# --------------------------- Icebreaker routes ---------------------------
@api.get("/icebreakers/categories")
async def categories():
    return {"categories": get_categories(), "tones": get_tones()}


@api.get("/icebreakers/library")
async def library(
    category: Optional[str] = None,
    tone: Optional[str] = None,
    language: str = "en",
    limit: int = 50,
    skip: int = 0,
):
    query: dict = {"language": language}
    if category:
        query["category"] = category
    if tone:
        query["tone"] = tone
    cursor = db.icebreakers.find(query, {"_id": 0}).skip(skip).limit(min(limit, 200))
    items = await cursor.to_list(length=limit)
    total = await db.icebreakers.count_documents(query)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@api.get("/icebreakers/daily")
async def daily(language: str = "en", user: dict = Depends(get_current_user)):
    today = now_utc().strftime("%Y-%m-%d")
    cache_key = f"{user['id']}:{today}:{language}"
    existing = await db.daily_picks.find_one({"key": cache_key}, {"_id": 0})
    if existing:
        ib = await db.icebreakers.find_one({"id": existing["icebreaker_id"]}, {"_id": 0})
        if ib:
            return {"icebreaker": ib, "date": today}
    pipeline = [
        {"$match": {"language": language}},
        {"$sample": {"size": 1}},
        {"$project": {"_id": 0}},
    ]
    cur = db.icebreakers.aggregate(pipeline)
    picks = await cur.to_list(length=1)
    if not picks:
        raise HTTPException(status_code=404, detail="No icebreakers available")
    pick = picks[0]
    await db.daily_picks.insert_one(
        {"key": cache_key, "icebreaker_id": pick["id"], "created_at": now_utc()}
    )
    return {"icebreaker": pick, "date": today}


@api.post("/icebreakers/generate")
async def generate(payload: GenerateIn, user: dict = Depends(get_current_user)):
    today_key = now_utc().strftime("%Y-%m-%d")
    used = user.get("ai_calls_by_day", {}).get(today_key, 0)
    if not is_premium(user) and used >= FREE_DAILY_AI_CALLS:
        raise HTTPException(
            status_code=402,
            detail=f"Free tier limit reached ({FREE_DAILY_AI_CALLS}/day). Upgrade to Premium.",
        )

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    lang = payload.language if payload.language in ("en", "fr") else "en"
    if lang == "fr":
        system = (
            "Tu es un coach social expert qui crée des phrases d'accroche (icebreakers) "
            "personnalisées, créatives et adaptées au contexte. Génère EXACTEMENT 5 lignes "
            "uniques. Réponds UNIQUEMENT en JSON valide:\n"
            '{"icebreakers":[{"line":"...","tone":"funny|romantic|casual|bold|witty|sweet",'
            '"why":"courte explication"}],"tip":"conseil de livraison court"}'
        )
        user_msg = (
            f"Lieu: {payload.location or 'non précisé'}\nContexte: {payload.context}\n\n"
            "Génère 5 phrases d'accroche en français, variées en ton, contextuelles et naturelles. JSON uniquement."
        )
    else:
        system = (
            "You are an expert social coach creating personalized, creative icebreaker lines. "
            "Generate EXACTLY 5 unique lines. Respond ONLY with valid JSON:\n"
            '{"icebreakers":[{"line":"...","tone":"funny|romantic|casual|bold|witty|sweet",'
            '"why":"short reasoning"}],"tip":"short delivery tip"}'
        )
        user_msg = (
            f"Location: {payload.location or 'unspecified'}\nContext: {payload.context}\n\n"
            "Generate 5 varied icebreakers (different tones), contextual and natural. JSON only."
        )

    session_id = str(uuid.uuid4())
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    try:
        resp = await chat.send_message(UserMessage(text=user_msg))
    except Exception as e:
        logger.exception("Claude error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    text = resp if isinstance(resp, str) else str(resp)
    parsed = None
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            parsed = json.loads(text[start : end + 1])
    except Exception:
        parsed = None
    if not parsed or "icebreakers" not in parsed:
        lines = [ln.strip("- •*0123456789. ") for ln in text.split("\n") if ln.strip()][:5]
        parsed = {
            "icebreakers": [{"line": ln, "tone": "casual", "why": ""} for ln in lines if ln],
            "tip": "",
        }

    icebreakers = parsed.get("icebreakers", [])[:5]
    tip = parsed.get("tip", "")

    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {f"ai_calls_by_day.{today_key}": 1}},
    )
    history_id = str(uuid.uuid4())
    history_doc = {
        "id": history_id,
        "user_id": user["id"],
        "context": payload.context,
        "location": payload.location,
        "language": lang,
        "icebreakers": icebreakers,
        "tip": tip,
        "created_at": now_utc(),
    }
    await db.history.insert_one(history_doc)
    return {
        "id": history_id,
        "icebreakers": icebreakers,
        "tip": tip,
        "calls_remaining": (
            9999 if is_premium(user) else max(0, FREE_DAILY_AI_CALLS - used - 1)
        ),
    }


@api.get("/icebreakers/history")
async def history(user: dict = Depends(get_current_user), limit: int = 30):
    cursor = (
        db.history.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    items = await cursor.to_list(length=limit)
    return {"items": items}


@api.post("/icebreakers/favorite")
async def add_favorite(payload: FavoriteIn, user: dict = Depends(get_current_user)):
    fav = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "text": payload.text,
        "category": payload.category,
        "tone": payload.tone,
        "language": payload.language,
        "source": payload.source,
        "created_at": now_utc(),
    }
    await db.favorites.insert_one(fav)
    fav.pop("_id", None)
    return {"favorite": fav}


@api.delete("/icebreakers/favorite/{fav_id}")
async def remove_favorite(fav_id: str, user: dict = Depends(get_current_user)):
    res = await db.favorites.delete_one({"id": fav_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"ok": True}


@api.get("/icebreakers/favorites")
async def list_favorites(user: dict = Depends(get_current_user)):
    cursor = db.favorites.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    items = await cursor.to_list(length=500)
    return {"items": items}


# --------------------------- Stripe Checkout ---------------------------
PRICES = {
    "monthly": {"amount": 999, "name": "Premium Monthly"},
    "yearly": {"amount": 7999, "name": "Premium Yearly"},
}


@api.post("/checkout/session")
async def checkout_session(payload: CheckoutIn, user: dict = Depends(get_current_user)):
    if payload.plan not in PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if user.get("is_guest"):
        raise HTTPException(status_code=400, detail="Please create an account before subscribing")
    price = PRICES[payload.plan]
    success_url = f"{PUBLIC_BASE_URL}/?checkout=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{PUBLIC_BASE_URL}/?checkout=cancel"
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            customer_email=user.get("email"),
            metadata={"user_id": user["id"], "plan": payload.plan},
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Icebreaker AI - {price['name']}",
                            "description": "Unlimited AI icebreakers + live assistant",
                        },
                        "unit_amount": price["amount"],
                    },
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
        )
        await db.payments.insert_one(
            {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "plan": payload.plan,
                "amount": price["amount"],
                "session_id": session.id,
                "status": "pending",
                "created_at": now_utc(),
            }
        )
        return {"session_id": session.id, "url": session.url}
    except Exception as e:
        logger.exception("Stripe error")
        raise HTTPException(status_code=502, detail=f"Stripe error: {e}")


@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, user: dict = Depends(get_current_user)):
    try:
        s = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Stripe error: {e}")
    if s.payment_status == "paid":
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"is_premium": True, "premium_since": now_utc()}},
        )
        await db.payments.update_one(
            {"session_id": session_id}, {"$set": {"status": "paid"}}
        )
    return {"payment_status": s.payment_status}


# --------------------------- Health ---------------------------
@api.get("/")
async def root():
    return {"app": "Icebreaker AI", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
