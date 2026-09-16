// backend/db.js
// -----------------------------------------------------------------------------
// MySQL Database Pool Configuration for CivilHub Platform
// -----------------------------------------------------------------------------
require("dotenv").config();
const mysql = require("mysql2/promise");

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
