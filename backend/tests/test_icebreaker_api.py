"""Backend API tests for Icebreaker AI.

Covers: auth (register/login/guest/me/language), icebreakers
(categories/library/daily/generate/favorites/history), checkout, health,
free-tier limits, MongoDB _id sanitization, and language switching.

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
    def test_guest_creates_user_with_3_calls_remaining(self):
        r = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        _no_underscore_id(data)
        assert "access_token" in data and data["token_type"] == "bearer"
        u = data["user"]
        assert u["is_guest"] is True
        assert u["is_premium"] is False
        assert u["language"] == "en"
        assert u["daily_ai_calls_remaining"] == 3
        # Guest has no email field set
        assert u.get("email") in (None, "")


# --------------------------- Auth: Register/Login ---------------------------
class TestAuthRegisterLogin:
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

    def test_register_returns_trial_premium(self, registered):
        _no_underscore_id(registered)
        assert "access_token" in registered
        u = registered["user"]
        assert u["email"]
        assert u["is_premium"] is True, "Trial user should be premium"
        assert u["trial_ends_at"], "trial_ends_at should be set"
        # Trial should be ~7 days in future
        from datetime import datetime, timezone
        raw = u["trial_ends_at"].replace("Z", "+00:00")
        trial = datetime.fromisoformat(raw)
        if trial.tzinfo is None:
            trial = trial.replace(tzinfo=timezone.utc)
        delta_days = (trial - datetime.now(timezone.utc)).days
        assert 6 <= delta_days <= 7, f"Trial ends in {delta_days} days, expected 7"

    def test_login_returns_same_user(self, creds, registered):
        r = requests.post(
            f"{API}/auth/login",
            json={"email": creds["email"], "password": creds["password"]},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["id"] == registered["user"]["id"]
        assert data["user"]["email"] == creds["email"].lower()

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


# --------------------------- Auth: /me + /language ---------------------------
class TestAuthMe:
    def test_me_with_token(self, registered_user):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {registered_user['token']}"},
            timeout=15,
        )
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert data["user"]["id"] == registered_user["user"]["id"]

    def test_me_without_token_returns_401(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_bad_token_returns_401(self):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer not-a-valid-token"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_update_language_to_fr(self, registered_user):
        token = registered_user["token"]
        r = requests.post(
            f"{API}/auth/language",
            headers={"Authorization": f"Bearer {token}"},
            json={"language": "fr"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json()["user"]["language"] == "fr"
        # Verify persistence via /me
        r2 = requests.get(
            f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=15
        )
        assert r2.json()["user"]["language"] == "fr"
        # Reset back to en
        requests.post(
            f"{API}/auth/language",
            headers={"Authorization": f"Bearer {token}"},
            json={"language": "en"},
            timeout=15,
        )

    def test_update_language_invalid(self, registered_user):
        r = requests.post(
            f"{API}/auth/language",
            headers={"Authorization": f"Bearer {registered_user['token']}"},
            json={"language": "es"},
            timeout=15,
        )
        assert r.status_code == 400


# --------------------------- Icebreakers: Categories/Library ---------------------------
class TestCategoriesLibrary:
    def test_categories_returns_15_and_6_tones(self):
        r = requests.get(f"{API}/icebreakers/categories", timeout=15)
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert "categories" in data and "tones" in data
        assert len(data["categories"]) == 15, f"Got {len(data['categories'])} categories"
        assert len(data["tones"]) == 6, f"Got {len(data['tones'])} tones"

    def test_library_en_has_items(self):
        r = requests.get(f"{API}/icebreakers/library?language=en&limit=200", timeout=20)
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        # Expect ~270 items in EN
        assert data["total"] >= 200, f"EN total={data['total']}, expected >=200"
        assert len(data["items"]) > 0
        # Ensure each item has required fields
        sample = data["items"][0]
        assert "text" in sample and "category" in sample and "tone" in sample
        assert "_id" not in sample

    def test_library_fr_has_items(self):
        r = requests.get(f"{API}/icebreakers/library?language=fr&limit=200", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 200, f"FR total={data['total']}, expected >=200"
        # Verify all items are in FR
        for it in data["items"][:5]:
            assert it["language"] == "fr"

    def test_library_filter_by_category(self):
        r = requests.get(
            f"{API}/icebreakers/library?language=en&category=beach&limit=200", timeout=20
        )
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        for it in data["items"]:
            assert it["category"] == "beach"

    def test_library_filter_by_tone(self):
        r = requests.get(
            f"{API}/icebreakers/library?language=en&tone=funny&limit=200", timeout=20
        )
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        for it in data["items"]:
            assert it["tone"] == "funny"


# --------------------------- Icebreakers: Daily ---------------------------
class TestDaily:
    def test_daily_requires_auth(self):
        r = requests.get(f"{API}/icebreakers/daily?language=en", timeout=15)
        assert r.status_code == 401

    def test_daily_is_deterministic_per_user_per_day(self, registered_user):
        h = {"Authorization": f"Bearer {registered_user['token']}"}
        r1 = requests.get(f"{API}/icebreakers/daily?language=en", headers=h, timeout=15)
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        _no_underscore_id(d1)
        assert "icebreaker" in d1 and "id" in d1["icebreaker"]
        r2 = requests.get(f"{API}/icebreakers/daily?language=en", headers=h, timeout=15)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d1["icebreaker"]["id"] == d2["icebreaker"]["id"], (
            "Daily must be cached/deterministic for same user/day/language"
        )


# --------------------------- Icebreakers: Generate (AI) ---------------------------
class TestGenerate:
    """AI generate endpoint - calls Claude Sonnet 4.5; takes 8-15s."""

    def test_generate_with_registered_user_returns_5(self, registered_user):
        h = {"Authorization": f"Bearer {registered_user['token']}"}
        payload = {
            "context": "2 Canadians on vacation wanting to talk to 3 girls; one wears a black hat",
            "location": "Beach in Mexico",
            "language": "en",
        }
        r = requests.post(
            f"{API}/icebreakers/generate", headers=h, json=payload, timeout=60
        )
        assert r.status_code == 200, r.text
        data = r.json()
        _no_underscore_id(data)
        assert "icebreakers" in data
        assert len(data["icebreakers"]) == 5, f"Got {len(data['icebreakers'])}"
        for ib in data["icebreakers"]:
            assert ib.get("line"), "Each icebreaker must have a 'line'"
        assert "tip" in data
        # Premium (trial) user has 9999 calls remaining
        assert data["calls_remaining"] >= 9998

    def test_generate_appears_in_history(self, registered_user):
        h = {"Authorization": f"Bearer {registered_user['token']}"}
        r = requests.get(f"{API}/icebreakers/history", headers=h, timeout=15)
        assert r.status_code == 200
        data = r.json()
        _no_underscore_id(data)
        assert "items" in data
        assert len(data["items"]) >= 1, "History should contain prior generate call"
        # most recent first - should match the last context
        latest = data["items"][0]
        assert "Canadians" in latest["context"] or len(latest["icebreakers"]) > 0


class TestGenerateGuestQuota:
    """Verify free tier 3 calls/day limit triggers 402 on 4th call."""

    def test_guest_4th_generate_returns_402(self):
        # Create a fresh guest
        gr = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=15)
        assert gr.status_code == 200
        token = gr.json()["access_token"]
        h = {"Authorization": f"Bearer {token}"}
        payload = {"context": "Quick test ctx for limit check", "language": "en"}

        successes = 0
        last_remaining = None
        for i in range(3):
            r = requests.post(
                f"{API}/icebreakers/generate", headers=h, json=payload, timeout=60
            )
            if r.status_code == 200:
                successes += 1
                last_remaining = r.json().get("calls_remaining")
            else:
                pytest.fail(
                    f"Guest call #{i + 1} unexpectedly failed: {r.status_code} {r.text}"
                )
            time.sleep(0.5)
        assert successes == 3
        assert last_remaining == 0, f"Expected 0 remaining after 3rd call, got {last_remaining}"

        # 4th call must be blocked
        r4 = requests.post(
            f"{API}/icebreakers/generate", headers=h, json=payload, timeout=15
        )
        assert r4.status_code == 402, f"Expected 402, got {r4.status_code}: {r4.text}"
        detail = r4.json().get("detail", "")
        assert "Premium" in detail or "premium" in detail


# --------------------------- Favorites ---------------------------
class TestFavorites:
    def test_favorite_lifecycle(self, registered_user):
        h = {"Authorization": f"Bearer {registered_user['token']}"}
        # Add
        body = {
            "text": "TEST_Hey, that black hat is a power move.",
            "category": "beach",
            "tone": "witty",
            "language": "en",
            "source": "library",
        }
        r = requests.post(
            f"{API}/icebreakers/favorite", headers=h, json=body, timeout=15
        )
        assert r.status_code == 200, r.text
        data = r.json()
        _no_underscore_id(data)
        fav_id = data["favorite"]["id"]
        assert data["favorite"]["text"] == body["text"]

        # List
        r2 = requests.get(f"{API}/icebreakers/favorites", headers=h, timeout=15)
        assert r2.status_code == 200
        items = r2.json()["items"]
        _no_underscore_id(items)
        assert any(it["id"] == fav_id for it in items)

        # Delete
        r3 = requests.delete(
            f"{API}/icebreakers/favorite/{fav_id}", headers=h, timeout=15
        )
        assert r3.status_code == 200
        assert r3.json().get("ok") is True

        # Verify gone
        r4 = requests.get(f"{API}/icebreakers/favorites", headers=h, timeout=15)
        assert all(it["id"] != fav_id for it in r4.json()["items"])

        # Delete again -> 404
        r5 = requests.delete(
            f"{API}/icebreakers/favorite/{fav_id}", headers=h, timeout=15
        )
        assert r5.status_code == 404


# --------------------------- Stripe Checkout ---------------------------
class TestCheckout:
    def test_guest_cannot_checkout(self, guest_session):
        h = {"Authorization": f"Bearer {guest_session['token']}"}
        r = requests.post(
            f"{API}/checkout/session", headers=h, json={"plan": "monthly"}, timeout=20
        )
        assert r.status_code == 400, r.text
        assert "account" in r.json().get("detail", "").lower()

    def test_registered_user_checkout_returns_session(self, registered_user):
        h = {"Authorization": f"Bearer {registered_user['token']}"}
        r = requests.post(
            f"{API}/checkout/session", headers=h, json={"plan": "monthly"}, timeout=30
        )
        assert r.status_code == 200, r.text
        data = r.json()
        _no_underscore_id(data)
        assert data.get("session_id"), "Missing session_id"
        assert data.get("url", "").startswith("https://"), f"Bad url: {data.get('url')}"

    def test_invalid_plan_returns_400(self, registered_user):
        h = {"Authorization": f"Bearer {registered_user['token']}"}
        r = requests.post(
            f"{API}/checkout/session", headers=h, json={"plan": "weekly"}, timeout=15
        )
        assert r.status_code == 400
