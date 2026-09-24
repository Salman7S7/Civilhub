// backend/seed.js
// -----------------------------------------------------------------------------
// Database Seeder Script: Populates all MySQL tables for CivilHub.
// Tables: users, experts, designs, construction_rates, cost_estimates,
//         feasibility_logs, consultation_messages.
// Password for all seeded users: password123
// Run: npm run seed  (or: node seed.js)
// -----------------------------------------------------------------------------

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const bcrypt = require("bcryptjs");
const { initDB, query } = require("./db");
const { SEED_DESIGNS } = require("./seedData");

async function runSeed() {
  console.log("[INFO] Starting CivilHub Database Seeding...");

  const connected = await initDB();
  if (!connected) {
    console.error(
      "[ERROR] Could not connect to MySQL. Ensure MySQL server is running and check backend/.env credentials."
    );
    process.exit(1);
  }

  try {
    const passwordHash = bcrypt.hashSync("password123", 10);

    // 1. Seed Users
    console.log("[INFO] Seeding users table...");
    await query("DELETE FROM users WHERE id > 0;");
    await query("ALTER TABLE users AUTO_INCREMENT = 1;");

    const SEED_USERS = [
      {
        name: "Client Salman",
        email: "salman@civilhub.com",
        password_hash: passwordHash,
        role: "client",
        engineer_type: null,
      },
      {
        name: "CivilHub Client",
        email: "client@civilhub.com",
        password_hash: passwordHash,
        role: "client",
        engineer_type: null,
      },
      {
        name: "Demo Client",
        email: "demo@civilhub.com",
        password_hash: passwordHash,
        role: "client",
        engineer_type: null,
      },
      {
        name: "Ar. Nusrat Jahan",
        email: "architect@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "architect",
      },
      {
        name: "Ar. Nusrat Jahan (Legacy)",
        email: "arc@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "architect",
      },
      {
        name: "Ar. Mahmudul Hasan",
        email: "mahmud@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "architect",
      },
      {
        name: "Engr. Tanvir Ahmed, PEng",
        email: "structural@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "structural",
      },
      {
        name: "Engr. Tanvir Ahmed (Legacy)",
        email: "structure@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "structural",
      },
      {
        name: "Engr. Shahriar Kabir",
        email: "kabir@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "structural",
      },
      {
        name: "Engr. Mohammad Rafiqul",
        email: "soil@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "soil",
      },
      {
        name: "Engr. Anisur Rahman",
        email: "anis@civilhub.com",
        password_hash: passwordHash,
        role: "engineer",
        engineer_type: "soil",
      },
    ];

    const insertUserSql = `
      INSERT INTO users (name, email, password_hash, role, engineer_type)
      VALUES (?, ?, ?, ?, ?);
    `;

    for (const u of SEED_USERS) {
      await query(insertUserSql, [u.name, u.email, u.password_hash, u.role, u.engineer_type]);
    }
    console.log(`[SUCCESS] Seeded ${SEED_USERS.length} users with password: password123`);

    // 2. Seed Experts
    console.log("[INFO] Seeding experts table...");
    await query("DELETE FROM experts;");

    const SEED_EXPERTS = [
      [
        "architect_1",
        "Ar. Nusrat Jahan",
        "Senior Architect (Arc)",
        "Architect",
        "architect",
        "IAB-K2104",
        "12 years exp",
        "Studio Nirman Dhaka",
        "4.9 (84 reviews)",
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
        "4.8 (56 reviews)",
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
        "5.0 (112 reviews)",
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
        "4.9 (63 reviews)",
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
        "4.9 (92 reviews)",
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
        "4.8 (47 reviews)",
        JSON.stringify(["Mat / Raft Footing", "Differential Settlement", "Soil Improvement"]),
        "thread_client_soil_2",
        "AR",
        "#047857",
        "Hello! I am Engr. Anisur Rahman (MIEB-17632). I evaluate soil bearing capacity, settlement risks in alluvial silt, and mat foundation suitability.",
        1,
      ],
    ];

    const insertExpertSql = `
      INSERT INTO experts (
        id, name, title, role_label, discipline, license, experience, firm,
        rating, specialties, thread_id, avatar_initials, avatar_color, greeting, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const exp of SEED_EXPERTS) {
      await query(insertExpertSql, exp);
    }
    console.log(`[SUCCESS] Seeded ${SEED_EXPERTS.length} verified experts.`);

    // 3. Seed Architectural Designs
    console.log("[INFO] Seeding architectural designs catalog...");
    await query("DELETE FROM designs WHERE id > 0;");
    await query("ALTER TABLE designs AUTO_INCREMENT = 1;");

    const insertDesignSql = `
      INSERT INTO designs (
        title, floors, has_basement, has_garage, rooftop_type,
        min_katha, built_area_sqft, units_per_floor, unit_size_sqft,
        bedrooms, bathrooms, balconies, dining_space, drawing_space, kitchen_space,
        parking_capacity, architectural_style, image_url, description, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const design of SEED_DESIGNS) {
      await query(insertDesignSql, [
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
    console.log(`[SUCCESS] Seeded ${SEED_DESIGNS.length} designs into 'designs' table.`);

    // 4. Seed Construction Rates
    console.log("[INFO] Seeding construction rates...");
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
    console.log("[SUCCESS] Seeded standard, premium, and luxury rates into 'construction_rates'.");

    // 5. Seed Cost Estimates
    console.log("[INFO] Seeding sample cost estimates...");
    await query("DELETE FROM cost_estimates WHERE id > 0;");
    await query("ALTER TABLE cost_estimates AUTO_INCREMENT = 1;");

    const SEED_ESTIMATES = [
      {
        floors: 6,
        floor_area_sqft: 2000,
        quality: "standard",
        has_basement: 0,
        has_garage: 1,
        rate_per_sqft: 2200,
        total_built_up_area: 12000,
        structure_cost: 11880000,
        finishing_cost: 7920000,
        electrical_cost: 3168000,
        plumbing_cost: 3432000,
        total_cost_bdt: 26400000,
        design_id: 1,
        design_title: "Gulshan Modernist Horizon",
      },
      {
        floors: 5,
        floor_area_sqft: 1960,
        quality: "premium",
        has_basement: 0,
        has_garage: 1,
        rate_per_sqft: 2800,
        total_built_up_area: 9800,
        structure_cost: 12348000,
        finishing_cost: 8232000,
        electrical_cost: 3292800,
        plumbing_cost: 3567200,
        total_cost_bdt: 27440000,
        design_id: 2,
        design_title: "Dhanmondi Brick & Glass Villa",
      },
      {
        floors: 8,
        floor_area_sqft: 3062,
        quality: "luxury",
        has_basement: 1,
        has_garage: 1,
        rate_per_sqft: 3600,
        total_built_up_area: 24500,
        structure_cost: 39690000,
        finishing_cost: 26460000,
        electrical_cost: 10584000,
        plumbing_cost: 11466000,
        total_cost_bdt: 88200000,
        design_id: 3,
        design_title: "Uttara Urban Apex Tower",
      },
    ];

    const insertEstimateSql = `
      INSERT INTO cost_estimates (
        floors, floor_area_sqft, quality, has_basement, has_garage,
        rate_per_sqft, total_built_up_area, structure_cost, finishing_cost,
        electrical_cost, plumbing_cost, total_cost_bdt, design_id, design_title
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const est of SEED_ESTIMATES) {
      await query(insertEstimateSql, [
        est.floors,
        est.floor_area_sqft,
        est.quality,
        est.has_basement,
        est.has_garage,
        est.rate_per_sqft,
        est.total_built_up_area,
        est.structure_cost,
        est.finishing_cost,
        est.electrical_cost,
        est.plumbing_cost,
        est.total_cost_bdt,
        est.design_id,
        est.design_title,
      ]);
    }
    console.log(`[SUCCESS] Seeded ${SEED_ESTIMATES.length} sample cost estimates.`);

    // 6. Seed Feasibility Logs
    console.log("[INFO] Seeding sample feasibility logs...");
    await query("DELETE FROM feasibility_logs WHERE id > 0;");
    await query("ALTER TABLE feasibility_logs AUTO_INCREMENT = 1;");

    const SEED_FEASIBILITY = [
      {
        land_katha: 5.0,
        road_width_ft: 25.0,
        floors: 7,
        authority: "RAJUK",
        is_permissible: 1,
        max_permissible_height: "8 Stories",
        far_ratio: 3.75,
        notes: "Compliant with RAJUK 2008 / BNBC 2020 road setback and FAR requirements.",
      },
      {
        land_katha: 4.0,
        road_width_ft: 20.0,
        floors: 6,
        authority: "CDA",
        is_permissible: 1,
        max_permissible_height: "6 Stories",
        far_ratio: 3.5,
        notes: "CDA Chittagong masterplan baseline compliant. Minimum 20ft road observed.",
      },
      {
        land_katha: 3.5,
        road_width_ft: 16.0,
        floors: 5,
        authority: "RAJUK",
        is_permissible: 1,
        max_permissible_height: "5 Stories",
        far_ratio: 3.15,
        notes: "Narrow access road restricts maximum height to 5 stories.",
      },
    ];

    const insertFeasibilitySql = `
      INSERT INTO feasibility_logs (
        land_katha, road_width_ft, floors, authority, is_permissible,
        max_permissible_height, far_ratio, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const feas of SEED_FEASIBILITY) {
      await query(insertFeasibilitySql, [
        feas.land_katha,
        feas.road_width_ft,
        feas.floors,
        feas.authority,
        feas.is_permissible,
        feas.max_permissible_height,
        feas.far_ratio,
        feas.notes,
      ]);
    }
    console.log(`[SUCCESS] Seeded ${SEED_FEASIBILITY.length} sample feasibility logs.`);

    // 7. Seed Consultation Messages
    console.log("[INFO] Seeding sample consultation messages...");
    await query("DELETE FROM consultation_messages;");

    const SEED_MESSAGES = [
      {
        id: "msg_seed_1",
        thread_id: "thread_client_architect_1",
        sender_role: "client",
        engineer_type: null,
        sender_name: "Client Salman",
        message_text: "Hello Ar. Nusrat, I am planning to build a 6-story residential building on a 4.0 Katha plot in Mirpur. What are the mandatory setbacks?",
        attached_context: JSON.stringify({
          title: "Dhanmondi Brick & Glass Villa",
          architectural_style: "Exposed Brick & Louver",
          floors: 5,
          katha: 4.0,
          built_area_sqft: 9800,
          units_per_floor: 1,
          bedrooms: 4,
          bathrooms: 4,
          authority: "RAJUK",
        }),
      },
      {
        id: "msg_seed_2",
        thread_id: "thread_client_architect_1",
        sender_role: "engineer",
        engineer_type: "architect",
        sender_name: "Ar. Nusrat Jahan",
        message_text: "Hello Salman! For a 4.0 Katha plot under RAJUK, you need a minimum 5ft front setback, 3.28ft (1m) side setbacks, and a 6.5ft (2m) rear setback. Your 5-6 story target is well within FAR limits for a 20ft road.",
        attached_context: null,
      },
      {
        id: "msg_seed_3",
        thread_id: "thread_client_structural_1",
        sender_role: "client",
        engineer_type: null,
        sender_name: "CivilHub Client",
        message_text: "Engr. Tanvir, could you review column sizing and shear wall requirements for a 10-story tower under BNBC 2020 seismic zone 2?",
        attached_context: JSON.stringify({
          title: "Gulshan Modernist Horizon",
          architectural_style: "Biophilic Contemporary",
          floors: 10,
          katha: 5.0,
          built_area_sqft: 22500,
          authority: "RAJUK",
        }),
      },
      {
        id: "msg_seed_4",
        thread_id: "thread_client_structural_1",
        sender_role: "engineer",
        engineer_type: "structural",
        sender_name: "Engr. Tanvir Ahmed, PEng",
        message_text: "For a 10-story structure in Dhaka (Zone 2, Z=0.20), dual framing with a reinforced concrete central core shear wall is highly recommended. Typical basement/ground floor columns will require approximately 20\" x 24\" with 60-grade rebar.",
        attached_context: null,
      },
      {
        id: "msg_seed_5",
        thread_id: "thread_client_soil_1",
        sender_role: "client",
        engineer_type: null,
        sender_name: "CivilHub Client",
        message_text: "Engr. Rafiqul, at what SPT N-value would shallow footing be acceptable for 5 stories?",
        attached_context: null,
      },
      {
        id: "msg_seed_6",
        thread_id: "thread_client_soil_1",
        sender_role: "engineer",
        engineer_type: "soil",
        sender_name: "Engr. Mohammad Rafiqul",
        message_text: "Under BNBC 2020, for shallow mat or isolated footings supporting 5 stories, you generally need an SPT N-value of 15 or higher within the top 15-20 feet. If N is below 10, bored cast-in-situ piling will be required.",
        attached_context: null,
      },
    ];

    const insertMsgSql = `
      INSERT INTO consultation_messages (
        id, thread_id, sender_role, engineer_type, sender_name, message_text, attached_context
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    for (const msg of SEED_MESSAGES) {
      await query(insertMsgSql, [
        msg.id,
        msg.thread_id,
        msg.sender_role,
        msg.engineer_type,
        msg.sender_name,
        msg.message_text,
        msg.attached_context,
      ]);
    }
    console.log(`[SUCCESS] Seeded ${SEED_MESSAGES.length} sample consultation messages.`);

    console.log("[COMPLETE] CivilHub database seeding for all tables finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
