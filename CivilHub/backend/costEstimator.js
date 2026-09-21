const express = require("express");

const router = express.Router();

/* =========================================================
   DEMO COST RATES
========================================================= */

const COST_RATES = {
  standard: {
    ratePerSqft: 3500,
  },

  premium: {
    ratePerSqft: 4500,
  },

  luxury: {
    ratePerSqft: 6000,
  },
};

/* =========================================================
   DEMO REGULATION
========================================================= */

const REGULATIONS = {
  rajuk: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  cda: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  kda: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  rda: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  general: {
    residential: {
      coverage: 60,
      far: 3,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },
};

/* =========================================================
   COST BREAKDOWN
========================================================= */

const CATEGORY_SHARES = [
  ["Materials", 0.48],
  ["Labour", 0.12],
  ["Equipment", 0.05],
  ["Electrical", 0.08],
  ["Plumbing", 0.07],
  ["Finishing", 0.12],
  ["Other", 0.08],
];

/* =========================================================
   HELPERS
========================================================= */

function toNumber(value, fallback = 0) {
  const number =
    Number.parseFloat(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function round(value) {
  return Math.round(
    value * 100
  ) / 100;
}

function normalizeAuthority(value) {
  const authority =
    String(
      value || "general"
    ).toLowerCase();

  return REGULATIONS[authority]
    ? authority
    : "general";
}

function normalizeBuildingType(value) {
  const type =
    String(
      value || "residential"
    ).toLowerCase();

  return [
    "residential",
    "commercial",
    "mixed",
  ].includes(type)
    ? type
    : "residential";
}

function normalizeQuality(value) {
  const quality =
    String(
      value || "standard"
    ).toLowerCase();

  return COST_RATES[quality]
    ? quality
    : "standard";
}

function normalizeRoadFacing(value) {
  const facing =
    String(
      value || "front"
    ).toLowerCase();

  return [
    "front",
    "rear",
    "left",
    "right",
  ].includes(facing)
    ? facing
    : "front";
}

function normalizeDimensionUnit(value) {
  const unit =
    String(
      value || "ft"
    ).toLowerCase();

  return unit.startsWith("m")
    ? "m"
    : "ft";
}

function convertToFeet(
  value,
  unit
) {
  const number =
    toNumber(value);

  return unit === "m"
    ? number / 0.3048
    : number;
}

/* =========================================================
   REGULATION
========================================================= */

function getRules(
  authority,
  buildingType
) {
  const a =
    normalizeAuthority(
      authority
    );

  const b =
    normalizeBuildingType(
      buildingType
    );

  return REGULATIONS[a][b];
}

/* =========================================================
   RATE
========================================================= */

function getRate(
  quality
) {
  const q =
    normalizeQuality(
      quality
    );

  return COST_RATES[q];
}

/* =========================================================
   FOOTPRINT
========================================================= */

function calculateFootprint(
  lengthFeet,
  widthFeet,
  rules,
  roadFacing
) {
  const landArea =
    lengthFeet *
    widthFeet;

  const coverageArea =
    landArea *
    (
      toNumber(
        rules.coverage
      ) / 100
    );

  const front =
    toNumber(
      rules.frontSetback
    );

  const rear =
    toNumber(
      rules.rearSetback
    );

  const side =
    toNumber(
      rules.sideSetback
    );

  let availableLength;
  let availableWidth;

  if (
    roadFacing === "front" ||
    roadFacing === "rear"
  ) {
    availableLength =
      Math.max(
        lengthFeet -
          front -
          rear,
        0
      );

    availableWidth =
      Math.max(
        widthFeet -
          side * 2,
        0
      );
  } else {
    availableLength =
      Math.max(
        lengthFeet -
          side * 2,
        0
      );

    availableWidth =
      Math.max(
        widthFeet -
          front -
          rear,
        0
      );
  }

  const setbackArea =
    availableLength *
    availableWidth;

  const maxFootprint =
    Math.max(
      0,
      Math.min(
        coverageArea,
        setbackArea
      )
    );

  return {
    landArea,
    coverageArea,
    setbackArea,
    maxFootprint,
  };
}

/* =========================================================
   ROOMS
========================================================= */

function normalizeRooms(
  rooms
) {
  if (
    Array.isArray(rooms)
  ) {
    return rooms;
  }

  if (
    rooms &&
    typeof rooms ===
      "object"
  ) {
    return Object.entries(
      rooms
    ).map(
      ([type, value]) => ({
        type,
        count: toNumber(
          value?.count,
          1
        ),
        area: toNumber(
          value?.area ??
            value?.size,
          0
        ),
      })
    );
  }

  return [];
}

/* =========================================================
   FLOOR BREAKDOWN
========================================================= */

function calculateFloorBreakdown(
  floors,
  floorCount,
  allowancePercent,
  fallbackArea
) {
  const result = [];

  for (
    let i = 0;
    i < floorCount;
    i++
  ) {
    const floor =
      Array.isArray(floors)
        ? floors[i] || {}
        : {};

    const rooms =
      normalizeRooms(
        floor.rooms
      );

    let netRoomArea = 0;

    rooms.forEach(
      (room) => {
        const count =
          Math.max(
            1,
            toNumber(
              room.count,
              1
            )
          );

        const area =
          Math.max(
            0,
            toNumber(
              room.area ??
                room.size
            )
          );

        netRoomArea +=
          count * area;
      }
    );

    if (
      netRoomArea <= 0
    ) {
      netRoomArea =
        fallbackArea;
    }

    const grossArea =
      netRoomArea *
      (
        1 +
        allowancePercent /
          100
      );

    result.push({
      floor: i + 1,

      netRoomArea:
        round(
          netRoomArea
        ),

      allowancePercent:
        round(
          allowancePercent
        ),

      grossArea:
        round(
          grossArea
        ),
    });
  }

  return result;
}

/* =========================================================
   BUILD ESTIMATE
========================================================= */

function buildEstimate(
  data = {}
) {
  const landLength =
    toNumber(
      data.landLength
    );

  const landWidth =
    toNumber(
      data.landWidth
    );

  if (
    landLength <= 0 ||
    landWidth <= 0
  ) {
    const error =
      new Error(
        "Land length and land width must be greater than 0."
      );

    error.statusCode =
      400;

    throw error;
  }

  const dimensionUnit =
    normalizeDimensionUnit(
      data.dimensionUnit
    );

  const lengthFeet =
    convertToFeet(
      landLength,
      dimensionUnit
    );

  const widthFeet =
    convertToFeet(
      landWidth,
      dimensionUnit
    );

  const roadWidth =
    toNumber(
      data.roadWidth
    );

  const roadFacing =
    normalizeRoadFacing(
      data.roadFacing
    );

  const authority =
    normalizeAuthority(
      data.authority
    );

  const buildingType =
    normalizeBuildingType(
      data.buildingType
    );

  const quality =
    normalizeQuality(
      data.quality
    );

  const rules =
    getRules(
      authority,
      buildingType
    );

  const rate =
    getRate(
      quality
    );

  const floorCount =
    Math.max(
      1,
      Math.min(
        30,
        Math.floor(
          toNumber(
            data.floorCount,
            1
          )
        )
      )
    );

  const allowancePercent =
    Math.max(
      0,
      Math.min(
        100,
        toNumber(
          data.allowancePercent,
          20
        )
      )
    );

  const floors =
    Array.isArray(
      data.floors
    )
      ? data.floors
      : [];

  const hasBasement =
    Boolean(
      data.hasBasement
    );

  const hasGarage =
    Boolean(
      data.hasGarage
    );

  const footprint =
    calculateFootprint(
      lengthFeet,
      widthFeet,
      rules,
      roadFacing
    );

  const floorBreakdown =
    calculateFloorBreakdown(
      floors,
      floorCount,
      allowancePercent,
      footprint.maxFootprint
    );

  const totalGrossFloorArea =
    floorBreakdown.reduce(
      (sum, floor) =>
        sum +
        floor.grossArea,
      0
    );

  const maxFarArea =
    footprint.landArea *
    toNumber(
      rules.far
    );

  const basementArea =
    hasBasement
      ? footprint.maxFootprint
      : 0;

  const garageArea =
    hasGarage
      ? Math.min(
          footprint.maxFootprint,
          250
        )
      : 0;

  const totalCostArea =
    totalGrossFloorArea +
    basementArea +
    garageArea;

  const totalCost =
    totalCostArea *
    toNumber(
      rate.ratePerSqft
    );

  const firstFloorGrossArea =
    floorBreakdown[0]
      ?.grossArea || 0;

  const coveragePass =
    firstFloorGrossArea <=
    footprint.maxFootprint +
      0.01;

  const farPass =
    totalGrossFloorArea <=
    maxFarArea +
      0.01;

  const footprintPass =
    footprint.maxFootprint >
    0;

  const isCompliant =
    coveragePass &&
    farPass &&
    footprintPass;

  const breakdown =
    CATEGORY_SHARES.map(
      ([label, percentage]) => ({
        label,

        percentage:
          percentage * 100,

        amount:
          round(
            totalCost *
              percentage
          ),
      })
    );

  return {
    success: true,

    source:
      "backend-temporary",

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
      lengthFeet:
        round(
          lengthFeet
        ),

      widthFeet:
        round(
          widthFeet
        ),

      areaSqft:
        round(
          footprint.landArea
        ),
    },

    rules: {
      ...rules,

      source:
        "Temporary backend values",

      effectiveDate:
        "Demo only",

      isDemo: true,
    },

    calculation: {
      buildableFootprint:
        round(
          footprint.maxFootprint
        ),

      coverageArea:
        round(
          footprint.coverageArea
        ),

      setbackArea:
        round(
          footprint.setbackArea
        ),

      proposedGroundArea:
        round(
          firstFloorGrossArea
        ),

      totalGrossFloorArea:
        round(
          totalGrossFloorArea
        ),

      farMaximum:
        round(
          maxFarArea
        ),
    },

    rate: {
      quality,

      ratePerSqft:
        toNumber(
          rate.ratePerSqft
        ),

      source:
        "Temporary backend values",

      effectiveDate:
        "Demo only",

      isDemo: true,
    },

    ratePerSqft:
      toNumber(
        rate.ratePerSqft
      ),

    landArea:
      round(
        footprint.landArea
      ),

    maxBuildableFootprint:
      round(
        footprint.maxFootprint
      ),

    proposedGroundArea:
      round(
        firstFloorGrossArea
      ),

    totalGrossFloorArea:
      round(
        totalGrossFloorArea
      ),

    maxFarArea:
      round(
        maxFarArea
      ),

    totalCost:
      round(
        totalCost
      ),

    breakdown,

    floorBreakdown,

    buildingArea: {
      netRoomArea:
        round(
          floorBreakdown.reduce(
            (
              sum,
              floor
            ) =>
              sum +
              floor.netRoomArea,
            0
          )
        ),

      grossFloorArea:
        round(
          totalGrossFloorArea
        ),

      basementArea:
        round(
          basementArea
        ),

      garageArea:
        round(
          garageArea
        ),
    },

    validation: [
      {
        label:
          "Ground coverage",

        value:
          `${Math.round(
            firstFloorGrossArea
          ).toLocaleString()} / ${Math.round(
            footprint.maxFootprint
          ).toLocaleString()} sqft`,

        status:
          coveragePass
            ? "pass"
            : "fail",
      },

      {
        label:
          "FAR area",

        value:
          `${Math.round(
            totalGrossFloorArea
          ).toLocaleString()} / ${Math.round(
            maxFarArea
          ).toLocaleString()} sqft`,

        status:
          farPass
            ? "pass"
            : "fail",
      },

      {
        label:
          "Buildable footprint",

        value:
          `${Math.round(
            footprint.maxFootprint
          ).toLocaleString()} sqft available`,

        status:
          footprintPass
            ? "pass"
            : "fail",
      },
    ],

    compliance: {
      isCompliant,

      message:
        isCompliant
          ? "The entered floor plan is within the temporary coverage and FAR limits."
          : "The entered floor plan exceeds one or more temporary coverage/FAR limits.",
    },

    options: {
      hasBasement,
      hasGarage,
      quality,
    },

    metadata: {
      source:
        "Temporary backend values",

      disclaimer:
        "Rates and regulations are temporary demo values. Final construction cost and building approval must be verified with the relevant authority and a licensed civil/structural engineer.",
    },

    generatedAt:
      new Date().toISOString(),
  };
}

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/health",
  (_req, res) => {
    res.json({
      success: true,

      service:
        "cost-estimator",

      message:
        "Cost Estimator Backend is running",
    });
  }
);

/* =========================================================
   RATES
========================================================= */

router.get(
  "/rates",
  (req, res) => {
    const quality =
      normalizeQuality(
        req.query.quality
      );

    res.json({
      success: true,

      source:
        "temporary",

      selectedQuality:
        quality,

      rates:
        COST_RATES,
    });
  }
);

/* =========================================================
   REGULATIONS
========================================================= */

router.get(
  "/regulations",
  (req, res) => {
    const authority =
      normalizeAuthority(
        req.query.authority
      );

    const buildingType =
      normalizeBuildingType(
        req.query.buildingType
      );

    const rules =
      REGULATIONS[
        authority
      ][
        buildingType
      ];

    res.json({
      success: true,

      source:
        "temporary",

      authority,

      buildingType,

      roadWidth:
        toNumber(
          req.query.roadWidth
        ),

      rules: {
        ...rules,

        source:
          "Temporary backend values",

        effectiveDate:
          "Demo only",

        isDemo: true,
      },
    });
  }
);

/* =========================================================
   CALCULATE ESTIMATE
========================================================= */

router.post(
  "/estimate",
  (req, res) => {
    try {
      const result =
        buildEstimate(
          req.body
        );

      return res.json(
        result
      );
    } catch (error) {
      console.error(
        "[Cost Estimator Error]:",
        error
      );

      return res
        .status(
          error.statusCode ||
            500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Failed to calculate construction cost.",
        });
    }
  }
);

/* =========================================================
   SAVE ESTIMATE
========================================================= */

router.post(
  "/estimates",
  async (
    req,
    res
  ) => {
    try {
      const estimate =
        buildEstimate(
          req.body
        );

      return res.json({
        success: true,

        id:
          `EST-${Date.now()}`,

        estimateId:
          `EST-${Date.now()}`,

        source:
          "computed",

        estimate,
      });
    } catch (error) {
      console.error(
        "[Cost Estimate Save Error]:",
        error
      );

      return res
        .status(
          error.statusCode ||
            500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Unable to save estimate.",
        });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports =
  router;