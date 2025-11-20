# Quick Run Guide (Stratus Superadmin Hub)

## 1. Prerequisites
- Node.js (recommended) OR Python 3 (fallback static serving)
- PowerShell (already your default shell)

## 2. Start Local Static Server (Node Preferred)
```powershell
# Navigate to project root
Set-Location d:\str4tus\stratus-electron-app

# Run default (port 8080)
node serve-dashboard.js

# Custom port (example 9090)
$env:PORT=9090; node serve-dashboard.js
```
Server output lists direct links (e.g. `http://localhost:8080/ultimate-superadmin-dashboard.html`).
Visit `http://localhost:8080/` for the hub index.

## 3. Python Fallback (If Node Not Available)
```powershell
Set-Location d:\str4tus\stratus-electron-app
python -m http.server 8080
```
Then open: `http://localhost:8080/index.html`
(Note: Python simple server will not auto-compute MIME for some edge cases but is fine for this static preview.)

## 4. Identity Proof Panel
Open `ultimate-superadmin-dashboard.html` and scroll or jump to `#identity`.
Proofs stream every ~4s with batching (2 at a time) and ring buffer (250 max). Public mode redacts secrets.

## 5. Common Troubleshooting
- PORT already in use: choose new port (`$env:PORT=8181`).
- Blank panel sections: ensure relative paths exist; most panels are self-contained HTML + JS.
- Browser cache issues: Hard refresh (Ctrl+F5) after updates.

## 6. Next Optional Steps
- Add HTTPS reverse proxy if exposing externally.
- Consolidate shared styles into a single global CSS if desired.

Enjoy the unified view.
