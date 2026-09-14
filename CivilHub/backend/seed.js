// backend/seed.js
// -----------------------------------------------------------------------------
// Database Seeder Script: Populates MySQL `designs` & `construction_rates` tables.
// Run: node seed.js
// -----------------------------------------------------------------------------

require("dotenv").config();
const { initDB, query } = require("./db");
const { SEED_DESIGNS } = require("./seedData");

async function runSeed() {
  console.log("🌱 Starting CivilHub Database Seeding...");

  const connected = await initDB();
  if (!connected) {
    console.error(
      "❌ Could not connect to MySQL. Ensure MySQL server is running and check backend/.env credentials."
    );
    process.exit(1);
  }

  try {
    // 1. Seed Architectural Designs
    console.log("📐 Seeding architectural designs catalog...");
    await query("DELETE FROM designs WHERE id > 0;");
    await query("ALTER TABLE designs AUTO_INCREMENT = 1;");

    const insertSql = `
      INSERT INTO designs (
        title, floors, has_basement, has_garage, rooftop_type,
        min_katha, built_area_sqft, units_per_floor, unit_size_sqft,
        bedrooms, bathrooms, balconies, dining_space, drawing_space, kitchen_space,
        parking_capacity, architectural_style, image_url, description, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const design of SEED_DESIGNS) {
      await query(insertSql, [
        design.title,
        design.floors,
        design.has_basement ? 1 : 0,
        design.has_garage ? 1 : 0,
        design.rooftop_type || "Open Terrace",
        design.min_katha,
        design.built_area_sqft || null,
        design.units_per_floor || 1,
        design.unit_size_sqft || 1500,
        design.bedrooms || 3,
        design.bathrooms || 3,
        design.balconies || 2,
        design.dining_space || null,
        design.drawing_space || null,
        design.kitchen_space || null,
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

    // 2. Seed Construction Rates
    console.log("💰 Verifying / Seeding construction rates...");
    await query("DELETE FROM construction_rates WHERE id > 0;");
    await query("ALTER TABLE construction_rates AUTO_INCREMENT = 1;");

    const insertRateSql = `
      INSERT INTO construction_rates (
        grade, rate_per_sqft, structure_share, finishing_share,
        electrical_share, plumbing_share, basement_rate_factor,
        basement_area_factor, garage_rate_factor, garage_area_sqft
      ) VALUES 
        ('standard', 2200, 0.450, 0.300, 0.120, 0.130, 1.25, 0.90, 0.80, 250),
        ('premium',  2800, 0.450, 0.300, 0.120, 0.130, 1.25, 0.90, 0.80, 250),
        ('luxury',   3600, 0.450, 0.300, 0.120, 0.130, 1.25, 0.90, 0.80, 250);
    `;
    await query(insertRateSql);
    console.log("✅ Successfully seeded standard, premium, and luxury rates into 'construction_rates'.");

    console.log("🚀 CivilHub database seeding finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
