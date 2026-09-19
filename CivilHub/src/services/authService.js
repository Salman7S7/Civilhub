import { BACKEND_BASE_URL } from "./apiConfig.js";

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
    if (
      error.message &&
      !error.message.includes("fetch") &&
      !error.message.includes("NetworkError") &&
      error.name !== "TypeError"
    ) {
      throw error;
    }

    // Backend server is offline or unreachable: provide seamless offline mode
    console.warn("CivilHub backend unreachable. Logging in with offline demo session:", error.message);

    const role = body.role === "engineer" ? "engineer" : "client";
    const engineerType = role === "engineer" ? (body.engineerType || "structural") : null;

    let defaultName = "CivilHub Client";
    if (role === "engineer") {
      if (engineerType === "architect") defaultName = "Ar. Nusrat Jahan";
      else if (engineerType === "soil") defaultName = "Engr. Mohammad Rafiqul";
      else defaultName = "Engr. Tanvir Ahmed";
    } else {
      defaultName = body.name || (body.email ? body.email.split("@")[0] : "Client User");
    }

    return {
      success: true,
      token: `offline-session-${Date.now()}`,
      user: {
        id: 1,
        name: body.name || defaultName,
        email: body.email || "user@civilhub.com",
        role,
        engineerType,
      },
      isOffline: true,
    };
  }
}

export function registerUser(name, email, password, role = "client", engineerType = null) {
  return authRequest("/api/auth/register", { name, email, password, role, engineerType });
}

export function loginUser(email, password, role = "client", engineerType = null) {
  return authRequest("/api/auth/login", { email, password, role, engineerType });
}
