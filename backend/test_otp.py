import urllib.request, json

base = "http://127.0.0.1:8000"

def post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{base}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        resp = urllib.request.urlopen(req)
        return resp.status, json.loads(resp.read()), resp
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read()), None

# 1. request-otp for alice
code, body, _ = post("/api/v1/auth/request-otp", {"phone_number": "+919876543210"})
print("[request-otp]", code, "code:", body.get("dev_only_code"), "detail:", body.get("detail"))

# 2. verify-otp correct code
code2, body2, resp2 = post("/api/v1/auth/verify-otp", {"phone_number": "+919876543210", "code": "123456"})
print("[verify-otp ok]", code2, "user:", body2.get("username"))
if resp2:
    print("  cookie set:", "access_token" in resp2.headers.get("Set-Cookie", ""))

# 3. verify-otp wrong code
code3, body3, _ = post("/api/v1/auth/verify-otp", {"phone_number": "+919876543210", "code": "000000"})
print("[verify-otp bad]", code3, "detail:", body3.get("detail"))
