import asyncio
import json
import sys
import websockets
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://127.0.0.1:8000/api/v1"
WS_BASE = "ws://127.0.0.1:8000/ws"

def login(username, password="password123"):
    data = json.dumps({"username": username, "password": password}).encode()
    req = urllib.request.Request(f"{BASE}/auth/login", data=data, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    cookie_header = resp.headers.get("Set-Cookie")
    body = json.loads(resp.read())
    # Extract token
    token = None
    for part in cookie_header.split(";"):
        if "access_token=" in part:
            token = part.split("access_token=")[1].strip()
    return body, token, cookie_header.split(";")[0]

def api_call(endpoint, method="GET", data=None, cookie_header=None):
    body_bytes = json.dumps(data).encode() if data is not None else None
    headers = {"Content-Type": "application/json"}
    if cookie_header:
        headers["Cookie"] = cookie_header
    req = urllib.request.Request(f"{BASE}{endpoint}", data=body_bytes, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        status = resp.status
        content = resp.read()
        return status, json.loads(content) if content else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

async def test_full_phase12():
    print("=== STARTING PHASE 12 COMPREHENSIVE VERIFICATION ===")
    
    # 1. Login users: Alice, Bob, Charlie
    alice, alice_token, alice_cookie = login("alice")
    bob, bob_token, bob_cookie = login("bob")
    charlie, charlie_token, charlie_cookie = login("charlie")
    print(f"1. Logged in users: Alice ({alice['id']}), Bob ({bob['id']}), Charlie ({charlie['id']})")
    
    # 2. Alice searches users to select members for group
    status, users = api_call("/users/search?q=", cookie_header=alice_cookie)
    assert status == 200
    user_ids = [u["id"] for u in users]
    assert bob["id"] in user_ids and charlie["id"] in user_ids
    print(f"2. User search returned {len(users)} available users.")

    # 3. Alice creates a group with Alice (admin), Bob (member), Charlie (member)
    status, group = api_call(
        "/conversations/group",
        method="POST",
        data={"name": "Phase 12 Super Group 🚀", "member_ids": [bob["id"], charlie["id"]]},
        cookie_header=alice_cookie
    )
    assert status == 201
    group_id = group["id"]
    members = group["members"]
    assert len(members) == 3
    print(f"3. Group #{group_id} '{group['name']}' created successfully with 3 members.")
    
    # Verify roles
    alice_role = next(m["role"] for m in members if m["user_id"] == alice["id"])
    bob_role = next(m["role"] for m in members if m["user_id"] == bob["id"])
    charlie_role = next(m["role"] for m in members if m["user_id"] == charlie["id"])
    assert alice_role == "admin"
    assert bob_role == "member"
    assert charlie_role == "member"
    print(f"   Roles verified: Alice={alice_role}, Bob={bob_role}, Charlie={charlie_role}")

    # 4. WebSocket test: Bob connects and receives live message sent by Alice in group
    print("4. Connecting Alice and Bob to WebSocket...")
    alice_ws_url = f"{WS_BASE}?token={alice_token}"
    bob_ws_url = f"{WS_BASE}?token={bob_token}"

    async with websockets.connect(alice_ws_url) as alice_ws, websockets.connect(bob_ws_url) as bob_ws:
        # Wait for connection ack or setup
        await asyncio.sleep(0.5)

        # Alice sends message via WS
        msg_payload = {
            "type": "message:send",
            "conversation_id": group_id,
            "content": "Hello team! Group chat is live and encrypted! 🔒",
            "reply_to": None,
        }
        await alice_ws.send(json.dumps(msg_payload))
        print("   Alice sent message via WebSocket.")

        # Bob should receive message:new
        received = False
        for _ in range(5):
            raw = await asyncio.wait_for(bob_ws.recv(), timeout=3.0)
            event = json.loads(raw)
            if event.get("type") == "message:new" and event.get("conversation_id") == group_id:
                assert event["message"]["content"] == "Hello team! Group chat is live and encrypted! 🔒"
                assert event["message"]["sender_id"] == alice["id"]
                received = True
                print("   Bob received live message over WebSocket:", event["message"]["content"])
                break
        assert received, "Bob did not receive live message"

    # 5. Non-admin permission tests
    print("5. Testing non-admin restrictions...")
    # Bob tries to rename group
    status, res = api_call(f"/conversations/{group_id}", method="PATCH", data={"name": "Hacked Group Name"}, cookie_header=bob_cookie)
    assert status == 403
    print("   Bob rename attempt blocked with 403 Forbidden.")

    # Bob tries to remove Charlie
    status, res = api_call(f"/conversations/{group_id}/members/{charlie['id']}", method="DELETE", cookie_header=bob_cookie)
    assert status == 403
    print("   Bob remove member attempt blocked with 403 Forbidden.")

    # 6. Admin operations
    print("6. Testing admin operations...")
    # Alice renames group
    status, updated_group = api_call(f"/conversations/{group_id}", method="PATCH", data={"name": "Signal Core Team ⚡"}, cookie_header=alice_cookie)
    assert status == 200
    assert updated_group["name"] == "Signal Core Team ⚡"
    print("   Alice renamed group to:", updated_group["name"])

    # Alice removes Charlie
    status, _ = api_call(f"/conversations/{group_id}/members/{charlie['id']}", method="DELETE", cookie_header=alice_cookie)
    assert status == 204
    print("   Alice removed Charlie with 204 No Content.")

    # Verify updated member list
    status, detail = api_call(f"/conversations/{group_id}", method="GET", cookie_header=alice_cookie)
    assert status == 200
    assert len(detail["members"]) == 2
    assert not any(m["user_id"] == charlie["id"] for m in detail["members"])
    print("   Verified Charlie is no longer in group. Current members:", [(m.get("user") or {}).get("display_name", f"User {m['user_id']}") for m in detail["members"]])

    # 7. Admin cannot remove self if sole admin
    status, res = api_call(f"/conversations/{group_id}/members/{alice['id']}", method="DELETE", cookie_header=alice_cookie)
    assert status == 400
    print("   Alice removing self as only admin blocked with 400 Bad Request.")

    print("\n🎉 ALL PHASE 12 REQUIREMENTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_full_phase12())
