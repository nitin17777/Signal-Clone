import json
import sys
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://127.0.0.1:8000/api/v1"

def login(username, password="password123"):
    data = json.dumps({"username": username, "password": password}).encode()
    req = urllib.request.Request(f"{BASE}/auth/login", data=data, headers={"Content-Type": "application/json"})
    try:
        resp = urllib.request.urlopen(req)
        cookie = resp.headers.get("Set-Cookie")
        body = json.loads(resp.read())
        return body, cookie
    except urllib.error.HTTPError as e:
        print(f"Login failed for {username}: {e.code} {e.read().decode()}")
        raise

def api_call(endpoint, method="GET", data=None, cookie=None):
    body_bytes = json.dumps(data).encode() if data is not None else None
    headers = {"Content-Type": "application/json"}
    if cookie:
        # Extract access_token cookie
        token_part = cookie.split(";")[0]
        headers["Cookie"] = token_part
    req = urllib.request.Request(f"{BASE}{endpoint}", data=body_bytes, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        status = resp.status
        content = resp.read()
        return status, json.loads(content) if content else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def run_tests():
    print("Testing group flow...")
    # 1. Login user 1 (alice) and user 2 (bob) and user 3 (charlie)
    # Check seeded users or search
    status, users = api_call("/users/search?q=")
    print(f"Users found: {len(users) if isinstance(users, list) else users}")
    
    # We can login with alice
    alice, alice_cookie = login("alice")
    bob, bob_cookie = login("bob")
    charlie, charlie_cookie = login("charlie")
    print(f"Logged in: Alice (id={alice['id']}), Bob (id={bob['id']}), Charlie (id={charlie['id']})")

    # 2. Alice creates a group with Bob and Charlie
    status, new_group = api_call(
        "/conversations/group",
        method="POST",
        data={"name": "Test Group Alpha", "member_ids": [bob['id'], charlie['id']]},
        cookie=alice_cookie
    )
    print(f"Create group response: {status}, id={new_group.get('id') if isinstance(new_group, dict) else new_group}")
    assert status == 201
    group_id = new_group['id']
    members = new_group['members']
    assert len(members) == 3
    alice_m = next(m for m in members if m['user_id'] == alice['id'])
    bob_m = next(m for m in members if m['user_id'] == bob['id'])
    assert alice_m['role'] == "admin"
    assert bob_m['role'] == "member"
    print("✓ Group created with Alice as admin, Bob & Charlie as members")

    # 3. Bob (non-admin) tries to rename group -> should be 403
    status, err = api_call(f"/conversations/{group_id}", method="PATCH", data={"name": "Hacked Group"}, cookie=bob_cookie)
    print(f"Non-admin rename status: {status} (expected 403)")
    assert status == 403, f"Expected 403, got {status}: {err}"
    print("✓ Non-admin rename blocked with 403")

    # 4. Bob (non-admin) tries to remove Charlie -> should be 403
    status, err = api_call(f"/conversations/{group_id}/members/{charlie['id']}", method="DELETE", cookie=bob_cookie)
    print(f"Non-admin remove member status: {status} (expected 403)")
    assert status == 403, f"Expected 403, got {status}: {err}"
    print("✓ Non-admin remove member blocked with 403")

    # 5. Alice (admin) renames group -> 200
    status, updated = api_call(f"/conversations/{group_id}", method="PATCH", data={"name": "Alpha Team Renamed"}, cookie=alice_cookie)
    assert status == 200
    assert updated['name'] == "Alpha Team Renamed"
    print("✓ Admin rename succeeded")

    # 6. Alice (admin) removes Charlie -> 204
    status, _ = api_call(f"/conversations/{group_id}/members/{charlie['id']}", method="DELETE", cookie=alice_cookie)
    assert status == 204
    print("✓ Admin remove member succeeded with 204")

    # 7. Check conversation detail
    status, detail = api_call(f"/conversations/{group_id}", method="GET", cookie=alice_cookie)
    assert status == 200
    assert len(detail['members']) == 2
    assert not any(m['user_id'] == charlie['id'] for m in detail['members'])
    print("✓ Charlie is no longer in the group")

    # 8. Alice tries to remove herself (only admin) -> 400
    status, err = api_call(f"/conversations/{group_id}/members/{alice['id']}", method="DELETE", cookie=alice_cookie)
    print(f"Admin removing self (last admin) status: {status} (expected 400)")
    assert status == 400
    print("✓ Last admin cannot remove self")

    print("\nALL BACKEND GROUP TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run_tests()
