"""Pytest fixtures for Icebreaker AI backend tests."""
import os
import uuid
import pytest
import requests

BASE_URL = (
    os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or os.environ.get("EXPO_BACKEND_URL")
    or "https://icebreaker-ai-2.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def api_url():
    return API


@pytest.fixture
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def fresh_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"


@pytest.fixture(scope="session")
def registered_user(fresh_email):
    """Register a fresh user once per session and return token+user dict."""
    payload = {
        "email": fresh_email,
        "password": "Test123!",
        "full_name": "Test User",
        "language": "en",
    }
    r = requests.post(f"{API}/auth/register", json=payload, timeout=30)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"token": data["access_token"], "user": data["user"], "password": "Test123!", "email": fresh_email}


@pytest.fixture
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}


@pytest.fixture
def guest_session():
    """Create a fresh guest user session."""
    r = requests.post(f"{API}/auth/guest", json={"language": "en"}, timeout=30)
    assert r.status_code == 200, f"Guest creation failed: {r.text}"
    data = r.json()
    return {"token": data["access_token"], "user": data["user"]}
