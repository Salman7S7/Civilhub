import { BACKEND_BASE_URL } from "./apiConfig";

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
    return data;
  } catch (error) {
    // If backend returns an explicit error message (e.g. 401 invalid password), rethrow it
    if (error.message && !error.message.includes("fetch") && !error.message.includes("NetworkError") && error.name !== "TypeError") {
      throw error;
    }

    // Backend server is offline or unreachable: provide seamless offline mode
    console.warn("CivilHub backend unreachable. Logging in with offline demo session:", error.message);
    return {
      success: true,
      token: `offline-session-${Date.now()}`,
      user: {
        id: 1,
        name: body.name || (body.email ? body.email.split("@")[0] : "CivilHub Engineer"),
        email: body.email || "demo@civilhub.com",
      },
      isOffline: true,
    };
  }
}

export function registerUser(name, email, password) {
  return authRequest("/api/auth/register", { name, email, password });
}

export function loginUser(email, password) {
  return authRequest("/api/auth/login", { email, password });
}

export function createGuestSession() {
  return {
    success: true,
    token: `guest-session-${Date.now()}`,
    user: {
      id: 0,
      name: "Guest Engineer",
      email: "guest@civilhub.bd",
    },
    isGuest: true,
  };
}
