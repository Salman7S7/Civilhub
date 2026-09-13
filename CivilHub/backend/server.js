// backend/server.js
// -----------------------------------------------------------------------------
// CivilHub Mobile Backend:
// 1. Feature 1: Gemini AI Bangladesh Building Code Proxy
// 2. Feature 2: Smart Design Suggestions MySQL Filter Engine & API
// -----------------------------------------------------------------------------

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDB, query, getStatus } = require("./db");
const { SEED_DESIGNS } = require("./seedData");

const app = express();

// ============================================================
// Middleware
// ============================================================

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ============================================================
// Configuration
// ============================================================

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `${GEMINI_MODEL}:generateContent`;

// ============================================================
// Bangladesh Building Code System Context (Feature 1)
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
2. When relevant, mention Floor Area Ratio (FAR), setback requirements, maximum permissible height, and road-width-based restrictions.
3. If the answer depends on RAJUK, CDA, RDA, or KDA, make a reasonable assumption and clearly state the assumed authority.
4. Keep answers concise, structured, and practical.
5. Always include this disclaimer:
"Disclaimer: Final approval depends on the relevant development authority and review by a licensed structural/civil engineer."
`;

// ============================================================
// Helper: In-Memory Fallback Filter Engine
// ============================================================

function filterInMemory(filters = {}) {
  const { floors, min_katha, basement, garage, rooftop, q, search } = filters;
  const searchTerm = (q || search || "").toLowerCase().trim();

  const allItems = SEED_DESIGNS.map((d, index) => ({ id: index + 1, ...d }));

  let targetFloor = null;
  let hasExactFloorMatch = false;
  let allowedFloorDiff = 0;

  if (floors) {
    const parsed = parseInt(floors, 10);
    if (!isNaN(parsed)) {
      if (parsed > 0 && parsed <= 40) {
        targetFloor = parsed;
        hasExactFloorMatch = allItems.some((item) => item.floors === targetFloor);
        if (!hasExactFloorMatch && allItems.length > 0) {
          const minDiff = Math.min(
            ...allItems.map((it) => Math.abs(it.floors - targetFloor))
          );
          allowedFloorDiff = Math.max(minDiff, 2);
        }
      } else {
        targetFloor = -1;
      }
    }
  }

  const filtered = allItems.filter((item) => {
    if (targetFloor === -1) {
      return false;
    }
    if (targetFloor !== null) {
      if (hasExactFloorMatch) {
        if (item.floors !== targetFloor) return false;
      } else {
        if (Math.abs(item.floors - targetFloor) > allowedFloorDiff) return false;
      }
    }
    if (min_katha && item.min_katha > parseFloat(min_katha)) {
      return false;
    }
    if (basement !== undefined) {
      const wantBasement = basement === "true" || basement === "1" || basement === true;
      if (item.has_basement !== wantBasement) return false;
    }
    if (garage !== undefined) {
      const wantGarage = garage === "true" || garage === "1" || garage === true;
      if (item.has_garage !== wantGarage) return false;
    }
    if (rooftop && item.rooftop_type !== rooftop) {
      return false;
    }
    if (searchTerm) {
      const matchTitle = item.title.toLowerCase().includes(searchTerm);
      const matchStyle = item.architectural_style?.toLowerCase().includes(searchTerm);
      const matchDesc = item.description?.toLowerCase().includes(searchTerm);
      const matchFeatures = item.features?.some((f) =>
        f.toLowerCase().includes(searchTerm)
      );
      if (!matchTitle && !matchStyle && !matchDesc && !matchFeatures) {
        return false;
      }
    }
    return true;
  });

  if (targetFloor !== null && !hasExactFloorMatch) {
    return filtered.sort(
      (a, b) =>
        Math.abs(a.floors - targetFloor) - Math.abs(b.floors - targetFloor)
    );
  }

  return filtered;
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  const dbStatus = getStatus();
  res.json({
    ok: true,
    hasKey: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL,
    database: dbStatus,
  });
});

// ============================================================
// FEATURE 2: SMART DESIGN SUGGESTIONS API
// ============================================================

/**
 * GET /api/designs/search
 * Filter designs based on query parameters:
 *   - floors: 5 or 10
 *   - min_katha: e.g. 3.5, 5.0 (returns designs with min_katha <= value)
 *   - basement: 'true' / 'false'
 *   - garage: 'true' / 'false'
 *   - rooftop: 'Garden' / 'Open Terrace' / 'Helipad'
 *   - q / search: free-text search string
 */
app.get("/api/designs/search", async (req, res) => {
  const { floors, min_katha, basement, garage, rooftop, q, search } = req.query;
  const dbStatus = getStatus();

  // If MySQL is connected, query the live database
  if (dbStatus.connected) {
    try {
      let sql = "SELECT * FROM designs WHERE 1=1";
      const queryParams = [];

      if (floors) {
        sql += " AND floors = ?";
        queryParams.push(parseInt(floors, 10));
      }
      if (min_katha) {
        sql += " AND min_katha <= ?";
        queryParams.push(parseFloat(min_katha));
      }
      if (basement !== undefined) {
        sql += " AND has_basement = ?";
        queryParams.push(basement === "true" || basement === "1" ? 1 : 0);
      }
      if (garage !== undefined) {
        sql += " AND has_garage = ?";
        queryParams.push(garage === "true" || garage === "1" ? 1 : 0);
      }
      if (rooftop) {
        sql += " AND rooftop_type = ?";
        queryParams.push(rooftop);
      }

      const searchTerm = q || search;
      if (searchTerm && String(searchTerm).trim()) {
        sql +=
          " AND (title LIKE ? OR architectural_style LIKE ? OR description LIKE ?)";
        const pattern = `%${String(searchTerm).trim()}%`;
        queryParams.push(pattern, pattern, pattern);
      }

      sql += " ORDER BY id ASC";

      const rows = await query(sql, queryParams);

      // Parse features JSON if string
      const parsedRows = rows.map((row) => ({
        ...row,
        has_basement: Boolean(row.has_basement),
        has_garage: Boolean(row.has_garage),
        features:
          typeof row.features === "string"
            ? JSON.parse(row.features)
            : row.features || [],
      }));

      return res.json({
        success: true,
        source: "mysql",
        count: parsedRows.length,
        designs: parsedRows,
      });
    } catch (err) {
      console.error("[MySQL Search Error]:", err);
      // Fallback to in-memory filter if query fails
    }
  }

  // In-Memory Fallback
  const results = filterInMemory(req.query);
  res.json({
    success: true,
    source: "memory_catalog",
    count: results.length,
    designs: results,
  });
});

/**
 * GET /api/designs
 * Retrieve all designs catalog.
 */
app.get("/api/designs", async (req, res) => {
  const dbStatus = getStatus();

  if (dbStatus.connected) {
    try {
      const rows = await query("SELECT * FROM designs ORDER BY id ASC;");
      const parsedRows = rows.map((row) => ({
        ...row,
        has_basement: Boolean(row.has_basement),
        has_garage: Boolean(row.has_garage),
        features:
          typeof row.features === "string"
            ? JSON.parse(row.features)
            : row.features || [],
      }));
      return res.json({ success: true, count: parsedRows.length, designs: parsedRows });
    } catch (err) {
      console.error("[MySQL Get All Error]:", err);
    }
  }

  const allDesigns = SEED_DESIGNS.map((d, index) => ({ id: index + 1, ...d }));
  res.json({ success: true, count: allDesigns.length, designs: allDesigns });
});

/**
 * GET /api/designs/:id
 * Retrieve single design details by ID.
 */
app.get("/api/designs/:id", async (req, res) => {
  const { id } = req.params;
  const designId = parseInt(id, 10);
  const dbStatus = getStatus();

  if (dbStatus.connected) {
    try {
      const rows = await query("SELECT * FROM designs WHERE id = ? LIMIT 1;", [
        designId,
      ]);
      if (rows && rows.length > 0) {
        const row = rows[0];
        return res.json({
          success: true,
          design: {
            ...row,
            has_basement: Boolean(row.has_basement),
            has_garage: Boolean(row.has_garage),
            features:
              typeof row.features === "string"
                ? JSON.parse(row.features)
                : row.features || [],
          },
        });
      }
      return res.status(404).json({ error: "Design not found" });
    } catch (err) {
      console.error("[MySQL Get By ID Error]:", err);
    }
  }

  const found = SEED_DESIGNS.find((_, idx) => idx + 1 === designId);
  if (found) {
    return res.json({ success: true, design: { id: designId, ...found } });
  }
  res.status(404).json({ error: "Design not found" });
});

// ============================================================
// FEATURE 1: ASK BUILDING CODE (GEMINI AI PROXY)
// ============================================================

app.post("/api/ask-building-code", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: "Missing 'question' in request body." });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Server is missing GEMINI_API_KEY. Check backend/.env.",
      });
    }

    const fullPrompt = `${SYSTEM_CONTEXT}\n\nUser question:\n${String(question).trim()}`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 800 },
    };

    const geminiResponse = await fetch(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      return res.status(502).json({ error: "Gemini API request failed." });
    }

    const data = await geminiResponse.json();
    const answerText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("").trim() ||
      "Unable to process question. Please try again.";

    res.json({ answer: answerText });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(` CivilHub Backend Server running on http://localhost:${PORT}`);
  console.log(` Gemini model: ${GEMINI_MODEL}`);
  console.log(` Gemini API key loaded: ${Boolean(GEMINI_API_KEY)}`);

  // Initialize DB asynchronously
  await initDB();
  console.log(`====================================================`);
});