"""
Quick smoke test for Phase 4 auth endpoints.
Run after restarting the uvicorn server.

Usage (from e:\\Signal):
    e:\\.venv\\Scripts\\python backend\\smoke_test_auth.py
"""

import json
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8000"
PASS = "[PASS]"
FAIL = "[FAIL]"


def post(path, payload, headers=None, cookies=None):
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    if cookies:
        h["Cookie"] = "; ".join(f"{k}={v}" for k, v in cookies.items())
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(payload).encode(),
        headers=h,
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    return resp, json.loads(resp.read())


def get(path, cookies=None):
    h = {}
    if cookies:
        h["Cookie"] = "; ".join(f"{k}={v}" for k, v in cookies.items())
    req = urllib.request.Request(f"{BASE}{path}", headers=h, method="GET")
    resp = urllib.request.urlopen(req)
    return resp, json.loads(resp.read())


def extract_cookie(resp, name="access_token"):
    raw = resp.headers.get("Set-Cookie", "")
    for part in raw.split(";"):
        part = part.strip()
        if part.startswith(f"{name}="):
            return part.split("=", 1)[1]
    return None


errors = 0


def check(label, cond, detail=""):
    global errors
    icon = PASS if cond else FAIL
    print(f"  {icon}  {label}" + (f" - {detail}" if detail else ""))
    if not cond:
        errors += 1


print("\n=== Signal Clone Auth Smoke Tests ===\n")

# ------------------------------------------------------------------
# 1. Health
# ------------------------------------------------------------------
print("[ /health ]")
try:
    _, body = get("/health")
    check("GET /health returns ok", body == {"status": "ok"})
except Exception as e:
    check("GET /health", False, str(e))

# ------------------------------------------------------------------
# 2. Login — valid
# ------------------------------------------------------------------
print("\n[ POST /api/v1/auth/login ]")
token = None
try:
    resp, body = post("/api/v1/auth/login", {"username": "alice", "password": "password123"})
    check("Status 200", resp.status == 200)
    check("Returns username", body.get("username") == "alice")
    check("Returns display_name", bool(body.get("display_name")))
    token = extract_cookie(resp)
    check("Sets access_token cookie", token is not None)
except urllib.error.HTTPError as e:
    check("Login alice OK", False, f"{e.code}: {e.read().decode()}")

# ------------------------------------------------------------------
# 3. Login — wrong password
# ------------------------------------------------------------------
print("\n[ POST /api/v1/auth/login — bad password ]")
try:
    post("/api/v1/auth/login", {"username": "alice", "password": "wrongpass"})
    check("Rejects bad password", False, "should have raised 401")
except urllib.error.HTTPError as e:
    check("Returns 401", e.code == 401)

# ------------------------------------------------------------------
# 4. GET /me — authenticated
# ------------------------------------------------------------------
print("\n[ GET /api/v1/auth/me ]")
if token:
    try:
        _, body = get("/api/v1/auth/me", cookies={"access_token": token})
        check("Returns id", isinstance(body.get("id"), int))
        check("Returns username alice", body.get("username") == "alice")
    except urllib.error.HTTPError as e:
        check("/me authenticated", False, f"{e.code}: {e.read().decode()}")
else:
    check("/me (skipped — no token)", False, "login failed")

# ------------------------------------------------------------------
# 5. GET /me — unauthenticated
# ------------------------------------------------------------------
print("\n[ GET /api/v1/auth/me — no cookie ]")
try:
    get("/api/v1/auth/me")
    check("Should reject unauthenticated", False)
except urllib.error.HTTPError as e:
    check("Returns 401", e.code == 401)

# ------------------------------------------------------------------
# 6. Register new user
# ------------------------------------------------------------------
print("\n[ POST /api/v1/auth/register ]")
try:
    resp, body = post("/api/v1/auth/register", {
        "phone_number": "+911234567890",
        "username": "smoketest_user",
        "display_name": "Smoke Tester",
        "password": "testpass123",
        "status_message": "",
    })
    check("Status 201", resp.status == 201)
    check("Returns new user id", isinstance(body.get("id"), int))
    check("Sets cookie", extract_cookie(resp) is not None)
except urllib.error.HTTPError as e:
    # 409 means already registered from a previous test run — that's OK
    if e.code == 409:
        check("Register (already exists from prev run, 409 OK)", True, "duplicate")
    else:
        check("Register new user", False, f"{e.code}: {e.read().decode()}")

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
print(f"\n{'='*40}")
if errors == 0:
    print(f"{PASS} All checks passed!")
else:
    print(f"{FAIL} {errors} check(s) FAILED.")
print()
sys.exit(0 if errors == 0 else 1)
