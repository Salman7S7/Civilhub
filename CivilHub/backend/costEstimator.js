// backend/costEstimator.js

const express = require("express");

const {
  COST_RATES,
  REGULATIONS,
} = require("./costEstimatorData");

const router = express.Router();

// ============================================================
// Helpers
// ============================================================

function toNumber(value, defaultValue = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return defaultValue;
  }

  return number;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function normalizeQuality(value) {
  const quality = String(value || "standard")
    .trim()
    .toLowerCase();

  if (COST_RATES[quality]) {
    return quality;
  }

  return "standard";
}

function normalizeAuthority(value) {
  const authority = String(value || "RAJUK")
    .trim();

  if (REGULATIONS[authority]) {
    return authority;
  }

  return "General";
}

function normalizeBuildingType(value) {
  const type = String(value || "residential")
    .trim()
    .toLowerCase();

  if (
    type === "residential" ||
    type === "commercial" ||
    type === "mixed"
  ) {
    return type;
  }

  return "residential";
}

// ============================================================
// GET /health
// ============================================================

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "cost-estimator",
    message: "Cost Estimator Backend is running",
  });
});

// ============================================================
// GET /rates
// ============================================================

router.get("/rates", (req, res) => {
  res.json({
    success: true,
    source: "temporary",
    rates: COST_RATES,
  });
});

// ============================================================
// GET /regulations
// ============================================================

router.get("/regulations", (req, res) => {
  const authority = normalizeAuthority(
    req.query.authority
  );

  const buildingType = normalizeBuildingType(
    req.query.buildingType
  );

  const rules =
    REGULATIONS[authority][buildingType];

  res.json({
    success: true,
    source: "temporary",

    authority,
    buildingType,

    rules,
  });
});

// ============================================================
// POST /estimate
// ============================================================

router.post("/estimate", (req, res) => {
  try {
    const data = req.body || {};

    // --------------------------------------------------------
    // Land Information
    // --------------------------------------------------------

    const landLength = toNumber(
      data.landLength
    );

    const landWidth = toNumber(
      data.landWidth
    );

    if (
      landLength <= 0 ||
      landWidth <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Land length and land width must be greater than 0.",
      });
    }

    const dimensionUnit =
      String(
        data.dimensionUnit || "feet"
      ).toLowerCase();

    // --------------------------------------------------------
    // Convert meters to feet
    // --------------------------------------------------------

    let lengthFeet = landLength;
    let widthFeet = landWidth;

    if (
      dimensionUnit === "meter" ||
      dimensionUnit === "meters"
    ) {
      lengthFeet =
        landLength * 3.28084;

      widthFeet =
        landWidth * 3.28084;
    }

    // --------------------------------------------------------
    // Land Area
    // --------------------------------------------------------

    const landArea =
      lengthFeet * widthFeet;

    // --------------------------------------------------------
    // Basic Information
    // --------------------------------------------------------

    const roadWidth = toNumber(
      data.roadWidth
    );

    const roadFacing =
      data.roadFacing || "front";

    const authority =
      normalizeAuthority(
        data.authority
      );

    const buildingType =
      normalizeBuildingType(
        data.buildingType
      );

    // --------------------------------------------------------
    // Regulation
    // --------------------------------------------------------

    const rules =
      REGULATIONS[authority][buildingType];

    // --------------------------------------------------------
    // Buildable Footprint
    // --------------------------------------------------------

    const setbackLength =
      rules.frontSetback +
      rules.rearSetback;

    const setbackWidth =
      rules.sideSetback * 2;

    const usableLength =
      Math.max(
        lengthFeet - setbackLength,
        0
      );

    const usableWidth =
      Math.max(
        widthFeet - setbackWidth,
        0
      );

    const setbackBasedFootprint =
      usableLength * usableWidth;

    const coverageBasedFootprint =
      landArea *
      (rules.coverage / 100);

    const buildableFootprint =
      Math.min(
        setbackBasedFootprint,
        coverageBasedFootprint
      );

    // --------------------------------------------------------
    // Floors
    // --------------------------------------------------------

    const floorCount = Math.max(
      1,
      Math.floor(
        toNumber(
          data.floorCount,
          1
        )
      )
    );

    const allowancePercent =
      Math.max(
        0,
        toNumber(
          data.allowancePercent,
          0
        )
      );

    const floors = Array.isArray(
      data.floors
    )
      ? data.floors
      : [];

    // --------------------------------------------------------
    // Floor Calculation
    // --------------------------------------------------------

    let totalGrossFloorArea = 0;

    const floorBreakdown = [];

    for (
      let index = 0;
      index < floorCount;
      index++
    ) {
      const floor =
        floors[index] || {};

      const rooms =
        Array.isArray(floor.rooms)
          ? floor.rooms
          : [];

      let roomArea = 0;

      rooms.forEach((room) => {
        const area = toNumber(
          room.area
        );

        if (area > 0) {
          roomArea += area;
        }
      });

      // If no room data is provided,
      // use the maximum buildable footprint.

      if (roomArea <= 0) {
        roomArea =
          buildableFootprint;
      }

      const grossArea =
        roomArea *
        (1 + allowancePercent / 100);

      totalGrossFloorArea +=
        grossArea;

      floorBreakdown.push({
        floor: index + 1,

        roomArea: round(
          roomArea
        ),

        allowancePercent,

        grossArea: round(
          grossArea
        ),
      });
    }

    // --------------------------------------------------------
    // FAR Maximum
    // --------------------------------------------------------

    const farMaximum =
      landArea * rules.far;

    // --------------------------------------------------------
    // FAR Limitation
    // --------------------------------------------------------

    const finalGrossFloorArea =
      Math.min(
        totalGrossFloorArea,
        farMaximum
      );

    // --------------------------------------------------------
    // Quality / Rate
    // --------------------------------------------------------

    const quality =
      normalizeQuality(
        data.quality
      );

    const rateInfo =
      COST_RATES[quality];

    const ratePerSqft =
      rateInfo.ratePerSqft;

    // --------------------------------------------------------
    // Main Construction Cost
    // --------------------------------------------------------

    const constructionCost =
      finalGrossFloorArea *
      ratePerSqft;

    // --------------------------------------------------------
    // Basement
    // --------------------------------------------------------

    const hasBasement =
      Boolean(data.hasBasement);

    const basementCost =
      hasBasement
        ? buildableFootprint *
          ratePerSqft *
          0.60
        : 0;

    // --------------------------------------------------------
    // Garage
    // --------------------------------------------------------

    const hasGarage =
      Boolean(data.hasGarage);

    const garageCost =
      hasGarage
        ? 400000
        : 0;

    // --------------------------------------------------------
    // Total
    // --------------------------------------------------------

    const totalCost =
      constructionCost +
      basementCost +
      garageCost;

    // --------------------------------------------------------
    // Compliance
    // --------------------------------------------------------

    const isCompliant =
      totalGrossFloorArea <=
      farMaximum;

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.json({
      success: true,

      source: "temporary",

      input: {
        landLength,
        landWidth,
        dimensionUnit,

        roadWidth,
        roadFacing,

        authority,
        buildingType,

        floorCount,
        allowancePercent,

        floors,

        quality,

        hasBasement,
        hasGarage,
      },

      land: {
        lengthFeet: round(
          lengthFeet
        ),

        widthFeet: round(
          widthFeet
        ),

        areaSqft: round(
          landArea
        ),
      },

      rules: {
        coverage:
          rules.coverage,

        far:
          rules.far,

        frontSetback:
          rules.frontSetback,

        rearSetback:
          rules.rearSetback,

        sideSetback:
          rules.sideSetback,
      },

      calculation: {
        buildableFootprint:
          round(
            buildableFootprint
          ),

        proposedGroundArea:
          round(
            buildableFootprint
          ),

        totalGrossFloorArea:
          round(
            finalGrossFloorArea
          ),

        farMaximum:
          round(
            farMaximum
          ),
      },

      rate: {
        quality,

        ratePerSqft:
          ratePerSqft,
      },

      breakdown: {
        construction:
          round(
            constructionCost
          ),

        basement:
          round(
            basementCost
          ),

        garage:
          round(
            garageCost
          ),

        total:
          round(
            totalCost
          ),
      },

      floorBreakdown,

      compliance: {
        isCompliant,

        message: isCompliant
          ? "Proposed building is within the FAR limit."
          : "Proposed building exceeds the FAR limit.",
      },

      validation: {
        landAreaValid:
          landArea > 0,

        footprintValid:
          buildableFootprint > 0,

        farValid:
          finalGrossFloorArea <=
          farMaximum,
      },

      metadata: {
        source: "Temporary backend values",

        disclaimer:
          "These rates and regulations are temporary demo values. Final construction cost and building approval must be verified with the relevant authority and a licensed civil/structural engineer.",
      },
    });
  } catch (error) {
    console.error(
      "[Cost Estimator Error]:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to calculate construction cost.",

      error:
        error.message,
    });
  }
});

// ============================================================
// Export Router
// ============================================================

module.exports = router;