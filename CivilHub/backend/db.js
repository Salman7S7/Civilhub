// backend/db.js
// -----------------------------------------------------------------------------
// MySQL Database Pool Configuration for CivilHub Platform
// -----------------------------------------------------------------------------
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "civilhub_db",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
const DB_ENABLED = process.env.DB_ENABLED !== "false";

let pool = null;
let isConnected = false;

/**
 * Initialize MySQL Connection Pool and ensure all required tables exist.
 */
async function initDB() {
  if (!DB_ENABLED) {
    isConnected = false;
    console.log("[MySQL] Disabled for local development. Using built-in catalog data.");
    return false;
  }

  try {
    // 1. Create database if it does not exist
    const rootConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port,
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`
    );
    await rootConnection.end();

 
    pool = mysql.createPool(DB_CONFIG);


    const testConn = await pool.getConnection();
    testConn.release();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS designs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        floors INT NOT NULL,
        has_basement BOOLEAN DEFAULT 0,
        has_garage BOOLEAN DEFAULT 0,
        rooftop_type VARCHAR(50) DEFAULT 'Open Terrace',
        min_katha DECIMAL(4,2) NOT NULL,
        built_area_sqft INT DEFAULT NULL,
        units_per_floor INT DEFAULT 1,
        unit_size_sqft INT DEFAULT 1500,
        bedrooms INT DEFAULT 3,
        bathrooms INT DEFAULT 3,
        balconies INT DEFAULT 2,
        dining_space VARCHAR(150) DEFAULT NULL,
        drawing_space VARCHAR(150) DEFAULT NULL,
        kitchen_space VARCHAR(150) DEFAULT NULL,
        parking_capacity INT DEFAULT 0,
        architectural_style VARCHAR(100) DEFAULT NULL,
        image_url VARCHAR(500) NOT NULL,
        description TEXT DEFAULT NULL,
        features JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    // Helper to safely add column if not exists
    const addColumnIfNotExists = async (colName, colDef) => {
      try {
        const [cols] = await pool.query(
          `SHOW COLUMNS FROM designs LIKE ?`,
          [colName]
        );
        if (cols.length === 0) {
          await pool.query(`ALTER TABLE designs ADD COLUMN ${colName} ${colDef}`);
        }
      } catch (_e) {}
    };

    await addColumnIfNotExists("unit_size_sqft", "INT DEFAULT 1500");
    await addColumnIfNotExists("bedrooms", "INT DEFAULT 3");
    await addColumnIfNotExists("bathrooms", "INT DEFAULT 3");
    await addColumnIfNotExists("balconies", "INT DEFAULT 2");
    await addColumnIfNotExists("dining_space", "VARCHAR(150) DEFAULT NULL");
    await addColumnIfNotExists("drawing_space", "VARCHAR(150) DEFAULT NULL");
    await addColumnIfNotExists("kitchen_space", "VARCHAR(150) DEFAULT NULL");
    await addColumnIfNotExists("updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    // 4. Ensure construction_rates table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS construction_rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        grade VARCHAR(50) UNIQUE NOT NULL,
        rate_per_sqft INT NOT NULL,
        structure_share DECIMAL(4,3) DEFAULT 0.450,
        finishing_share DECIMAL(4,3) DEFAULT 0.300,
        electrical_share DECIMAL(4,3) DEFAULT 0.120,
        plumbing_share DECIMAL(4,3) DEFAULT 0.130,
        basement_rate_factor DECIMAL(4,2) DEFAULT 1.25,
        basement_area_factor DECIMAL(4,2) DEFAULT 0.90,
        garage_rate_factor DECIMAL(4,2) DEFAULT 0.80,
        garage_area_sqft INT DEFAULT 250,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 5. Ensure cost_estimates table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cost_estimates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        floors INT NOT NULL,
        floor_area_sqft INT NOT NULL,
        quality VARCHAR(50) NOT NULL,
        has_basement BOOLEAN DEFAULT 0,
        has_garage BOOLEAN DEFAULT 0,
        rate_per_sqft INT NOT NULL,
        total_built_up_area INT NOT NULL,
        structure_cost BIGINT NOT NULL,
        finishing_cost BIGINT NOT NULL,
        electrical_cost BIGINT NOT NULL,
        plumbing_cost BIGINT NOT NULL,
        total_cost_bdt BIGINT NOT NULL,
        design_id INT DEFAULT NULL,
        design_title VARCHAR(150) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Ensure feasibility_logs table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feasibility_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        land_katha DECIMAL(5,2) NOT NULL,
        road_width_ft DECIMAL(5,2) NOT NULL,
        floors INT NOT NULL,
        authority VARCHAR(50) DEFAULT 'RAJUK',
        is_permissible BOOLEAN NOT NULL,
        max_permissible_height VARCHAR(50) DEFAULT NULL,
        far_ratio DECIMAL(4,2) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Seed default construction rates if empty
    const [rateRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM construction_rates;`
    );
    if (rateRows[0].count === 0) {
      await pool.query(`
        INSERT INTO construction_rates (grade, rate_per_sqft, structure_share, finishing_share, electrical_share, plumbing_share)
        VALUES 
          ('standard', 2200, 0.45, 0.30, 0.12, 0.13),
          ('premium',  2800, 0.45, 0.30, 0.12, 0.13),
          ('luxury',   3600, 0.45, 0.30, 0.12, 0.13);
      `);
      console.log("[MySQL] Default construction rates seeded successfully.");
    }

    await pool.query(createTableQuery);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        engineer_type VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist if table was previously created without them
    try {
      const [roleCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
      if (roleCol.length === 0) {
        await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'client'");
      }
      const [engCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'engineer_type'");
      if (engCol.length === 0) {
        await pool.query("ALTER TABLE users ADD COLUMN engineer_type VARCHAR(50) DEFAULT NULL");
      }
    } catch (_colErr) {}

    // Seed default demo users if users table is empty
    const [userRows] = await pool.query("SELECT COUNT(*) AS count FROM users");
    if (userRows[0].count === 0) {
      const hash = bcrypt.hashSync("password123", 10);
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, engineer_type) VALUES
          ('CivilHub Client', 'demo@civilhub.com', ?, 'client', NULL),
          ('Client Salman', 'salman@civilhub.com', ?, 'client', NULL),
          ('Ar. Nusrat Jahan', 'arc@civilhub.com', ?, 'engineer', 'architect'),
          ('Engr. Tanvir Ahmed, PEng', 'structure@civilhub.com', ?, 'engineer', 'structural'),
          ('Engr. Mohammad Rafiqul', 'soil@civilhub.com', ?, 'engineer', 'soil')
      `, [hash, hash, hash, hash, hash]);
      console.log("[MySQL] Default demo users seeded successfully.");
    }

    // 8. Ensure experts table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        title VARCHAR(150) NOT NULL,
        role_label VARCHAR(50) NOT NULL,
        discipline VARCHAR(50) NOT NULL,
        license VARCHAR(50) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        firm VARCHAR(150) NOT NULL,
        rating VARCHAR(50) NOT NULL,
        specialties JSON NOT NULL,
        thread_id VARCHAR(100) NOT NULL UNIQUE,
        avatar_initials VARCHAR(10) NOT NULL,
        avatar_color VARCHAR(20) NOT NULL,
        greeting TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Seed default verified consultants if empty
    const [expertRows] = await pool.query("SELECT COUNT(*) AS count FROM experts");
    if (expertRows[0].count === 0) {
      const DEFAULT_EXPERTS = [
        [
          "architect_1",
          "Ar. Nusrat Jahan",
          "Senior Architect (Arc)",
          "Architect",
          "architect",
          "IAB-K2104",
          "12 years exp",
          "Studio Nirman Dhaka",
          "4.9 ★ (84 reviews)",
          JSON.stringify(["Floor Layouts", "FAR Calculation", "RAJUK & CDA Approval"]),
          "thread_client_architect_1",
          "NJ",
          "#0284c7",
          "Hello! I am Ar. Nusrat Jahan, your Architectural Consultant (IAB-K2104).\n\nI can assist you with Floor Area Ratio (FAR) calculations, mandatory front/rear setbacks, architectural floor layouts, and RAJUK/CDA approval preparation.",
          1,
        ],
        [
          "architect_2",
          "Ar. Mahmudul Hasan",
          "Principal Urban Architect",
          "Architect",
          "architect",
          "IAB-M3190",
          "8 years exp",
          "Hasan & Associates",
          "4.8 ★ (56 reviews)",
          JSON.stringify(["Residential Elevation", "Interior Space Planning", "Green Building"]),
          "thread_client_architect_2",
          "MH",
          "#0369a1",
          "Hello! I am Ar. Mahmudul Hasan (IAB-M3190). I specialize in modern residential elevation, sustainable building envelopes, and RAJUK building code compliance.",
          1,
        ],
        [
          "structural_1",
          "Engr. Tanvir Ahmed, PEng",
          "Principal Structural Engineer",
          "Structure Eng",
          "structural",
          "MIEB-18492",
          "15 years exp",
          "Dhaka Structural Dynamics",
          "5.0 ★ (112 reviews)",
          JSON.stringify(["BNBC 2020", "Seismic RCC Detailing", "Shear Wall Design"]),
          "thread_client_structural_1",
          "TA",
          "#2563eb",
          "Hello! I am Engr. Tanvir Ahmed, PEng (MIEB-18492).\n\nI can help you evaluate column and shear wall sizing, earthquake-resistant RCC frame detailing, structural drawing review, and BNBC 2020 structural safety compliance.",
          1,
        ],
        [
          "structural_2",
          "Engr. Shahriar Kabir",
          "Senior RCC Frame Specialist",
          "Structure Eng",
          "structural",
          "MIEB-22104",
          "9 years exp",
          "Apex Structural Engineers",
          "4.9 ★ (63 reviews)",
          JSON.stringify(["High-rise Detailing", "Beam-Column Joints", "ETABS Modeling"]),
          "thread_client_structural_2",
          "SK",
          "#1d4ed8",
          "Hello! I am Engr. Shahriar Kabir (MIEB-22104). I specialize in high-rise RCC framing, ductile rebar confinement, and ETABS structural analysis.",
          1,
        ],
        [
          "soil_1",
          "Engr. Mohammad Rafiqul",
          "Geotechnical & Soil Specialist",
          "Soil Eng",
          "soil",
          "FIEB-09812",
          "18 years exp",
          "Bengal Geotechnical Lab",
          "4.9 ★ (92 reviews)",
          JSON.stringify(["Borehole SPT N-Value", "Bored Cast-in-Situ Piling", "Pile Load Test"]),
          "thread_client_soil_1",
          "MR",
          "#059669",
          "Hello! I am Engr. Mohammad Rafiqul, your Geotechnical & Soil Specialist (FIEB-09812).\n\nI specialize in soil test review, borehole SPT N-value interpretation, allowable bearing capacity calculation, and cast-in-situ bored pile foundation design.",
          1,
        ],
        [
          "soil_2",
          "Engr. Anisur Rahman",
          "Foundation & Soil Consultant",
          "Soil Eng",
          "soil",
          "MIEB-17632",
          "11 years exp",
          "Delta Geo-Engineering",
          "4.8 ★ (47 reviews)",
          JSON.stringify(["Mat / Raft Footing", "Differential Settlement", "Soil Improvement"]),
          "thread_client_soil_2",
          "AR",
          "#047857",
          "Hello! I am Engr. Anisur Rahman (MIEB-17632). I evaluate soil bearing capacity, settlement risks in alluvial silt, and mat foundation suitability.",
          1,
        ],
      ];

      for (const exp of DEFAULT_EXPERTS) {
        await pool.query(
          `INSERT INTO experts (
            id, name, title, role_label, discipline, license, experience, firm,
            rating, specialties, thread_id, avatar_initials, avatar_color, greeting, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          exp
        );
      }
      console.log("[MySQL] Default verified experts seeded successfully.");
    }

    // 9. Ensure consultation_messages table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultation_messages (
        id VARCHAR(100) PRIMARY KEY,
        thread_id VARCHAR(100) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        engineer_type VARCHAR(50) DEFAULT NULL,
        sender_name VARCHAR(120) NOT NULL,
        message_text TEXT NOT NULL,
        attached_context JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_thread_created (thread_id, created_at)
      );
    `);
    isConnected = true;
    console.log(`[MySQL] Connected to database '${DB_CONFIG.database}' successfully.`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(
      `[MySQL Warning] Could not connect to MySQL (${error.message}). Backend will use built-in catalog data.`
    );
    return false;
  }
}

async function query(sql, params = []) {
  if (!pool || !isConnected) {
    throw new Error("Database is not connected");
  }
  const [rows] = await pool.query(sql, params);
  return rows;
}

function getStatus() {
  return {
    enabled: DB_ENABLED,
    connected: isConnected,
    database: DB_CONFIG.database,
    host: DB_CONFIG.host,
  };
}

module.exports = {
  initDB,
  query,
  getStatus,
};
