import { Platform } from "react-native";
import { BACKEND_BASE_URL } from "./apiConfig.js";

const LOCAL_USERS_KEY = "@civilhub_local_users";

const SEED_USERS = [
  { id: 1, name: "CivilHub Client", email: "demo@civilhub.com", role: "client", engineerType: null, password: "password123" },
  { id: 2, name: "Client Salman", email: "salman@civilhub.com", role: "client", engineerType: null, password: "password123" },
  { id: 3, name: "Ar. Nusrat Jahan", email: "arc@civilhub.com", role: "engineer", engineerType: "architect", password: "password123" },
  { id: 4, name: "Engr. Tanvir Ahmed, PEng", email: "structure@civilhub.com", role: "engineer", engineerType: "structural", password: "password123" },
  { id: 5, name: "Engr. Mohammad Rafiqul", email: "soil@civilhub.com", role: "engineer", engineerType: "soil", password: "password123" },
];

function getStoredLocalUsers() {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {}
  return [];
}

function saveStoredLocalUser(user) {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const existing = getStoredLocalUsers();
      const updated = existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
      updated.push(user);
      window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    }
  } catch {}
}

async function authRequest(path, body) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }

    if (data.user) {
      saveStoredLocalUser({
        ...data.user,
        password: body.password,
      });
    }

    return data;
  } catch (error) {
    // If backend returns an explicit error message (e.g. 401 invalid password, 409 email taken), rethrow it
    if (
      error.message &&
      !error.message.includes("fetch") &&
      !error.message.includes("NetworkError") &&
      !error.message.includes("Failed to fetch") &&
      error.name !== "TypeError"
    ) {
      throw error;
    }

    // Backend server is offline or unreachable: authenticate via local/seed users
    console.warn("[Auth] Backend unreachable, falling back to local credentials:", error.message);

    const email = String(body.email || "").trim().toLowerCase();
    const localUsers = [...getStoredLocalUsers(), ...SEED_USERS];

    if (path === "/api/auth/register") {
      const existing = localUsers.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        throw new Error("An account with this email already exists.");
      }
      const role = body.role === "engineer" ? "engineer" : "client";
      const engineerType = role === "engineer" ? (body.engineerType || "structural") : null;
      const newUser = {
        id: Date.now(),
        name: body.name || "Client User",
        email,
        role,
        engineerType,
        password: body.password,
      };
      saveStoredLocalUser(newUser);
      return {
        success: true,
        token: `offline-session-${Date.now()}`,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, engineerType: newUser.engineerType },
      };
    }

    if (path === "/api/auth/login") {
      const found = localUsers.find((u) => u.email.toLowerCase() === email);
      if (!found || found.password !== body.password) {
        throw new Error("Invalid email or password.");
      }
      return {
        success: true,
        token: `offline-session-${Date.now()}`,
        user: {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role || "client",
          engineerType: found.engineerType || null,
        },
      };
    }

    throw error;
  }
}

export function registerUser(name, email, password, role = "client", engineerType = null) {
  return authRequest("/api/auth/register", { name, email, password, role, engineerType });
}

export function loginUser(email, password, role = "client", engineerType = null) {
  return authRequest("/api/auth/login", { email, password, role, engineerType });
}
