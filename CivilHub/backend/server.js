// backend/server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ============================================================
// Middleware
// ============================================================

app.use(cors());

app.use(
  express.json({
    limit: "1mb"
  })
);

// ============================================================
// Configuration
// ============================================================

const PORT = process.env.PORT || 4000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `${GEMINI_MODEL}:generateContent`;

// ============================================================
// Bangladesh Building Code System Context
// ============================================================

const SYSTEM_CONTEXT = `
You are a senior Bangladesh Civil Engineering and Building Code Expert.

You are knowledgeable about:

- Bangladesh National Building Code (BNBC 2020)
- RAJUK Imarat Nirman Bidhimala
- RAJUK building regulations
- CDA building rules
- RDA building rules
- KDA building rules
- General Pourashava construction guidelines

Rules for your answers:

1. Always answer in the context of Bangladeshi building regulations.

2. When relevant, mention:

   - Floor Area Ratio (FAR)
   - Setback requirements
   - Maximum permissible height
   - Road-width-based restrictions
   - Plot size
   - Parking requirements
   - Building use and occupancy restrictions

3. If the answer depends on RAJUK, CDA, RDA, KDA,
   or another authority, make a reasonable assumption
   and clearly state the assumed authority.

4. Do not invent exact legal values when they depend on:

   - Plot size
   - Road width
   - Zone
   - Land-use category
   - Development authority

5. If an exact value cannot be determined from the
   information provided, clearly say what information
   is required.

6. Keep answers concise, structured, and practical.

7. Avoid unnecessary legal jargon.

8. Always include this disclaimer:

"Disclaimer: Final approval depends on the relevant development
authority and review by a licensed structural/civil engineer."

Now answer the user's question.
`;

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL
  });
});

// ============================================================
// DEBUG - LIST AVAILABLE GEMINI MODELS
// ============================================================

app.get("/debug/models", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY"
      });
    }

    const modelsUrl =
      "https://generativelanguage.googleapis.com/v1beta/models";

    const response = await fetch(modelsUrl, {
      method: "GET",

      headers: {
        "x-goog-api-key": GEMINI_API_KEY
      }
    });

    const text = await response.text();

    res
      .status(response.status)
      .type("application/json")
      .send(text);

  } catch (error) {
    console.error(
      "Model list error:",
      error
    );

    res.status(500).json({
      error: "Could not list models"
    });
  }
});

// ============================================================
// ASK BUILDING CODE
//
// POST:
// /api/ask-building-code
//
// Request body:
//
// {
//   "question": "What is FAR in Bangladesh?"
// }
//
// Response:
//
// {
//   "answer": "..."
// }
// ============================================================

app.post("/api/ask-building-code", async (req, res) => {
  try {

    // --------------------------------------------------------
    // Get question
    // --------------------------------------------------------

    const { question } = req.body;

    // --------------------------------------------------------
    // Validate question
    // --------------------------------------------------------

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "Missing 'question' in request body."
      });
    }

    // --------------------------------------------------------
    // Check API key
    // --------------------------------------------------------

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          "Server is missing GEMINI_API_KEY. Check backend/.env."
      });
    }

    // --------------------------------------------------------
    // Create complete prompt
    // --------------------------------------------------------

    const fullPrompt = `
${SYSTEM_CONTEXT}

User question:

${String(question).trim()}
`;

    // --------------------------------------------------------
    // Gemini request body
    // --------------------------------------------------------

    const requestBody = {
      contents: [
        {
          role: "user",

          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ],

      generationConfig: {
        maxOutputTokens: 800
      }
    };

    // --------------------------------------------------------
    // Send request to Gemini
    // --------------------------------------------------------

    const geminiResponse = await fetch(
      GEMINI_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "x-goog-api-key": GEMINI_API_KEY
        },

        body: JSON.stringify(requestBody)
      }
    );

    // --------------------------------------------------------
    // Gemini API error
    // --------------------------------------------------------

    if (!geminiResponse.ok) {

      const errorText =
        await geminiResponse.text();

      console.error(
        "Gemini API error:",
        geminiResponse.status,
        errorText
      );

      return res.status(502).json({
        error: "Gemini API request failed.",

        status: geminiResponse.status,

        details: errorText
      });
    }

    // --------------------------------------------------------
    // Read Gemini response
    // --------------------------------------------------------

    const data =
      await geminiResponse.json();

    // --------------------------------------------------------
    // Extract generated text
    // --------------------------------------------------------

    const answerText =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part?.text || "")
        .join("")
        .trim();

    // --------------------------------------------------------
    // Empty response
    // --------------------------------------------------------

    if (!answerText) {

      console.error(
        "Gemini returned no text:"
      );

      console.error(
        JSON.stringify(data, null, 2)
      );

      return res.status(502).json({
        error:
          "Gemini returned an empty response."
      });
    }

    // --------------------------------------------------------
    // Send answer to mobile app
    // --------------------------------------------------------

    res.json({
      answer: answerText
    });

  } catch (error) {

    console.error(
      "Proxy error:",
      error
    );

    res.status(500).json({
      error:
        "Internal server error."
    });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {

  console.log(
    `CivilHub backend running on http://localhost:${PORT}`
  );

  console.log(
    `Gemini model: ${GEMINI_MODEL}`
  );

  console.log(
    `Gemini API key loaded: ${Boolean(GEMINI_API_KEY)}`
  );

});