# Implementation Plan: Client & Engineer Profiles with Dedicated Client-Engineer Chat

Add two profiles on the login page (Client and Engineer, with 3 engineer disciplines: Architect, Structure Eng, Soil Eng), remove guest login, remove 1-tap direct login, remove all photos/profile pics on login, and restrict all engineer profiles to chat exclusively with Client.

## User Requirements Checklist
- [x] Login page: 2 profiles (`Client` and `Engineer`).
- [x] In Engineer: 3 engineer disciplines (`Architect`, `Structure Eng`, `Soil Eng`).
- [x] No profile picture or photo whatsoever on login page.
- [x] No 1-tap direct login system (removed Google 1-tap login).
- [x] No guest login (removed guest mode).
- [x] All engineer profiles can talk to Client only (e.g., Structure Eng can chat with Client only; no engineer-to-engineer chat).
- [x] Keep all existing navbar tabs intact; do not create extra work.

## Proposed Changes

### Backend & Authentication Services

#### [MODIFY] [server.js](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/backend/server.js)
- Update `fallbackUsers` to include:
  - `client@civilhub.com` (role: `client`)
  - `structure@civilhub.com` (role: `engineer`, engineerType: `structural`)
  - `arc@civilhub.com` (role: `engineer`, engineerType: `architect`)
  - `soil@civilhub.com` (role: `engineer`, engineerType: `soil`)
- In `POST /api/auth/register`, support `role` (`client` | `engineer`) and `engineerType` (`architect` | `structural` | `soil`).
- In `POST /api/auth/login`, accept and persist the selected profile role and engineer type in user session.

#### [MODIFY] [authService.js](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/src/services/authService.js)
- Update `loginUser(email, password, role, engineerType)` and `registerUser(name, email, password, role, engineerType)`.
- Support seamless offline demo session with the selected role and engineer discipline.
- Remove `createGuestSession`.

---

### UI Components & Navigation

#### [MODIFY] [LoginScreen.jsx](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/src/screens/LoginScreen.jsx)
- Remove `HERO_IMAGE_URL` and `ImageBackground` (pure modern gradient card design with vector icon, no photos or profile pictures).
- Remove "Continue as Guest" and "Continue with Google" buttons.
- Add Profile Selector:
  - Primary tabs: **Client** (`client`) vs **Engineer** (`engineer`).
  - When Engineer is active: 3-way toggle for **Architect (Arc)**, **Structure Eng**, and **Soil Eng**.
- Pass selected profile data to authentication methods.

#### [MODIFY] [App.js](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/App.js)
- Pass active `session` object to `BottomTabNavigator`.

#### [MODIFY] [BottomTabNavigator.jsx](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/src/navigation/BottomTabNavigator.jsx)
- Receive `session` prop.
- Display current profile badge (e.g. `Client`, `Structure Eng`, `Architect`, `Soil Eng`) next to the Logout button.
- Pass `session` to `ExpertChatScreen`.
- Preserve all 5 tabs (`Feasibility`, `Smart Designs`, `Cost Estimator`, `Land Tax`, `Ask Expert`).

---

### Chat Architecture: Client-Only Engineer Messaging

#### [MODIFY] [expertChatService.js](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/src/services/expertChatService.js)
- Support thread isolation:
  - `thread_client_architect`
  - `thread_client_structural`
  - `thread_client_soil`
- Configure discipline-specific welcome messages and consultation triage.

#### [MODIFY] [ExpertChatScreen.jsx](file:///c:/Users/Salman/Desktop/Civilhub/Civilhub/CivilHub/src/screens/ExpertChatScreen.jsx)
- **If logged in as Engineer** (e.g. Structure Eng):
  - Fixed to the dedicated engineer-client consultation thread (`thread_client_structural`).
  - Header displays: "Client Consultation (Talking with Client Only)".
  - Directory / escalation to other engineers is removed.
  - Engineer messages render on right, Client messages render on left.
- **If logged in as Client**:
  - Client can switch between the 3 engineers using top discipline chips: [ 📐 Architect ] [ 🏗️ Structure Eng ] [ 🧪 Soil Eng ].
  - Client sends questions directly to the selected engineer's thread.
  - Client messages render on right, Engineer replies render on left.
