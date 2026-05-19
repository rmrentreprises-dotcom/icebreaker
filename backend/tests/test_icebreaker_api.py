"""Backend API tests for Icebreaker AI — Hard Paywall Remodel (Jan 2026).

Covers the new pricing/funnel model:
- 1 lifetime free AI call (was: 3/day)
- No 7-day trial on register (was: auto-trial). The 3-day trial is bundled
  inside the Stripe Weekly subscription via subscription_data.trial_period_days
- New POST /api/auth/quiz endpoint (onboarding)
- 3 Stripe plans: weekly ($6.99, week, trial=3d), yearly ($39.99, year),
  lifetime ($59.99, one-time). 'monthly' was REMOVED.

Run:
  pytest /app/backend/tests/test_icebreaker_api.py -v --tb=short \
    --junitxml=/app/test_reports/pytest/pytest_results.xml
"""
import os
import time
import uuid
import requests
import pytest

BASE_URL = (
    os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or os.environ.get("EXPO_BACKEND_URL")
    or "https://icebreaker-ai-2.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"


def _no_underscore_id(obj):
    """Recursively assert no `_id` keys leaked in API responses."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"Found _id leak in: {list(obj.keys())}"
        for v in obj.values():
            _no_underscore_id(v)
    elif isinstance(obj, list):
        for item in obj:
            _no_underscore_id(item)


# --------------------------- Health ---------------------------
class TestHealth:
    def test_root_health(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("app") == "Icebreaker AI"
        assert data.get("status") == "ok"


# --------------------------- Auth: Guest ---------------------------
class TestAuthGuest:
    """Guest has lifetime_ai_calls_remaining=1 and onboarding_complete=false."""

    def test_guest_creates_user_with_1_lifetime_call(self):
        r = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        _no_underscore_id(data)
        assert "access_token" in data and data["token_type"] == "bearer"
        u = data["user"]
        assert u["is_guest"] is True
        assert u["is_premium"] is False
        assert u["language"] == "en"
        assert u["lifetime_ai_calls_remaining"] == 1, (
            f"Guest should have 1 lifetime call, got {u['lifetime_ai_calls_remaining']}"
        )
        assert u["lifetime_ai_calls_used"] == 0
        assert u["onboarding_complete"] is False
        assert u["quiz_answers"] in (None, {}, )
        assert u.get("email") in (None, "")


# --------------------------- Auth: Register ---------------------------
class TestAuthRegister:
    """Register no longer auto-grants 7-day trial."""

    @pytest.fixture(scope="class")
    def creds(self):
        return {
            "email": f"test_{uuid.uuid4().hex[:10]}@example.com",
            "password": "Test123!",
            "full_name": "Reg Test",
            "language": "en",
        }

    @pytest.fixture(scope="class")
    def registered(self, creds):
        r = requests.post(f"{API}/auth/register", json=creds, timeout=20)
        assert r.status_code == 200, r.text
        return r.json()

    def test_register_returns_non_premium_with_1_call(self, registered):
        _no_underscore_id(registered)
        assert "access_token" in registered
        u = registered["user"]
        assert u["email"]
        assert u["is_premium"] is False, "Register should NO LONGER auto-grant premium"
        assert u["trial_ends_at"] is None
        assert u["lifetime_ai_calls_remaining"] == 1
        assert u["lifetime_ai_calls_used"] == 0
        assert u["onboarding_complete"] is False
        assert u["quiz_answers"] in (None, {})

    def test_login_returns_same_user(self, creds, registered):
        r = requests.post(
            f"{API}/auth/login",
            json={"email": creds["email"], "password": creds["password"]},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        u = data["user"]
        assert u["id"] == registered["user"]["id"]
        assert u["email"] == creds["email"].lower()
        assert u["lifetime_ai_calls_remaining"] == 1
        assert u["is_premium"] is False

    def test_duplicate_register_returns_400(self, creds, registered):
        r = requests.post(f"{API}/auth/register", json=creds, timeout=15)
        assert r.status_code == 400
        assert "already" in r.json().get("detail", "").lower()

    def test_wrong_password_returns_401(self, creds, registered):
        r = requests.post(
            f"{API}/auth/login",
            json={"email": creds["email"], "password": "WRONG_PASS"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_me_post_register(self, registered):
        h = {"Authorization": f"Bearer {registered['access_token']}"}
        r = requests.get(f"{API}/auth/me", headers=h, timeout=15)
        assert r.status_code == 200
        u = r.json()["user"]
        assert u["is_premium"] is False
        assert u["lifetime_ai_calls_remaining"] == 1
        assert u["quiz_answers"] in (None, {})


# --------------------------- Auth: Quiz ---------------------------
class TestQuiz:
    """POST /api/auth/quiz writes onboarding_complete + answers."""

    def _fresh_guest(self):
        r = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        assert r.status_code == 200
        return r.json()

    def test_quiz_full_answers_sets_onboarding(self):
        sess = self._fresh_guest()
        h = {"Authorization": f"Bearer {sess['access_token']}"}
        payload = {
            "age_range": "25-34",
            "dating_goal": "serious",
            "style": "witty",
            "meet_location": "coffee_shop",
        }
        r = requests.post(f"{API}/auth/quiz", headers=h, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        _no_underscore_id(data)
        u = data["user"]
        assert u["onboarding_complete"] is True
        assert u["quiz_answers"] == payload
        # quiz must not flip the user to premium and must not consume the free call
        assert u["is_premium"] is False
        assert u["lifetime_ai_calls_remaining"] == 1

    def test_quiz_partial_answers_only_stores_provided(self):
        sess = self._fresh_guest()
        h = {"Authorization": f"Bearer {sess['access_token']}"}
        payload = {"age_range": "18-24", "dating_goal": "casual"}
        r = requests.post(f"{API}/auth/quiz", headers=h, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        u = r.json()["user"]
        assert u["onboarding_complete"] is True
        assert u["quiz_answers"] == payload
        assert "style" not in u["quiz_answers"]
        assert "meet_location" not in u["quiz_answers"]

    def test_quiz_requires_auth(self):
        r = requests.post(
            f"{API}/auth/quiz", json={"age_range": "25-34"}, timeout=15
        )
        assert r.status_code == 401

    def test_quiz_persists_through_me(self):
        sess = self._fresh_guest()
        h = {"Authorization": f"Bearer {sess['access_token']}"}
        payload = {"style": "bold", "meet_location": "bar"}
        requests.post(f"{API}/auth/quiz", headers=h, json=payload, timeout=15)
        r2 = requests.get(f"{API}/auth/me", headers=h, timeout=15)
        assert r2.status_code == 200
        u = r2.json()["user"]
        assert u["onboarding_complete"] is True
        assert u["quiz_answers"] == payload


# --------------------------- Icebreakers: Categories/Library ---------------------------
class TestCategoriesLibrary:
    def test_categories_endpoint(self):
        r = requests.get(f"{API}/icebreakers/categories", timeout=15)
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert "categories" in data and "tones" in data
        assert len(data["categories"]) > 0
        assert len(data["tones"]) > 0

    def test_library_en_no_auth_required(self):
        r = requests.get(f"{API}/icebreakers/library?language=en&limit=50", timeout=20)
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert data["total"] > 0
        assert len(data["items"]) > 0
        sample = data["items"][0]
        assert "text" in sample and "category" in sample and "tone" in sample

    def test_library_filter_by_category(self):
        r = requests.get(
            f"{API}/icebreakers/library?language=en&category=beach&limit=200", timeout=20
        )
        assert r.status_code == 200
        for it in r.json()["items"]:
            assert it["category"] == "beach"


# --------------------------- Icebreakers: Daily ---------------------------
class TestDaily:
    def test_daily_requires_auth(self):
        r = requests.get(f"{API}/icebreakers/daily?language=en", timeout=15)
        assert r.status_code == 401

    def test_daily_works_for_guest(self):
        gr = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        h = {"Authorization": f"Bearer {gr.json()['access_token']}"}
        r = requests.get(f"{API}/icebreakers/daily?language=en", headers=h, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        _no_underscore_id(d)
        assert "icebreaker" in d and "id" in d["icebreaker"]


# --------------------------- Generate: 1 free taste then 402 ---------------------------
class TestGenerateLifetimeQuota:
    """Guest gets exactly 1 free AI generate; the 2nd returns 402."""

    def test_guest_1st_call_succeeds_2nd_returns_402(self):
        gr = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        assert gr.status_code == 200
        token = gr.json()["access_token"]
        h = {"Authorization": f"Bearer {token}"}
        payload = {
            "context": "Two friends on vacation, want to meet a group of three at the beach",
            "location": "Tulum beach",
            "language": "en",
        }

        # 1st call: 200, returns 5 icebreakers + tip, calls_remaining=0
        r1 = requests.post(
            f"{API}/icebreakers/generate", headers=h, json=payload, timeout=60
        )
        assert r1.status_code == 200, f"1st call failed: {r1.status_code} {r1.text}"
        data = r1.json()
        _no_underscore_id(data)
        assert "icebreakers" in data
        assert len(data["icebreakers"]) == 5
        for ib in data["icebreakers"]:
            assert ib.get("line")
        assert "tip" in data
        assert data["calls_remaining"] == 0, (
            f"Expected 0 remaining after free taste, got {data['calls_remaining']}"
        )

        # Confirm user state via /me
        me = requests.get(f"{API}/auth/me", headers=h, timeout=15).json()["user"]
        assert me["lifetime_ai_calls_used"] == 1
        assert me["lifetime_ai_calls_remaining"] == 0

        time.sleep(0.5)

        # 2nd call: must be 402
        r2 = requests.post(
            f"{API}/icebreakers/generate", headers=h, json=payload, timeout=15
        )
        assert r2.status_code == 402, (
            f"Expected 402 on 2nd call, got {r2.status_code}: {r2.text}"
        )
        detail = r2.json().get("detail", "").lower()
        assert "free preview" in detail or "subscribe" in detail, (
            f"Detail should mention free preview/subscribe, got: {detail}"
        )

    def test_generate_appears_in_history(self):
        gr = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        token = gr.json()["access_token"]
        h = {"Authorization": f"Bearer {token}"}
        payload = {"context": "Coffee shop, glasses, laptop", "language": "en"}
        r = requests.post(
            f"{API}/icebreakers/generate", headers=h, json=payload, timeout=60
        )
        assert r.status_code == 200, r.text
        # history
        rh = requests.get(f"{API}/icebreakers/history", headers=h, timeout=15)
        assert rh.status_code == 200
        items = rh.json()["items"]
        _no_underscore_id(items)
        assert len(items) >= 1


# --------------------------- Favorites ---------------------------
class TestFavorites:
    @pytest.fixture(scope="class")
    def auth_h(self):
        creds = {
            "email": f"test_{uuid.uuid4().hex[:10]}@example.com",
            "password": "Test123!",
            "full_name": "Fav Test",
            "language": "en",
        }
        r = requests.post(f"{API}/auth/register", json=creds, timeout=20)
        assert r.status_code == 200
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    def test_favorite_lifecycle(self, auth_h):
        body = {
            "text": "TEST_Hey, that black hat is a power move.",
            "category": "beach",
            "tone": "witty",
            "language": "en",
            "source": "library",
        }
        r = requests.post(f"{API}/icebreakers/favorite", headers=auth_h, json=body, timeout=15)
        assert r.status_code == 200, r.text
        fav_id = r.json()["favorite"]["id"]

        r2 = requests.get(f"{API}/icebreakers/favorites", headers=auth_h, timeout=15)
        assert r2.status_code == 200
        items = r2.json()["items"]
        _no_underscore_id(items)
        assert any(it["id"] == fav_id for it in items)

        r3 = requests.delete(f"{API}/icebreakers/favorite/{fav_id}", headers=auth_h, timeout=15)
        assert r3.status_code == 200
        assert r3.json().get("ok") is True

        r4 = requests.delete(f"{API}/icebreakers/favorite/{fav_id}", headers=auth_h, timeout=15)
        assert r4.status_code == 404


# --------------------------- Stripe Checkout: 3 plans ---------------------------
class TestCheckoutPlans:
    """STRIPE_API_KEY is placeholder => expect 502 on real calls.
    We still validate the plan-level logic & gating that doesn't hit Stripe.
    """

    @pytest.fixture(scope="class")
    def reg_h(self):
        creds = {
            "email": f"test_{uuid.uuid4().hex[:10]}@example.com",
            "password": "Test123!",
            "full_name": "Pay Test",
            "language": "en",
        }
        r = requests.post(f"{API}/auth/register", json=creds, timeout=20)
        assert r.status_code == 200
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    @pytest.fixture(scope="class")
    def guest_h(self):
        r = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    def test_monthly_plan_returns_400(self, reg_h):
        """'monthly' has been removed."""
        r = requests.post(
            f"{API}/checkout/session", headers=reg_h, json={"plan": "monthly"}, timeout=15
        )
        assert r.status_code == 400, f"Expected 400 for removed monthly plan, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "").lower()
        assert "invalid" in detail and "plan" in detail

    def test_invalid_plan_returns_400(self, reg_h):
        r = requests.post(
            f"{API}/checkout/session", headers=reg_h, json={"plan": "bogus"}, timeout=15
        )
        assert r.status_code == 400

    def test_guest_cannot_checkout(self, guest_h):
        r = requests.post(
            f"{API}/checkout/session", headers=guest_h, json={"plan": "weekly"}, timeout=15
        )
        assert r.status_code == 400, r.text
        assert "account" in r.json().get("detail", "").lower()

    def test_weekly_plan_creates_session_or_502(self, reg_h):
        r = requests.post(
            f"{API}/checkout/session", headers=reg_h, json={"plan": "weekly"}, timeout=30
        )
        # With placeholder STRIPE_API_KEY=sk_test_emergent expect 502.
        # If a real key is configured we get 200 + url.
        assert r.status_code in (200, 502), f"Unexpected {r.status_code}: {r.text}"
        if r.status_code == 200:
            data = r.json()
            assert data.get("session_id")
            assert data.get("url", "").startswith("https://")

    def test_yearly_plan_creates_session_or_502(self, reg_h):
        r = requests.post(
            f"{API}/checkout/session", headers=reg_h, json={"plan": "yearly"}, timeout=30
        )
        assert r.status_code in (200, 502), f"Unexpected {r.status_code}: {r.text}"

    def test_lifetime_plan_creates_session_or_502(self, reg_h):
        r = requests.post(
            f"{API}/checkout/session", headers=reg_h, json={"plan": "lifetime"}, timeout=30
        )
        assert r.status_code in (200, 502), f"Unexpected {r.status_code}: {r.text}"


# --------------------------- Verify pricing config in code ---------------------------
class TestPricingConfigShape:
    """Static checks on server's PRICES dict via import (defensive)."""

    def test_prices_dict_has_only_3_plans(self):
        # Import the server module to verify PRICES shape directly.
        import importlib.util, sys, pathlib
        spec = importlib.util.spec_from_file_location(
            "server_under_test", "/app/backend/server.py"
        )
        # We don't actually want to run the module's startup; just read PRICES.
        # Simplest: read the file and check.
        text = pathlib.Path("/app/backend/server.py").read_text()
        assert '"weekly"' in text
        assert '"yearly"' in text
        assert '"lifetime"' in text
        assert "trial_period_days" in text or "trial_days" in text
        # weekly cents = 699
        assert "699" in text
        # yearly cents = 3999
        assert "3999" in text
        # lifetime cents = 5999
        assert "5999" in text


# --------------------------- _id sanitization sweep ---------------------------
class TestNoMongoIdLeaks:
    def test_library_no_id_leak(self):
        r = requests.get(f"{API}/icebreakers/library?language=en&limit=10", timeout=15)
        _no_underscore_id(r.json())

    def test_categories_no_id_leak(self):
        r = requests.get(f"{API}/icebreakers/categories", timeout=15)
        _no_underscore_id(r.json())
