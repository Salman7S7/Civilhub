// backend/seed.js
// -----------------------------------------------------------------------------
// Database Seeder Script: Populates MySQL `designs` table with curated models.
// Run: npm run seed
// -----------------------------------------------------------------------------

require("dotenv").config();
const { initDB, query } = require("./db");
const { SEED_DESIGNS } = require("./seedData");

async function runSeed() {
  console.log("🌱 Starting CivilHub Architectural Designs Database Seeding...");

  const connected = await initDB();
  if (!connected) {
    console.error(
      "❌ Could not connect to MySQL. Ensure MySQL server is running and check backend/.env credentials."
    );
    process.exit(1);
  }

  try {
    // Check existing count
    const countResult = await query("SELECT COUNT(*) AS total FROM designs;");
    const totalExisting = countResult[0]?.total || 0;

    if (totalExisting > 0) {
      console.log(
        `ℹ️  The 'designs' table already contains ${totalExisting} entries. Refreshing catalog...`
      );
      await query("TRUNCATE TABLE designs;");
    }

    const insertSql = `
      INSERT INTO designs (
        title, floors, has_basement, has_garage, rooftop_type,
        min_katha, built_area_sqft, units_per_floor, parking_capacity,
        architectural_style, image_url, description, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const design of SEED_DESIGNS) {
      await query(insertSql, [
        design.title,
        design.floors,
        design.has_basement ? 1 : 0,
        design.has_garage ? 1 : 0,
        design.rooftop_type,
        design.min_katha,
        design.built_area_sqft || null,
        design.units_per_floor || 1,
        design.parking_capacity || 0,
        design.architectural_style || null,
        design.image_url,
        design.description || null,
        JSON.stringify(design.features || []),
      ]);
    }

    console.log(
      `✅ Successfully seeded ${SEED_DESIGNS.length} architectural designs into 'designs' table.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
