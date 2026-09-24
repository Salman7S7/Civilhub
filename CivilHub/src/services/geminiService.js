// src/services/geminiService.js
// -----------------------------------------------------------------------------
// Talks to OUR backend proxy (backend/server.js) instead of calling the
// Gemini API directly. This means the real API key never ships inside the
// mobile app bundle — only the backend server holds it.
//
// Make sure the backend is running (see backend/README or root README)
// before testing the chatbot.
// -----------------------------------------------------------------------------

// Update this to match where your backend is reachable from the device/
// emulator/browser that's running the app:
//   - Web (Expo web, localhost:19006):        http://localhost:4000
//   - iOS Simulator:                           http://localhost:4000
//   - Android Emulator:                        http://10.0.2.2:4000
//   - Physical phone (same Wi-Fi as your PC):  http://<your-computer-LAN-IP>:4000
import { BACKEND_BASE_URL } from "./apiConfig";
import { generateLocalCivilConsultation } from "./expertChatService";

/**
 * Sends a user question to our backend, which forwards it to Gemini with the
 * BNBC/RAJUK domain context attached, and returns the plain-text answer.
 *
 * If backend is offline, automatically falls back to the built-in BNBC civil engine.
 *
 * @param {string} userPrompt - The raw question typed by the user in the chat UI.
 * @returns {Promise<string>} - The AI-generated answer text.
 */
export async function askBuildingCodeAI(userPrompt) {
  if (!userPrompt || !userPrompt.trim()) {
    throw new Error("Please enter a question before sending.");
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/ask-building-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userPrompt.trim() }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Backend error (${response.status})`);
    }

    const data = await response.json();
    return (
      data.answer ??
      "Sorry, I couldn't generate an answer for that. Please try rephrasing your question."
    );
  } catch (error) {
    console.warn(
      "askBuildingCodeAI backend unreachable, using local BNBC 2020 engine fallback:",
      error.message
    );
    try {
      return generateLocalCivilConsultation(userPrompt.trim());
    } catch (_fallbackErr) {
      return (
        "BNBC 2020 Guidance: Ensure mandatory road setback (min 1.5m), side setbacks (min 1.0m–1.25m), and confirm FAR with your local development authority (RAJUK/CDA/RDA/KDA).\n\n" +
        "*Disclaimer: Final approval depends on the relevant authority and a licensed structural engineer.*"
      );
    }
  }
}
