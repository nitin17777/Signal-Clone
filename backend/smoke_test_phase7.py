"""
Phase 7 smoke test - Conversations & Messages endpoints.

Run from e:/Signal/backend with the server already running:
    python smoke_test_phase7.py
"""

import http.cookiejar
import json
import urllib.request
import urllib.error
import sys

BASE = "http://127.0.0.1:8000/api/v1"
PASS = []
FAIL = []

# Shared cookie jar so the session cookie persists between requests
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def post(path, payload=None):
    data = json.dumps(payload or {}).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    return opener.open(req)


def get(path):
    req = urllib.request.Request(f"{BASE}{path}", method="GET")
    return opener.open(req)


def patch(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=data, headers={"Content-Type": "application/json"}, method="PATCH"
    )
    return opener.open(req)


def delete(path):
    req = urllib.request.Request(f"{BASE}{path}", method="DELETE")
    return opener.open(req)


def check(label, fn, expected_status):
    try:
        resp = fn()
        code = resp.status
        body = resp.read().decode()
        if code == expected_status:
            PASS.append(label)
            print(f"  OK [{code}] {label}")
            return json.loads(body) if body else None
        else:
            FAIL.append(label)
            print(f"  FAIL [{code}] {label} (expected {expected_status}): {body[:120]}")
            return None
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode()
        if code == expected_status:
            PASS.append(label)
            print(f"  OK [{code}] {label}")
            return None
        FAIL.append(label)
        print(f"  FAIL [{code}] {label} (expected {expected_status}): {body[:120]}")
        return None


# -- 1. Login as Alice -----------------------------------------------------
print("\n-- Auth -------------------------------------------------------")
alice_phone = "+919876543210"
post("/auth/request-otp", {"phone_number": alice_phone})
login_resp = check(
    "Login Alice (verify-otp)",
    lambda: post("/auth/verify-otp", {"phone_number": alice_phone, "code": "123456"}),
    200,
)

# -- 2. List conversations (seed data should give us at least 1) -----------
print("\n-- Conversations ----------------------------------------------")
convs = check("GET /conversations", lambda: get("/conversations"), 200)
first_conv_id = convs[0]["id"] if convs else None

# -- 3. GET detail ---------------------------------------------------------
if first_conv_id:
    check(
        f"GET /conversations/{first_conv_id}",
        lambda: get(f"/conversations/{first_conv_id}"),
        200,
    )

# -- 4. POST /conversations (generic endpoint) -----------------------------
check(
    "POST /conversations",
    lambda: post("/conversations", {"other_user_id": 3}),
    201,
)

# -- 4b. Create direct conversation with Bob (id=2) ------------------------
direct = check(
    "POST /conversations/direct",
    lambda: post("/conversations/direct", {"other_user_id": 2}),
    201,
)
direct_id = direct["id"] if direct else None

# ── 5. Create group ───────────────────────────────────────────────────────
group = check(
    "POST /conversations/group",
    lambda: post("/conversations/group", {"name": "Test Group", "member_ids": [2, 3]}),
    201,
)
group_id = group["id"] if group else None

# ── 6. PATCH group (rename) ────────────────────────────────────────────────
if group_id:
    check(
        "PATCH /conversations/{id} (rename)",
        lambda: patch(f"/conversations/{group_id}", {"name": "Renamed Group"}),
        200,
    )

# ── 7. Add member to group ────────────────────────────────────────────────
if group_id:
    check(
        "POST /conversations/{id}/members",
        lambda: post(f"/conversations/{group_id}/members", {"user_id": 4}),
        204,
    )

# ── 8. Remove member from group ───────────────────────────────────────────
if group_id:
    check(
        "DELETE /conversations/{id}/members/{user_id}",
        lambda: delete(f"/conversations/{group_id}/members/4"),
        204,
    )

# -- 9. Messages ----------------------------------------------------------
print("\n-- Messages ---------------------------------------------------")
if direct_id:
    # Send a message
    msg = check(
        "POST /conversations/{id}/messages",
        lambda: post(
            f"/conversations/{direct_id}/messages",
            {"content": "Hello from Phase 7 smoke test!"},
        ),
        201,
    )
    msg_id = msg["id"] if msg else None

    # List messages
    check(
        "GET /conversations/{id}/messages",
        lambda: get(f"/conversations/{direct_id}/messages"),
        200,
    )

    # Cursor pagination
    if msg_id:
        check(
            "GET /conversations/{id}/messages?before=&limit=",
            lambda: get(f"/conversations/{direct_id}/messages?before={msg_id + 1}&limit=10"),
            200,
        )

    # Mark read
    if msg_id:
        check(
            "PATCH /messages/{id}/read",
            lambda: patch(f"/messages/{msg_id}/read", {}),
            204,
        )

    # Send another message then delete it
    msg2 = check(
        "POST message to delete",
        lambda: post(
            f"/conversations/{direct_id}/messages",
            {"content": "This will be deleted"},
        ),
        201,
    )
    if msg2:
        check(
            "DELETE /messages/{id}",
            lambda: delete(f"/messages/{msg2['id']}"),
            204,
        )

# ── Summary ───────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Passed: {len(PASS)}  |  Failed: {len(FAIL)}")
if FAIL:
    print("  Failed tests:")
    for f in FAIL:
        print(f"    - {f}")
    sys.exit(1)
else:
    print("  All tests passed [OK]")
