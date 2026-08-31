// backend/db.js
// -----------------------------------------------------------------------------
// MySQL Database Pool Configuration for Feature 2: Smart Design Suggestions
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

let pool = null;
let isConnected = false;

/**
 * Initialize MySQL Connection Pool and ensure table exists.
 */
async function initDB() {
  try {
    // 1. Create database if it does not exist (connect without DB specified first)
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

    // 2. Create the connection pool with the target database
    pool = mysql.createPool(DB_CONFIG);

    // Test connection
    const testConn = await pool.getConnection();
    testConn.release();

    // 3. Ensure designs table exists
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
        parking_capacity INT DEFAULT 0,
        architectural_style VARCHAR(100) DEFAULT NULL,
        image_url VARCHAR(500) NOT NULL,
        description TEXT DEFAULT NULL,
        features JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
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

/**
 * Execute a parameterized SQL query.
 *
 * @param {string} sql - SQL query string with ? placeholders
 * @param {Array} params - Parameters array
 * @returns {Promise<Array>} - Query result rows
 */
async function query(sql, params = []) {
  if (!pool || !isConnected) {
    throw new Error("Database is not connected");
  }
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Check if the database connection is currently active.
 */
function getStatus() {
  return {
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
