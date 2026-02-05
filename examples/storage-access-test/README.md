# Storage Access Test Harness

This is a minimal parent/child iframe setup to verify Storage Access API behavior.
It is useful to reproduce WKWebView/Safari behavior where storage access may not
persist across app restarts.

## Quick start (local)

Open two static servers from this directory using different origins:

```
# Terminal 1
python3 -m http.server 3000

# Terminal 2
python3 -m http.server 3001
```

Then open the parent page at:

```
http://localhost:3000/parent.html
```

The parent defaults the iframe to:

```
http://127.0.0.1:3001/child.html
```

Using `localhost` vs `127.0.0.1` gives two distinct origins (and often two distinct
sites) which is closer to real third‑party iframe behavior.

## What to do

1. Click **Request access** in the child iframe.
2. Click **Write storage** to store a timestamp in localStorage and cookies.
3. Reload the parent page and verify whether the stored values persist.
4. On Safari/WKWebView, restart the app and re-open the parent page:
   - If `hasStorageAccess` becomes false, the test will require another user gesture.

## WKWebView guidance

For a more realistic test:

- Host the **parent** page on your app domain.
- Host the **child** page on the keychain domain.
- Load the parent in WKWebView and observe storage access before/after app restart.

This mirrors the controller/keychain iframe relationship in production.
