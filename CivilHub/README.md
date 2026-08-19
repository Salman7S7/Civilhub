# CivilHub — Feasibility Checker & Building Code AI Assistant

A complete, ready-to-run Expo (React Native) app with a small backend proxy
for the Gemini API, so your API key stays server-side instead of shipping
inside the app.

```
CivilHub/
  App.js                    ← app entry point
  app.json                  ← Expo config
  babel.config.js
  package.json
  backend/                  ← Node/Express proxy for the Gemini API
    server.js
    package.json
    .env                    ← pre-filled with your key (dev only, gitignored)
    .env.example
  src/
    navigation/BottomTabNavigator.jsx
    services/
      geminiService.js       ← calls OUR backend, not Google directly
      feasibilityRules.js    ← local rule-of-thumb feasibility engine
    components/
      FeasibilityForm.jsx
      AIChatbotModal.jsx
    screens/
      FeasibilityScreen.jsx
      PlaceholderScreens.jsx
```

## 1. Run the backend first

The chatbot won't work until this is running — it's what actually calls
Gemini using your API key.

```bash
cd CivilHub/backend
npm install
npm start
```

You should see:

```
CivilHub backend proxy running on http://localhost:4000
```

The key is already in `backend/.env` so this works immediately. That file is
gitignored — never commit it.

**Rotate the key.** It was shared in a chat conversation earlier, so treat it
as already exposed. Generate a new key in Google AI Studio, then replace the
value in `backend/.env`.

## 2. Run the app

In a **second terminal**, from the project root:

```bash
cd CivilHub
npm install
npm run web       # opens in browser at localhost:19006
# or
npm run android   # requires Android emulator/device
npm run ios       # requires macOS + Xcode simulator
```

## 3. Point the app at your backend (if not using web)

`src/services/geminiService.js` has a `BACKEND_BASE_URL` constant:

```js
const BACKEND_BASE_URL = "http://localhost:4000";
```

- **Web / iOS Simulator** → `http://localhost:4000` works as-is.
- **Android Emulator** → change to `http://10.0.2.2:4000` (Android's alias
  for your computer's localhost).
- **Physical phone** on the same Wi-Fi as your computer → change to
  `http://<your-computer's-LAN-IP>:4000`, e.g. `http://192.168.1.20:4000`.
  Find your LAN IP with `ipconfig` (Windows) or `ifconfig`/`ipconfig getifaddr en0` (Mac).

## What each part does

- **Feasibility form** (`FeasibilityForm.jsx` + `feasibilityRules.js`): a
  local, instant estimate based on road width — not a live regulatory
  lookup. See the big comment block at the top of `feasibilityRules.js` for
  exactly what's sourced vs. simplified, and why full RAJUK zone-by-zone
  rules can't be safely hardcoded into one table.
- **AI chatbot** (`AIChatbotModal.jsx` + `geminiService.js` + `backend/server.js`):
  the app sends the question to your backend, the backend attaches BNBC/RAJUK
  domain context and calls Gemini, and the answer streams back to the chat UI.

## Before shipping to real users

1. Replace the feasibility heuristics with an authoritative, regularly
   updated dataset (ideally reviewed by a licensed structural engineer),
   since RAJUK's DAP zone rules change over time and vary by neighborhood.
2. Deploy `backend/` somewhere real (Render, Railway, Fly.io, a VPS, etc.)
   instead of localhost, and point `BACKEND_BASE_URL` at that deployed URL.
3. Add authentication/rate-limiting to the backend so the Gemini endpoint
   can't be abused by anyone who finds the URL.
4. Rotate the Gemini key one more time right before launch.
