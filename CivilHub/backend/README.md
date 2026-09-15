# CivilHub Backend

## Setup

1. Install MySQL and create a local MySQL user.
2. Copy `.env.example` to `.env`.
3. Put your MySQL settings, Gemini API key and a long random JWT secret in `.env`.
4. Run `npm install`.
5. Run `npm start`.

The backend creates the `civilhub_db`, `users` and `designs` tables automatically.

## Authentication endpoints

- `POST /api/auth/register` with `name`, `email`, `password`
- `POST /api/auth/login` with `email`, `password`
- `GET /api/auth/me` with `Authorization: Bearer <token>`

Passwords are stored as bcrypt hashes. Plain text passwords are never saved.

## Gemini endpoint

- `POST /api/ask-building-code` with `question`

The mobile app calls this backend endpoint. The Gemini API key stays only in the backend `.env` file.

## Device URL

Change `src/services/apiConfig.js` when the app runs on another device:

- Expo web or iOS simulator: `http://localhost:4000`
- Android emulator: `http://10.0.2.2:4000`
- Physical phone: `http://YOUR_COMPUTER_LAN_IP:4000`
