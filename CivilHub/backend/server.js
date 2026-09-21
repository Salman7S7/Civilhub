// backend/server.js
// -----------------------------------------------------------------------------
// CivilHub Mobile Backend
// 1. Gemini AI Bangladesh Building Code Proxy
// 2. Smart Design Suggestions MySQL Filter Engine
// 3. Cost Estimator API
// 4. Feasibility API
// -----------------------------------------------------------------------------

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  initDB,
  query,
  getStatus,
} = require("./db");

const {
  SEED_DESIGNS,
} = require("./seedData");

// Cost Estimator Router
const costEstimatorRouter =
  require("./costEstimator");

const app = express();

/* ============================================================
   MIDDLEWARE
============================================================ */

app.use(cors());

app.use(
  express.json({
    limit: "2mb",
  })
);

/* ============================================================
   COST ESTIMATOR ROUTER
============================================================ */

app.use(
  "/api/cost-estimator",
  costEstimatorRouter
);

/* ============================================================
   CONFIGURATION
============================================================ */

const PORT =
  process.env.PORT || 4000;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `${GEMINI_MODEL}:generateContent`;

/* ============================================================
   BANGLADESH BUILDING CODE SYSTEM CONTEXT
============================================================ */

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
- setback requirements
- maximum permissible height
- road-width-based restrictions

3. If the answer depends on RAJUK, CDA, RDA, KDA, or another authority,
clearly mention the assumed authority.

4. Keep answers concise, structured, and practical.

5. Always include:

"Disclaimer: Final approval depends on the relevant development authority and review by a licensed structural/civil engineer."
`;

/* ============================================================
   IN-MEMORY DESIGN FILTER
============================================================ */

function filterInMemory(
  filters = {}
) {
  const {
    floors,
    min_katha,
    basement,
    garage,
    rooftop,
    q,
    search,
  } = filters;

  const searchTerm =
    (
      q ||
      search ||
      ""
    )
      .toLowerCase()
      .trim();

  const allItems =
    SEED_DESIGNS.map(
      (design, index) => ({
        id: index + 1,
        ...design,
      })
    );

  let targetFloor = null;
  let hasExactFloorMatch = false;
  let allowedFloorDiff = 0;

  if (floors) {
    const parsed =
      parseInt(
        floors,
        10
      );

    if (!isNaN(parsed)) {
      if (
        parsed > 0 &&
        parsed <= 40
      ) {
        targetFloor = parsed;

        hasExactFloorMatch =
          allItems.some(
            (item) =>
              item.floors ===
              targetFloor
          );

        if (
          !hasExactFloorMatch &&
          allItems.length > 0
        ) {
          const minDiff =
            Math.min(
              ...allItems.map(
                (item) =>
                  Math.abs(
                    item.floors -
                      targetFloor
                  )
              )
            );

          allowedFloorDiff =
            Math.max(
              minDiff,
              2
            );
        }
      } else {
        targetFloor = -1;
      }
    }
  }

  const filtered =
    allItems.filter(
      (item) => {
        if (
          targetFloor === -1
        ) {
          return false;
        }

        if (
          targetFloor !== null
        ) {
          if (
            hasExactFloorMatch
          ) {
            if (
              item.floors !==
              targetFloor
            ) {
              return false;
            }
          } else {
            if (
              Math.abs(
                item.floors -
                  targetFloor
              ) >
              allowedFloorDiff
            ) {
              return false;
            }
          }
        }

        if (
          min_katha &&
          item.min_katha >
            parseFloat(
              min_katha
            )
        ) {
          return false;
        }

        if (
          basement !==
          undefined
        ) {
          const wantBasement =
            basement ===
              "true" ||
            basement ===
              "1" ||
            basement === true;

          if (
            item.has_basement !==
            wantBasement
          ) {
            return false;
          }
        }

        if (
          garage !==
          undefined
        ) {
          const wantGarage =
            garage ===
              "true" ||
            garage ===
              "1" ||
            garage === true;

          if (
            item.has_garage !==
            wantGarage
          ) {
            return false;
          }
        }

        if (
          rooftop &&
          rooftop !== "all" &&
          item.rooftop_type !==
            rooftop
        ) {
          return false;
        }

        if (searchTerm) {
          const matchTitle =
            item.title
              ?.toLowerCase()
              .includes(
                searchTerm
              );

          const matchStyle =
            item.architectural_style
              ?.toLowerCase()
              .includes(
                searchTerm
              );

          const matchDesc =
            item.description
              ?.toLowerCase()
              .includes(
                searchTerm
              );

          const matchFeatures =
            item.features?.some(
              (feature) =>
                String(feature)
                  .toLowerCase()
                  .includes(
                    searchTerm
                  )
            );

          if (
            !matchTitle &&
            !matchStyle &&
            !matchDesc &&
            !matchFeatures
          ) {
            return false;
          }
        }

        return true;
      }
    );

  if (
    targetFloor !== null &&
    !hasExactFloorMatch
  ) {
    return filtered.sort(
      (a, b) =>
        Math.abs(
          a.floors -
            targetFloor
        ) -
        Math.abs(
          b.floors -
            targetFloor
        )
    );
  }

  return filtered;
}

/* ============================================================
   ROOT
============================================================ */

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "CivilHub Backend API is running.",
      port: PORT,
    });
  }
);

/* ============================================================
   HEALTH CHECK
============================================================ */

app.get(
  "/health",
  (req, res) => {
    const dbStatus =
      getStatus();

    res.json({
      ok: true,
      hasKey:
        Boolean(
          GEMINI_API_KEY
        ),
      model:
        GEMINI_MODEL,
      database:
        dbStatus,
    });
  }
);

/* ============================================================
   COST ESTIMATOR HEALTH
============================================================ */

app.get(
  "/api/cost-estimator-health",
  (req, res) => {
    res.json({
      success: true,
      service:
        "cost-estimator",
      message:
        "Cost Estimator API is running.",
      endpoint:
        "/api/cost-estimator",
    });
  }
);

/* ============================================================
   FEATURE 2
   SMART DESIGN SEARCH
============================================================ */

app.get(
  "/api/designs/search",
  async (req, res) => {
    const {
      floors,
      min_katha,
      basement,
      garage,
      rooftop,
      q,
      search,
      bedrooms,
    } = req.query;

    const dbStatus =
      getStatus();

    if (
      dbStatus.connected
    ) {
      try {
        let sql =
          "SELECT * FROM designs WHERE 1=1";

        const queryParams = [];

        if (
          floors &&
          floors !== "all"
        ) {
          sql +=
            " AND floors = ?";

          queryParams.push(
            parseInt(
              floors,
              10
            )
          );
        }

        if (
          min_katha &&
          min_katha !== "all"
        ) {
          sql +=
            " AND min_katha <= ?";

          queryParams.push(
            parseFloat(
              min_katha
            )
          );
        }

        if (
          basement !==
            undefined &&
          basement !== "all"
        ) {
          sql +=
            " AND has_basement = ?";

          queryParams.push(
            basement ===
                "true" ||
              basement === "1"
              ? 1
              : 0
          );
        }

        if (
          garage !==
            undefined &&
          garage !== "all"
        ) {
          sql +=
            " AND has_garage = ?";

          queryParams.push(
            garage ===
                "true" ||
              garage === "1"
              ? 1
              : 0
          );
        }

        if (
          rooftop &&
          rooftop !== "all"
        ) {
          sql +=
            " AND rooftop_type = ?";

          queryParams.push(
            rooftop
          );
        }

        if (
          bedrooms &&
          bedrooms !== "all"
        ) {
          sql +=
            " AND bedrooms >= ?";

          queryParams.push(
            parseInt(
              bedrooms,
              10
            )
          );
        }

        const searchTerm =
          q || search;

        if (
          searchTerm &&
          String(
            searchTerm
          ).trim()
        ) {
          sql +=
            " AND (title LIKE ? OR architectural_style LIKE ? OR description LIKE ?)";

          const pattern =
            `%${String(
              searchTerm
            ).trim()}%`;

          queryParams.push(
            pattern,
            pattern,
            pattern
          );
        }

        sql +=
          " ORDER BY id DESC";

        const rows =
          await query(
            sql,
            queryParams
          );

        const parsedRows =
          rows.map(
            (row) => ({
              ...row,

              has_basement:
                Boolean(
                  row.has_basement
                ),

              has_garage:
                Boolean(
                  row.has_garage
                ),

              features:
                typeof row.features ===
                "string"
                  ? JSON.parse(
                      row.features
                    )
                  : row.features ||
                    [],
            })
          );

        return res.json({
          success: true,
          source: "mysql",
          count:
            parsedRows.length,
          designs:
            parsedRows,
        });
      } catch (error) {
        console.error(
          "[MySQL Search Error]:",
          error
        );
      }
    }

    const results =
      filterInMemory(
        req.query
      );

    res.json({
      success: true,
      source:
        "memory_catalog",
      count:
        results.length,
      designs:
        results,
    });
  }
);

/* ============================================================
   GET ALL DESIGNS
============================================================ */

app.get(
  "/api/designs",
  async (req, res) => {
    const dbStatus =
      getStatus();

    if (
      dbStatus.connected
    ) {
      try {
        const rows =
          await query(
            "SELECT * FROM designs ORDER BY id DESC;"
          );

        const parsedRows =
          rows.map(
            (row) => ({
              ...row,

              has_basement:
                Boolean(
                  row.has_basement
                ),

              has_garage:
                Boolean(
                  row.has_garage
                ),

              features:
                typeof row.features ===
                "string"
                  ? JSON.parse(
                      row.features
                    )
                  : row.features ||
                    [],
            })
          );

        return res.json({
          success: true,
          source: "mysql",
          count:
            parsedRows.length,
          designs:
            parsedRows,
        });
      } catch (error) {
        console.error(
          "[MySQL Get All Error]:",
          error
        );
      }
    }

    const allDesigns =
      SEED_DESIGNS.map(
        (design, index) => ({
          id: index + 1,
          ...design,
        })
      );

    res.json({
      success: true,
      source:
        "memory_catalog",
      count:
        allDesigns.length,
      designs:
        allDesigns,
    });
  }
);

/* ============================================================
   GET SINGLE DESIGN
============================================================ */

app.get(
  "/api/designs/:id",
  async (req, res) => {
    const designId =
      parseInt(
        req.params.id,
        10
      );

    const dbStatus =
      getStatus();

    if (
      dbStatus.connected
    ) {
      try {
        const rows =
          await query(
            "SELECT * FROM designs WHERE id = ? LIMIT 1;",
            [designId]
          );

        if (
          rows &&
          rows.length > 0
        ) {
          const row =
            rows[0];

          return res.json({
            success: true,
            source: "mysql",
            design: {
              ...row,

              has_basement:
                Boolean(
                  row.has_basement
                ),

              has_garage:
                Boolean(
                  row.has_garage
                ),

              features:
                typeof row.features ===
                "string"
                  ? JSON.parse(
                      row.features
                    )
                  : row.features ||
                    [],
            },
          });
        }
      } catch (error) {
        console.error(
          "[MySQL Design Detail Error]:",
          error
        );
      }
    }

    const design =
      SEED_DESIGNS[
        designId - 1
      ];

    if (!design) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Design not found.",
        });
    }

    res.json({
      success: true,
      source:
        "memory_catalog",
      design: {
        id: designId,
        ...design,
      },
    });
  }
);

/* ============================================================
   COST ESTIMATOR - LEGACY DATABASE RATES
============================================================ */

app.get(
  "/api/costs/rates",
  async (req, res) => {
    const dbStatus =
      getStatus();

    if (
      dbStatus.connected
    ) {
      try {
        const rows =
          await query(
            "SELECT * FROM construction_rates;"
          );

        if (
          rows &&
          rows.length > 0
        ) {
          const ratesMap = {};

          rows.forEach(
            (row) => {
              ratesMap[
                row.grade
              ] = {
                rate_per_sqft:
                  row.rate_per_sqft,

                structure_share:
                  parseFloat(
                    row.structure_share
                  ),

                finishing_share:
                  parseFloat(
                    row.finishing_share
                  ),

                electrical_share:
                  parseFloat(
                    row.electrical_share
                  ),

                plumbing_share:
                  parseFloat(
                    row.plumbing_share
                  ),

                basement_rate_factor:
                  parseFloat(
                    row.basement_rate_factor
                  ),

                basement_area_factor:
                  parseFloat(
                    row.basement_area_factor
                  ),

                garage_rate_factor:
                  parseFloat(
                    row.garage_rate_factor
                  ),

                garage_area_sqft:
                  row.garage_area_sqft,
              };
            }
          );

          return res.json({
            success: true,
            source:
              "mysql",
            rates:
              ratesMap,
          });
        }
      } catch (error) {
        console.error(
          "[MySQL Cost Rates Error]:",
          error
        );
      }
    }

    res.json({
      success: true,
      source:
        "fallback",

      rates: {
        standard: {
          rate_per_sqft:
            2200,
          structure_share:
            0.45,
          finishing_share:
            0.30,
          electrical_share:
            0.12,
          plumbing_share:
            0.13,
        },

        premium: {
          rate_per_sqft:
            2800,
          structure_share:
            0.45,
          finishing_share:
            0.30,
          electrical_share:
            0.12,
          plumbing_share:
            0.13,
        },

        luxury: {
          rate_per_sqft:
            3600,
          structure_share:
            0.45,
          finishing_share:
            0.30,
          electrical_share:
            0.12,
          plumbing_share:
            0.13,
        },
      },
    });
  }
);

/* ============================================================
   COST ESTIMATOR - LEGACY ESTIMATE
============================================================ */

app.post(
  "/api/costs/estimate",
  async (req, res) => {
    const dbStatus =
      getStatus();

    const {
      floors,
      floorAreaSqft,
      quality = "standard",
      hasBasement = false,
      hasGarage = false,
      designId = null,
      designTitle = null,
    } = req.body;

    if (
      !floors ||
      !floorAreaSqft
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: floors, floorAreaSqft",
        });
    }

    try {
      let ratePerSqft =
        2200;

      let structureShare =
        0.45;

      let finishingShare =
        0.30;

      let electricalShare =
        0.12;

      let plumbingShare =
        0.13;

      let basementRateFactor =
        1.25;

      let basementAreaFactor =
        0.90;

      let garageRateFactor =
        0.80;

      let garageAreaSqft =
        250;

      if (
        dbStatus.connected
      ) {
        const rows =
          await query(
            "SELECT * FROM construction_rates WHERE grade = ? LIMIT 1;",
            [
              String(
                quality
              ).toLowerCase(),
            ]
          );

        if (
          rows &&
          rows.length > 0
        ) {
          ratePerSqft =
            rows[0]
              .rate_per_sqft;

          structureShare =
            parseFloat(
              rows[0]
                .structure_share
            );

          finishingShare =
            parseFloat(
              rows[0]
                .finishing_share
            );

          electricalShare =
            parseFloat(
              rows[0]
                .electrical_share
            );

          plumbingShare =
            parseFloat(
              rows[0]
                .plumbing_share
            );

          basementRateFactor =
            parseFloat(
              rows[0]
                .basement_rate_factor
            );

          basementAreaFactor =
            parseFloat(
              rows[0]
                .basement_area_factor
            );

          garageRateFactor =
            parseFloat(
              rows[0]
                .garage_rate_factor
            );

          garageAreaSqft =
            rows[0]
              .garage_area_sqft;
        }
      }

      const floorCount =
        Math.max(
          1,
          Math.floor(
            Number(
              floors
            ) || 1
          )
        );

      const areaPerFloor =
        Math.max(
          0,
          Number(
            floorAreaSqft
          ) || 0
        );

      const floorsCost =
        floorCount *
        areaPerFloor *
        ratePerSqft;

      const basementCost =
        hasBasement
          ? areaPerFloor *
            basementAreaFactor *
            ratePerSqft *
            basementRateFactor
          : 0;

      const garageCost =
        hasGarage
          ? garageAreaSqft *
            ratePerSqft *
            garageRateFactor
          : 0;

      const totalCost =
        Math.round(
          floorsCost +
            basementCost +
            garageCost
        );

      const structureCost =
        Math.round(
          totalCost *
            structureShare
        );

      const finishingCost =
        Math.round(
          totalCost *
            finishingShare
        );

      const electricalCost =
        Math.round(
          totalCost *
            electricalShare
        );

      const plumbingCost =
        Math.round(
          totalCost *
            plumbingShare
        );

      const totalBuiltUpArea =
        Math.round(
          floorCount *
            areaPerFloor +
            (
              hasBasement
                ? areaPerFloor *
                  basementAreaFactor
                : 0
            ) +
            (
              hasGarage
                ? garageAreaSqft
                : 0
            )
        );

      let insertedId =
        null;

      if (
        dbStatus.connected
      ) {
        const insertSql = `
          INSERT INTO cost_estimates (
            floors,
            floor_area_sqft,
            quality,
            has_basement,
            has_garage,
            rate_per_sqft,
            total_built_up_area,
            structure_cost,
            finishing_cost,
            electrical_cost,
            plumbing_cost,
            total_cost_bdt,
            design_id,
            design_title
          )
          VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?
          );
        `;

        const result =
          await query(
            insertSql,
            [
              floorCount,
              areaPerFloor,
              String(
                quality
              ).toLowerCase(),
              hasBasement
                ? 1
                : 0,
              hasGarage
                ? 1
                : 0,
              ratePerSqft,
              totalBuiltUpArea,
              structureCost,
              finishingCost,
              electricalCost,
              plumbingCost,
              totalCost,
              designId ||
                null,
              designTitle ||
                null,
            ]
          );

        insertedId =
          result.insertId;
      }

      res.json({
        success: true,

        source:
          dbStatus.connected
            ? "mysql"
            : "computed",

        estimateId:
          insertedId,

        breakdown: {
          floors:
            floorCount,

          floorAreaSqft:
            areaPerFloor,

          quality,

          ratePerSqft,

          totalBuiltUpArea,

          structure:
            structureCost,

          finishing:
            finishingCost,

          electrical:
            electricalCost,

          plumbing:
            plumbingCost,

          total:
            totalCost,

          designTitle,
        },
      });
    } catch (error) {
      console.error(
        "[Cost Estimate Error]:",
        error
      );

      res
        .status(500)
        .json({
          error:
            error.message,
        });
    }
  }
);

/* ============================================================
   COST ESTIMATE HISTORY
============================================================ */

app.get(
  "/api/costs/history",
  async (req, res) => {
    const dbStatus =
      getStatus();

    if (
      dbStatus.connected
    ) {
      try {
        const rows =
          await query(
            "SELECT * FROM cost_estimates ORDER BY id DESC LIMIT 20;"
          );

        return res.json({
          success: true,
          count:
            rows.length,
          history:
            rows,
        });
      } catch (error) {
        console.error(
          "[Cost History Error]:",
          error
        );
      }
    }

    res.json({
      success: true,
      count: 0,
      history: [],
    });
  }
);

/* ============================================================
   FEASIBILITY LOGGING
============================================================ */

app.post(
  "/api/feasibility/check",
  async (req, res) => {
    const dbStatus =
      getStatus();

    const {
      land_katha,
      road_width_ft,
      floors,
      authority = "RAJUK",
      is_permissible,
      max_permissible_height,
      far_ratio,
      notes,
    } = req.body;

    if (
      dbStatus.connected
    ) {
      try {
        const insertSql = `
          INSERT INTO feasibility_logs (
            land_katha,
            road_width_ft,
            floors,
            authority,
            is_permissible,
            max_permissible_height,
            far_ratio,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const result =
          await query(
            insertSql,
            [
              parseFloat(
                land_katha
              ) || 0,

              parseFloat(
                road_width_ft
              ) || 0,

              parseInt(
                floors,
                10
              ) || 1,

              authority ||
                "RAJUK",

              is_permissible
                ? 1
                : 0,

              max_permissible_height ||
                null,

              far_ratio
                ? parseFloat(
                    far_ratio
                  )
                : null,

              notes ||
                null,
            ]
          );

        return res.json({
          success: true,
          logId:
            result.insertId,
        });
      } catch (error) {
        console.error(
          "[Feasibility Log Error]:",
          error
        );
      }
    }

    res.json({
      success: true,
      logId: null,
    });
  }
);

/* ============================================================
   GEMINI BUILDING CODE AI
============================================================ */

app.post(
  "/api/ask-building-code",
  async (req, res) => {
    try {
      const {
        question,
      } = req.body;

      if (
        !question ||
        !String(
          question
        ).trim()
      ) {
        return res
          .status(400)
          .json({
            error:
              "Missing 'question' in request body.",
          });
      }

      if (
        !GEMINI_API_KEY
      ) {
        return res
          .status(500)
          .json({
            error:
              "Server is missing GEMINI_API_KEY. Check backend/.env.",
          });
      }

      const fullPrompt =
        `${SYSTEM_CONTEXT}\n\n` +
        `User question:\n` +
        `${String(
          question
        ).trim()}`;

      const requestBody = {
        contents: [
          {
            role: "user",

            parts: [
              {
                text:
                  fullPrompt,
              },
            ],
          },
        ],

        generationConfig: {
          maxOutputTokens: 800,
        },
      };

      const geminiResponse =
        await fetch(
          `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      if (
        !geminiResponse.ok
      ) {
        const errorText =
          await geminiResponse.text();

        console.error(
          "Gemini API error:",
          geminiResponse.status,
          errorText
        );

        return res
          .status(502)
          .json({
            error:
              "Gemini API request failed.",
          });
      }

      const data =
        await geminiResponse.json();

      const answerText =
        data?.candidates?.[0]
          ?.content?.parts
          ?.map(
            (part) =>
              part?.text ||
              ""
          )
          .join("")
          .trim() ||
        "Unable to process question. Please try again.";

      res.json({
        answer:
          answerText,
      });
    } catch (error) {
      console.error(
        "Proxy error:",
        error
      );

      res
        .status(500)
        .json({
          error:
            "Internal server error.",
        });
    }
  }
);

/* ============================================================
   404 HANDLER
============================================================ */

app.use(
  (req, res) => {
    res
      .status(404)
      .json({
        success: false,
        error:
          "API endpoint not found.",
        path:
          req.originalUrl,
      });
  }
);

/* ============================================================
   GLOBAL ERROR HANDLER
============================================================ */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "[Global Server Error]:",
      error
    );

    if (
      res.headersSent
    ) {
      return next(
        error
      );
    }

    res
      .status(
        error.status ||
          500
      )
      .json({
        success: false,
        error:
          error.message ||
          "Internal server error.",
      });
  }
);

/* ============================================================
   START SERVER
============================================================ */

app.listen(
  PORT,
  async () => {
    console.log(
      "===================================================="
    );

    console.log(
      ` CivilHub Backend Server running on http://localhost:${PORT}`
    );

    console.log(
      ` Gemini model: ${GEMINI_MODEL}`
    );

    console.log(
      ` Gemini API key loaded: ${Boolean(
        GEMINI_API_KEY
      )}`
    );

    console.log(
      ` Cost Estimator API: http://localhost:${PORT}/api/cost-estimator`
    );

    console.log(
      "===================================================="
    );

    try {
      await initDB();

      console.log(
        "Database initialization completed."
      );
    } catch (error) {
      console.error(
        "Database initialization failed:",
        error.message
      );

      console.log(
        "Server will continue using fallback/in-memory features where available."
      );
    }

    console.log(
      "===================================================="
    );
  }
);