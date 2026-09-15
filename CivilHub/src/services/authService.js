import { BACKEND_BASE_URL } from "./apiConfig";

async function authRequest(path, body) {
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
}

export function registerUser(name, email, password) {
  return authRequest("/api/auth/register", { name, email, password });
}

export function loginUser(email, password) {
  return authRequest("/api/auth/login", { email, password });
}
