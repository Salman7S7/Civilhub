// backend/server.js
// -----------------------------------------------------------------------------
// CivilHub Mobile Backend:
// 1. Feature 1: Gemini AI Bangladesh Building Code Proxy & Feasibility Database
// 2. Feature 2: Smart Design Suggestions MySQL Filter Engine & CRUD API
// 3. Feature 3: Interactive Cost Estimator Live Rates & Estimation Logging API
// -----------------------------------------------------------------------------

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { initDB, query, getStatus } = require("./db");
const { SEED_DESIGNS } = require("./seedData");

const costEstimatorRouter = require("./costEstimator");

const app = express();
const fallbackUsers = [];

// ============================================================
// Middleware
// ============================================================

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ============================================================
// COST ESTIMATOR 
// 
// ============================================================

app.use(
  "/api/cost-estimator",
  costEstimatorRouter
);

// ============================================================
// Configuration
// ============================================================

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const JWT_SECRET = process.env.JWT_SECRET || "civilhub-development-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
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

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Server is missing JWT_SECRET." });
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

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
// AUTHENTICATION API
// ============================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "Server is missing JWT_SECRET." });
    }

    if (!getStatus().connected) {
      if (fallbackUsers.some((user) => user.email === email)) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = { id: Date.now(), name, email, passwordHash };
      fallbackUsers.push(user);
      const safeUser = { id: user.id, name: user.name, email: user.email };
      return res.status(201).json({ success: true, token: createToken(safeUser), user: safeUser });
    }

    const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    const user = { id: result.insertId, name, email };

    return res.status(201).json({ success: true, token: createToken(user), user });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Could not create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "Server is missing JWT_SECRET." });
    }

    if (!getStatus().connected) {
      const user = fallbackUsers.find((candidate) => candidate.email === email);
      const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const safeUser = { id: user.id, name: user.name, email: user.email };
      return res.json({ success: true, token: createToken(safeUser), user: safeUser });
    }

    const rows = await query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    const passwordMatches = user && await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    return res.json({ success: true, token: createToken(safeUser), user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Could not log in." });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1",
      [req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found." });
    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ error: "Could not load profile." });
  }
});

// ============================================================
// FEATURE 2: SMART DESIGN SUGGESTIONS API
// ============================================================

/**
 * GET /api/designs/search
 * Filter designs based on query parameters
 */
app.get("/api/designs/search", async (req, res) => {
  const { floors, min_katha, basement, garage, rooftop, q, search, bedrooms } = req.query;
  const dbStatus = getStatus();

  if (dbStatus.connected) {
    try {
      let sql = "SELECT * FROM designs WHERE 1=1";
      const queryParams = [];

      if (floors && floors !== "all") {
        sql += " AND floors = ?";
        queryParams.push(parseInt(floors, 10));
      }
      if (min_katha && min_katha !== "all") {
        sql += " AND min_katha <= ?";
        queryParams.push(parseFloat(min_katha));
      }
      if (basement !== undefined && basement !== "all") {
        sql += " AND has_basement = ?";
        queryParams.push(basement === "true" || basement === "1" ? 1 : 0);
      }
      if (garage !== undefined && garage !== "all") {
        sql += " AND has_garage = ?";
        queryParams.push(garage === "true" || garage === "1" ? 1 : 0);
      }
      if (rooftop && rooftop !== "all") {
        sql += " AND rooftop_type = ?";
        queryParams.push(rooftop);
      }
      if (bedrooms && bedrooms !== "all") {
        sql += " AND bedrooms >= ?";
        queryParams.push(parseInt(bedrooms, 10));
      }

      const searchTerm = q || search;
      if (searchTerm && String(searchTerm).trim()) {
        sql +=
          " AND (title LIKE ? OR architectural_style LIKE ? OR description LIKE ?)";
        const pattern = `%${String(searchTerm).trim()}%`;
        queryParams.push(pattern, pattern, pattern);
      }

      sql += " ORDER BY id DESC";

      const rows = await query(sql, queryParams);

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
 * Retrieve all designs catalog from MySQL
 */
app.get("/api/designs", async (req, res) => {
  const dbStatus = getStatus();

  if (dbStatus.connected) {
    try {
      const rows = await query("SELECT * FROM designs ORDER BY id DESC;");
      const parsedRows = rows.map((row) => ({
        ...row,
        has_basement: Boolean(row.has_basement),
        has_garage: Boolean(row.has_garage),
        features:
          typeof row.features === "string"
            ? JSON.parse(row.features)
            : row.features || [],
      }));
      return res.json({ success: true, source: "mysql", count: parsedRows.length, designs: parsedRows });
    } catch (err) {
      console.error("[MySQL Get All Error]:", err);
    }
  }

  const allDesigns = SEED_DESIGNS.map((d, index) => ({ id: index + 1, ...d }));
  res.json({ success: true, source: "memory_catalog", count: allDesigns.length, designs: allDesigns });
});

/**
 * GET /api/designs/:id
 * Retrieve single design details by ID from MySQL
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
          source: "mysql",
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

/**
 * POST /api/designs
 * Create and insert a new custom design into MySQL database
 */
app.post("/api/designs", async (req, res) => {
  const dbStatus = getStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({ error: "Database not connected" });
  }

  try {
    const data = req.body;
    if (!data.title || !data.floors) {
      return res.status(400).json({ error: "Missing required fields: title, floors" });
    }

    const insertSql = `
      INSERT INTO designs (
        title, floors, has_basement, has_garage, rooftop_type,
        min_katha, built_area_sqft, units_per_floor, unit_size_sqft,
        bedrooms, bathrooms, balconies, dining_space, drawing_space, kitchen_space,
        parking_capacity, architectural_style, image_url, description, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const params = [
      data.title.trim(),
      parseInt(data.floors, 10) || 5,
      data.has_basement ? 1 : 0,
      data.has_garage ? 1 : 0,
      data.rooftop_type || "Open Terrace",
      parseFloat(data.min_katha) || 4.0,
      parseInt(data.built_area_sqft, 10) || 12000,
      parseInt(data.units_per_floor, 10) || 2,
      parseInt(data.unit_size_sqft, 10) || 1500,
      parseInt(data.bedrooms, 10) || 3,
      parseInt(data.bathrooms, 10) || 3,
      parseInt(data.balconies, 10) || 2,
      data.dining_space || null,
      data.drawing_space || null,
      data.kitchen_space || null,
      parseInt(data.parking_capacity, 10) || (data.has_garage ? 4 : 0),
      data.architectural_style || "Contemporary Urban",
      data.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      data.description || null,
      JSON.stringify(data.features || []),
    ];

    const result = await query(insertSql, params);
    const newId = result.insertId;

    const [createdRows] = await query("SELECT * FROM designs WHERE id = ?;", [newId]);
    const created = createdRows || { id: newId, ...data };

    res.status(201).json({
      success: true,
      message: "Design created successfully in MySQL",
      design: {
        ...created,
        has_basement: Boolean(created.has_basement),
        has_garage: Boolean(created.has_garage),
        features: typeof created.features === "string" ? JSON.parse(created.features) : created.features || [],
      },
    });
  } catch (err) {
    console.error("[MySQL Create Design Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/designs/:id
 * Update design specifications and rooms in MySQL database
 */
app.put("/api/designs/:id", async (req, res) => {
  const dbStatus = getStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({ error: "Database not connected" });
  }

  const { id } = req.params;
  const designId = parseInt(id, 10);
  const data = req.body;

  try {
    const updateSql = `
      UPDATE designs SET
        title = COALESCE(?, title),
        floors = COALESCE(?, floors),
        has_basement = COALESCE(?, has_basement),
        has_garage = COALESCE(?, has_garage),
        rooftop_type = COALESCE(?, rooftop_type),
        min_katha = COALESCE(?, min_katha),
        built_area_sqft = COALESCE(?, built_area_sqft),
        units_per_floor = COALESCE(?, units_per_floor),
        unit_size_sqft = COALESCE(?, unit_size_sqft),
        bedrooms = COALESCE(?, bedrooms),
        bathrooms = COALESCE(?, bathrooms),
        balconies = COALESCE(?, balconies),
        dining_space = COALESCE(?, dining_space),
        drawing_space = COALESCE(?, drawing_space),
        kitchen_space = COALESCE(?, kitchen_space),
        parking_capacity = COALESCE(?, parking_capacity),
        architectural_style = COALESCE(?, architectural_style),
        description = COALESCE(?, description)
      WHERE id = ?;
    `;

    const params = [
      data.title ? data.title.trim() : null,
      data.floors ? parseInt(data.floors, 10) : null,
      data.has_basement !== undefined ? (data.has_basement ? 1 : 0) : null,
      data.has_garage !== undefined ? (data.has_garage ? 1 : 0) : null,
      data.rooftop_type || null,
      data.min_katha ? parseFloat(data.min_katha) : null,
      data.built_area_sqft ? parseInt(data.built_area_sqft, 10) : null,
      data.units_per_floor ? parseInt(data.units_per_floor, 10) : null,
      data.unit_size_sqft ? parseInt(data.unit_size_sqft, 10) : null,
      data.bedrooms ? parseInt(data.bedrooms, 10) : null,
      data.bathrooms ? parseInt(data.bathrooms, 10) : null,
      data.balconies ? parseInt(data.balconies, 10) : null,
      data.dining_space !== undefined ? data.dining_space : null,
      data.drawing_space !== undefined ? data.drawing_space : null,
      data.kitchen_space !== undefined ? data.kitchen_space : null,
      data.parking_capacity ? parseInt(data.parking_capacity, 10) : null,
      data.architectural_style || null,
      data.description || null,
      designId,
    ];

    await query(updateSql, params);

    const rows = await query("SELECT * FROM designs WHERE id = ?;", [designId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Design not found" });
    }

    const updated = rows[0];
    res.json({
      success: true,
      message: "Design updated in MySQL",
      design: {
        ...updated,
        has_basement: Boolean(updated.has_basement),
        has_garage: Boolean(updated.has_garage),
        features: typeof updated.features === "string" ? JSON.parse(updated.features) : updated.features || [],
      },
    });
  } catch (err) {
    console.error("[MySQL Update Design Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/designs/:id
 * Remove a design from MySQL database
 */
app.delete("/api/designs/:id", async (req, res) => {
  const dbStatus = getStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({ error: "Database not connected" });
  }

  const { id } = req.params;
  const designId = parseInt(id, 10);

  try {
    const result = await query("DELETE FROM designs WHERE id = ?;", [designId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Design not found" });
    }
    res.json({ success: true, message: `Design ${designId} deleted from MySQL` });
  } catch (err) {
    console.error("[MySQL Delete Design Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// FEATURE 3: COST ESTIMATOR DATABASE API (MySQL PRIMARY)
// ============================================================

/**
 * GET /api/costs/rates
 * Retrieve live construction rates and formula weights from MySQL
 */
app.get("/api/costs/rates", async (req, res) => {
  const dbStatus = getStatus();
  if (dbStatus.connected) {
    try {
      const rows = await query("SELECT * FROM construction_rates;");
      if (rows && rows.length > 0) {
        const ratesMap = {};
        rows.forEach((r) => {
          ratesMap[r.grade] = {
            rate_per_sqft: r.rate_per_sqft,
            structure_share: parseFloat(r.structure_share),
            finishing_share: parseFloat(r.finishing_share),
            electrical_share: parseFloat(r.electrical_share),
            plumbing_share: parseFloat(r.plumbing_share),
            basement_rate_factor: parseFloat(r.basement_rate_factor),
            basement_area_factor: parseFloat(r.basement_area_factor),
            garage_rate_factor: parseFloat(r.garage_rate_factor),
            garage_area_sqft: r.garage_area_sqft,
          };
        });
        return res.json({ success: true, source: "mysql", rates: ratesMap });
      }
    } catch (err) {
      console.error("[MySQL Cost Rates Error]:", err);
    }
  }

  // Fallback defaults
  res.json({
    success: true,
    source: "fallback",
    rates: {
      standard: { rate_per_sqft: 2200, structure_share: 0.45, finishing_share: 0.3, electrical_share: 0.12, plumbing_share: 0.13 },
      premium:  { rate_per_sqft: 2800, structure_share: 0.45, finishing_share: 0.3, electrical_share: 0.12, plumbing_share: 0.13 },
      luxury:   { rate_per_sqft: 3600, structure_share: 0.45, finishing_share: 0.3, electrical_share: 0.12, plumbing_share: 0.13 },
    },
  });
});

/**
 * POST /api/costs/estimate
 * Record a calculated cost estimate into MySQL cost_estimates table
 */
app.post("/api/costs/estimate", async (req, res) => {
  const dbStatus = getStatus();
  const {
    floors,
    floorAreaSqft,
    quality = "standard",
    hasBasement = false,
    hasGarage = false,
    designId = null,
    designTitle = null,
  } = req.body;

  if (!floors || !floorAreaSqft) {
    return res.status(400).json({ error: "Missing required fields: floors, floorAreaSqft" });
  }

  try {
    // Fetch rates from DB or fallback
    let ratePerSqft = 2200;
    let structureShare = 0.45;
    let finishingShare = 0.30;
    let electricalShare = 0.12;
    let plumbingShare = 0.13;
    let basementRateFactor = 1.25;
    let basementAreaFactor = 0.90;
    let garageRateFactor = 0.80;
    let garageAreaSqft = 250;

    if (dbStatus.connected) {
      const rows = await query("SELECT * FROM construction_rates WHERE grade = ? LIMIT 1;", [quality.toLowerCase()]);
      if (rows && rows.length > 0) {
        ratePerSqft = rows[0].rate_per_sqft;
        structureShare = parseFloat(rows[0].structure_share);
        finishingShare = parseFloat(rows[0].finishing_share);
        electricalShare = parseFloat(rows[0].electrical_share);
        plumbingShare = parseFloat(rows[0].plumbing_share);
        basementRateFactor = parseFloat(rows[0].basement_rate_factor);
        basementAreaFactor = parseFloat(rows[0].basement_area_factor);
        garageRateFactor = parseFloat(rows[0].garage_rate_factor);
        garageAreaSqft = rows[0].garage_area_sqft;
      }
    }

    const floorCount = Math.max(1, Math.floor(Number(floors) || 1));
    const areaPerFloor = Math.max(0, Number(floorAreaSqft) || 0);
    const floorsCost = floorCount * areaPerFloor * ratePerSqft;
    const basementCost = hasBasement ? areaPerFloor * basementAreaFactor * ratePerSqft * basementRateFactor : 0;
    const garageCost = hasGarage ? garageAreaSqft * ratePerSqft * garageRateFactor : 0;
    const totalCost = Math.round(floorsCost + basementCost + garageCost);
    const structureCost = Math.round(totalCost * structureShare);
    const finishingCost = Math.round(totalCost * finishingShare);
    const electricalCost = Math.round(totalCost * electricalShare);
    const plumbingCost = Math.round(totalCost * plumbingShare);
    const totalBuiltUpArea = Math.round(floorCount * areaPerFloor + (hasBasement ? areaPerFloor * basementAreaFactor : 0) + (hasGarage ? garageAreaSqft : 0));

    let insertedId = null;
    if (dbStatus.connected) {
      const insertSql = `
        INSERT INTO cost_estimates (
          floors, floor_area_sqft, quality, has_basement, has_garage,
          rate_per_sqft, total_built_up_area, structure_cost, finishing_cost,
          electrical_cost, plumbing_cost, total_cost_bdt, design_id, design_title
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const result = await query(insertSql, [
        floorCount,
        areaPerFloor,
        quality.toLowerCase(),
        hasBasement ? 1 : 0,
        hasGarage ? 1 : 0,
        ratePerSqft,
        totalBuiltUpArea,
        structureCost,
        finishingCost,
        electricalCost,
        plumbingCost,
        totalCost,
        designId || null,
        designTitle || null,
      ]);
      insertedId = result.insertId;
    }

    res.json({
      success: true,
      source: dbStatus.connected ? "mysql" : "computed",
      estimateId: insertedId,
      breakdown: {
        floors: floorCount,
        floorAreaSqft: areaPerFloor,
        quality,
        ratePerSqft,
        totalBuiltUpArea,
        structure: structureCost,
        finishing: finishingCost,
        electrical: electricalCost,
        plumbing: plumbingCost,
        total: totalCost,
        designTitle,
      },
    });
  } catch (err) {
    console.error("[Cost Estimate Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/costs/history
 * Retrieve recent cost estimates from MySQL
 */
app.get("/api/costs/history", async (req, res) => {
  const dbStatus = getStatus();
  if (dbStatus.connected) {
    try {
      const rows = await query("SELECT * FROM cost_estimates ORDER BY id DESC LIMIT 20;");
      return res.json({ success: true, count: rows.length, history: rows });
    } catch (err) {
      console.error("[Cost History Error]:", err);
    }
  }
  res.json({ success: true, count: 0, history: [] });
});

// ============================================================
// FEATURE 1: FEASIBILITY LOGGING & GEMINI AI PROXY
// ============================================================

/**
 * POST /api/feasibility/check
 * Record a feasibility evaluation in MySQL feasibility_logs
 */
app.post("/api/feasibility/check", async (req, res) => {
  const dbStatus = getStatus();
  const { land_katha, road_width_ft, floors, authority = "RAJUK", is_permissible, max_permissible_height, far_ratio, notes } = req.body;

  if (dbStatus.connected) {
    try {
      const insertSql = `
        INSERT INTO feasibility_logs (
          land_katha, road_width_ft, floors, authority, is_permissible,
          max_permissible_height, far_ratio, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const result = await query(insertSql, [
        parseFloat(land_katha) || 0,
        parseFloat(road_width_ft) || 0,
        parseInt(floors, 10) || 1,
        authority || "RAJUK",
        is_permissible ? 1 : 0,
        max_permissible_height || null,
        far_ratio ? parseFloat(far_ratio) : null,
        notes || null,
      ]);
      return res.json({ success: true, logId: result.insertId });
    } catch (err) {
      console.error("[Feasibility Log Error]:", err);
    }
  }
  res.json({ success: true, logId: null });
});

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
      GEMINI_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000),
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

  await initDB();
  console.log(`====================================================`);
});
