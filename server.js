// backend/server.js
// -----------------------------------------------------------------------------
// Minimal Express proxy for the Gemini API. The mobile app calls THIS server
// (not Google directly), so the real Gemini API key only ever lives here,
// server-side, and is never bundled into the app or visible to end users.
//
// Run:
//   cd backend
//   npm install
//   cp .env.example .env   # then paste your real key into .env
//   npm start
//
// The server listens on http://localhost:4000 by default.
// -----------------------------------------------------------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Domain context — same persona used previously in the client-side service,
// now centralized here so it can't be tampered with from the app.
const SYSTEM_CONTEXT = `
You are a senior Bangladesh Civil Engineering & Building Code Expert.
You are fully compliant with and knowledgeable about:
- The Bangladesh National Building Code (BNBC 2020)
- RAJUK Imarat Nirman Bidhimala (Dhaka Building Construction Rules)
- CDA (Chittagong Development Authority) building rules
- RDA (Rajshahi Development Authority) building rules
- KDA (Khulna Development Authority) building rules
- General Municipal (Pourashava) construction guidelines

Rules for your answers:
1. Always answer in the context of Bangladeshi building regulations only.
2. When relevant, mention Floor Area Ratio (FAR), setback requirements,
   maximum permissible height, and road-width based restrictions.
3. If a question depends on the specific regional authority (RAJUK/CDA/RDA/KDA),
   ask the user to confirm the region if it is not already stated, then give
   your best answer assuming the most common case.
4. Keep answers concise, structured, and practical for a property developer
   or homeowner — avoid unnecessary legal jargon.
5. Always include a short disclaimer that final approval depends on the
   relevant development authority and a licensed structural engineer's review.

Now answer the following user question:
`;

// Basic health check
app.get("/health", (req, res) => {
  res.json({ ok: true, hasKey: Boolean(GEMINI_API_KEY) });
});

// POST /api/ask-building-code  { question: string }
app.post("/api/ask-building-code", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: "Missing 'question' in request body." });
    }
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Check backend/.env." });
    }

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_CONTEXT}\n${String(question).trim()}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    };

    const geminiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return res.status(502).json({ error: "Gemini API request failed." });
    }

    const data = await geminiResponse.json();
    const answerText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Sorry, I couldn't generate an answer for that. Please try rephrasing your question.";

    res.json({ answer: answerText });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`CivilHub backend proxy running on http://localhost:${PORT}`);
});
