// src/services/costEstimator.js

import { BACKEND_BASE_URL } from "./apiConfig";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

export const COST_ESTIMATOR_API =
  `${BACKEND_BASE_URL}/api/cost-estimator`;

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
| Backend এখনো connect করছি না।
| আগে frontend calculation ঠিকমতো কাজ করাব।
*/

export const USE_MOCK_BACKEND = false;

/*
|--------------------------------------------------------------------------
| ROOM DEFAULTS
|--------------------------------------------------------------------------
*/

export const ROOM_DEFAULTS = {
  bedroom: 120,
  bathroom: 45,
  living: 180,
  dining: 120,
  kitchen: 100,
  balcony: 40,
  other: 80,
};

// Old component compatibility
export const ROOM_DEFAULT_SIZES = ROOM_DEFAULTS;

/*
|--------------------------------------------------------------------------
| QUALITY OPTIONS
|--------------------------------------------------------------------------
*/

export const QUALITY_OPTIONS = [
  {
    value: "standard",
    label: "Standard",
    description: "Demo planning rate",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Demo planning rate",
  },
  {
    value: "luxury",
    label: "Luxury",
    description: "Demo planning rate",
  },
];

/*
|--------------------------------------------------------------------------
| DEMO COST RATES
|--------------------------------------------------------------------------
| These are NOT official government rates.
|--------------------------------------------------------------------------
*/

const QUALITY_RATES = {
  standard: 3500,
  premium: 4500,
  luxury: 6000,
};

/*
|--------------------------------------------------------------------------
| COST BREAKDOWN
|--------------------------------------------------------------------------
*/

const CATEGORY_SHARES = [
  ["Materials", 0.48],
  ["Labour", 0.12],
  ["Equipment", 0.05],
  ["Electrical", 0.08],
  ["Plumbing", 0.07],
  ["Finishing", 0.12],
  ["Other", 0.08],
];

/*
|--------------------------------------------------------------------------
| DEMO REGULATION RULES
|--------------------------------------------------------------------------
| Only for frontend testing.
|--------------------------------------------------------------------------
*/

const DEMO_RULES = {
  rajuk: {
    residential: {
      coverage: 0.6,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 0.65,
      far: 4.0,
      frontSetback: 6,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 0.6,
      far: 3.75,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  cda: {
    residential: {
      coverage: 0.6,
      far: 3.0,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 0.65,
      far: 3.5,
      frontSetback: 6,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 0.6,
      far: 3.25,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  kda: {
    residential: {
      coverage: 0.6,
      far: 3.0,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 0.65,
      far: 3.5,
      frontSetback: 6,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 0.6,
      far: 3.25,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  rda: {
    residential: {
      coverage: 0.6,
      far: 3.0,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 0.65,
      far: 3.5,
      frontSetback: 6,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 0.6,
      far: 3.25,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  general: {
    residential: {
      coverage: 0.6,
      far: 2.5,
      frontSetback: 5,
      rearSetback: 5,
      sideSetback: 4,
    },

    commercial: {
      coverage: 0.6,
      far: 2.5,
      frontSetback: 5,
      rearSetback: 5,
      sideSetback: 4,
    },

    mixed: {
      coverage: 0.6,
      far: 2.5,
      frontSetback: 5,
      rearSetback: 5,
      sideSetback: 4,
    },
  },
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const toNumber = (value) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const normalizeAuthority = (value) =>
  String(value || "general").toLowerCase();

const normalizeBuildingType = (value) =>
  String(value || "residential").toLowerCase();

const normalizeQuality = (value) => {
  const quality =
    String(value || "standard").toLowerCase();

  return QUALITY_RATES[quality]
    ? quality
    : "standard";
};

/*
|--------------------------------------------------------------------------
| UNIT CONVERSION
|--------------------------------------------------------------------------
*/

export function feetToMeter(value) {
  return toNumber(value) * 0.3048;
}

export function meterToFeet(value) {
  return toNumber(value) / 0.3048;
}

export function sqftToSqm(value) {
  return toNumber(value) * 0.092903;
}

export function sqmToSqft(value) {
  return toNumber(value) / 0.092903;
}

/*
|--------------------------------------------------------------------------
| LAND AREA
|--------------------------------------------------------------------------
*/

export function calculateLandArea({
  length,
  width,
  unit = "ft",
} = {}) {
  const l = toNumber(length);
  const w = toNumber(width);

  if (l <= 0 || w <= 0) {
    return {
      area: 0,
      areaSqft: 0,
      areaSqm: 0,
    };
  }

  const isMeter =
    String(unit).toLowerCase().startsWith("m");

  let areaSqft;

  if (isMeter) {
    areaSqft = sqmToSqft(l * w);
  } else {
    areaSqft = l * w;
  }

  const areaSqm =
    sqftToSqm(areaSqft);

  return {
    area: areaSqft,
    areaSqft,
    areaSqm,
  };
}

/*
|--------------------------------------------------------------------------
| REGULATION
|--------------------------------------------------------------------------
*/

export function getRegulationRules({
  authority = "general",
  buildingType = "residential",
  roadWidth = 0,
} = {}) {
  const normalizedAuthority =
    normalizeAuthority(authority);

  const normalizedBuildingType =
    normalizeBuildingType(buildingType);

  const selectedRules =
    DEMO_RULES[
      normalizedAuthority
    ]?.[
      normalizedBuildingType
    ] ||
    DEMO_RULES.general.residential;

  return {
    ...selectedRules,

    authority:
      normalizedAuthority,

    buildingType:
      normalizedBuildingType,

    roadWidth:
      toNumber(roadWidth),

    source:
      "Frontend demo / sample values",

    effectiveDate:
      "Demo only",

    isDemo: true,
  };
}

/*
|--------------------------------------------------------------------------
| FETCH REGULATION
|--------------------------------------------------------------------------
*/

export async function fetchRegulationRules(
  params = {}
) {
  /*
   * Backend OFF for now.
   */

  if (USE_MOCK_BACKEND) {
    return getRegulationRules(params);
  }

  const response =
    await fetch(
      `${COST_ESTIMATOR_API}/regulations?authority=${encodeURIComponent(
        params.authority || "general"
      )}&buildingType=${encodeURIComponent(
        params.buildingType || "residential"
      )}&roadWidth=${toNumber(
        params.roadWidth
      )}`
    );

  if (!response.ok) {
    throw new Error(
      "Unable to load regulation rules."
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| COST RATES
|--------------------------------------------------------------------------
*/

export function getCostRates(
  quality = "standard",
  buildingType = "residential"
) {
  const normalizedQuality =
    normalizeQuality(quality);

  return {
    quality:
      normalizedQuality,

    buildingType,

    ratePerSqft:
      QUALITY_RATES[
        normalizedQuality
      ],

    source:
      "Frontend demo / sample rate",

    effectiveDate:
      "Demo only",

    isDemo: true,
  };
}

/*
|--------------------------------------------------------------------------
| FETCH COST RATES
|--------------------------------------------------------------------------
*/

export async function fetchCostRates({
  quality = "standard",
  buildingType = "residential",
} = {}) {
  if (USE_MOCK_BACKEND) {
    return getCostRates(
      quality,
      buildingType
    );
  }

  const response =
    await fetch(
      `${COST_ESTIMATOR_API}/rates?quality=${encodeURIComponent(
        quality
      )}&buildingType=${encodeURIComponent(
        buildingType
      )}`
    );

  if (!response.ok) {
    throw new Error(
      "Unable to load cost rates."
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| ROOM AREA
|--------------------------------------------------------------------------
|
| Supports:
|
| calculateRoomArea({
|   count: 2,
|   area: 120
| })
|
| AND:
|
| calculateRoomArea({
|   bedroom: {...},
|   bathroom: {...}
| })
|
|--------------------------------------------------------------------------
*/

export function calculateRoomArea(
  roomsOrConfig = {},
  maybeSize
) {
  if (
    typeof roomsOrConfig.count !==
    "undefined"
  ) {
    const count =
      Math.max(
        0,
        toNumber(
          roomsOrConfig.count
        )
      );

    const area =
      Math.max(
        0,
        toNumber(
          roomsOrConfig.area ??
            roomsOrConfig.size
        )
      );

    return count * area;
  }

  if (
    typeof maybeSize !==
    "undefined"
  ) {
    return (
      Math.max(
        0,
        toNumber(roomsOrConfig)
      ) *
      Math.max(
        0,
        toNumber(maybeSize)
      )
    );
  }

  return Object.values(
    roomsOrConfig || {}
  ).reduce(
    (total, room) =>
      total +
      calculateRoomArea(room),
    0
  );
}

/*
|--------------------------------------------------------------------------
| GROSS FLOOR AREA
|--------------------------------------------------------------------------
*/

export function calculateGrossFloorArea(
  netRoomArea,
  allowancePercent = 20
) {
  const net =
    Math.max(
      0,
      toNumber(netRoomArea)
    );

  const allowance =
    Math.max(
      0,
      toNumber(allowancePercent)
    );

  return (
    net *
    (1 + allowance / 100)
  );
}

/*
|--------------------------------------------------------------------------
| BUILDABLE FOOTPRINT
|--------------------------------------------------------------------------
*/

export function calculateBuildableFootprint({
  landLength,
  landWidth,
  dimensionUnit = "ft",
  roadFacing = "front",
  rules,
} = {}) {
  const land =
    calculateLandArea({
      length: landLength,
      width: landWidth,
      unit: dimensionUnit,
    });

  const coverage =
    Math.max(
      0,
      toNumber(
        rules?.coverage
      )
    );

  const coverageArea =
    land.areaSqft *
    coverage;

  let lengthFt =
    toNumber(landLength);

  let widthFt =
    toNumber(landWidth);

  if (
    String(
      dimensionUnit
    )
      .toLowerCase()
      .startsWith("m")
  ) {
    lengthFt =
      meterToFeet(
        lengthFt
      );

    widthFt =
      meterToFeet(
        widthFt
      );
  }

  const front =
    toNumber(
      rules?.frontSetback
    );

  const rear =
    toNumber(
      rules?.rearSetback
    );

  const side =
    toNumber(
      rules?.sideSetback
    );

  const remainingLength =
    Math.max(
      0,
      lengthFt -
        front -
        rear
    );

  const remainingWidth =
    Math.max(
      0,
      widthFt -
        side * 2
    );

  const setbackArea =
    remainingLength *
    remainingWidth;

  return {
    coverageArea,

    setbackArea,

    maxFootprint:
      Math.max(
        0,
        Math.min(
          coverageArea,
          setbackArea
        )
      ),

    roadFacing,
  };
}

/*
|--------------------------------------------------------------------------
| COMPLETE ESTIMATE
|--------------------------------------------------------------------------
*/

export function calculateEstimate({
  land,
  authority,
  buildingType,
  floors = [],
  allowancePercent = 20,
  quality = "standard",
  hasBasement = false,
  hasGarage = false,
  rules,
  rates,
} = {}) {
  const landInfo =
    calculateLandArea(
      land || {}
    );

  const selectedRules =
    rules ||
    getRegulationRules({
      authority,
      buildingType,
      roadWidth:
        land?.roadWidth,
    });

  const selectedRates =
    rates ||
    getCostRates(
      quality,
      buildingType
    );

  const footprint =
    calculateBuildableFootprint({
      landLength:
        land?.length,

      landWidth:
        land?.width,

      dimensionUnit:
        land?.unit || "ft",

      roadFacing:
        land?.roadFacing ||
        "front",

      rules:
        selectedRules,
    });

  /*
   * Floor calculations
   */

  const floorBreakdown =
    floors.map(
      (floor, index) => {
        const netRoomArea =
          calculateRoomArea(
            floor?.rooms || {}
          );

        const grossArea =
          calculateGrossFloorArea(
            netRoomArea,
            allowancePercent
          );

        return {
          floor:
            floor?.floor ||
            index + 1,

          netRoomArea,

          grossArea,
        };
      }
    );

  const totalGrossFloorArea =
    floorBreakdown.reduce(
      (total, floor) =>
        total +
        floor.grossArea,
      0
    );

  const proposedGroundArea =
    floorBreakdown[0]
      ?.grossArea || 0;

  /*
   * FAR
   */

  const maxFarArea =
    landInfo.areaSqft *
    toNumber(
      selectedRules.far
    );

  /*
   * Maximum buildable footprint
   */

  const maxBuildableFootprint =
    footprint.maxFootprint;

  /*
   * Construction cost
   */

  const baseRate =
    toNumber(
      selectedRates.ratePerSqft
    ) ||
    QUALITY_RATES[
      normalizeQuality(
        quality
      )
    ];

  let costArea =
    totalGrossFloorArea;

  const basementArea =
    hasBasement
      ? maxBuildableFootprint
      : 0;

  const garageArea =
    hasGarage
      ? Math.min(
          maxBuildableFootprint,
          250
        )
      : 0;

  costArea +=
    basementArea +
    garageArea;

  const totalCost =
    costArea *
    baseRate;

  /*
   * Validation
   */

  const validation = [
    {
      label:
        "Ground coverage",

      value:
        `${Math.round(
          proposedGroundArea
        ).toLocaleString()} / ${Math.round(
          maxBuildableFootprint
        ).toLocaleString()} sqft`,

      status:
        proposedGroundArea <=
        maxBuildableFootprint
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
        totalGrossFloorArea <=
        maxFarArea
          ? "pass"
          : "fail",
    },
  ];

  /*
   * Breakdown
   */

  const breakdown =
    CATEGORY_SHARES.map(
      ([label, percentage]) => ({
        label,

        percentage:
          percentage * 100,

        amount:
          totalCost *
          percentage,
      })
    );

  return {
    landArea:
      landInfo.areaSqft,

    maxBuildableFootprint,

    proposedGroundArea,

    totalGrossFloorArea,

    maxFarArea,

    ratePerSqft:
      baseRate,

    totalCost,

    validation,

    breakdown,

    floorBreakdown,

    rules:
      selectedRules,

    rates:
      selectedRates,

    buildingArea: {
      netRoomArea:
        floorBreakdown.reduce(
          (total, floor) =>
            total +
            floor.netRoomArea,
          0
        ),

      grossFloorArea:
        totalGrossFloorArea,

      basementArea,

      garageArea,
    },

    options: {
      hasBasement,
      hasGarage,
      quality,
    },

    generatedAt:
      new Date().toISOString(),
  };
}

/*
|--------------------------------------------------------------------------
| OLD COMPONENT COMPATIBILITY
|--------------------------------------------------------------------------
|
| DesignDetailModal still uses this function.
|
|--------------------------------------------------------------------------
*/

export function estimateConstructionCost({
  floors = 1,
  floorAreaSqft = 0,
  quality = "standard",
  hasBasement = false,
  hasGarage = false,
} = {}) {
  const floorCount =
    Math.max(
      0,
      toNumber(floors)
    );

  const floorArea =
    Math.max(
      0,
      toNumber(
        floorAreaSqft
      )
    );

  const normalArea =
    floorCount *
    floorArea;

  const basementArea =
    hasBasement
      ? floorArea
      : 0;

  const garageArea =
    hasGarage
      ? Math.min(
          floorArea,
          250
        )
      : 0;

  const totalArea =
    normalArea +
    basementArea +
    garageArea;

  const rate =
    QUALITY_RATES[
      normalizeQuality(
        quality
      )
    ];

  const total =
    totalArea * rate;

  return {
    total,

    totalCost:
      total,

    ratePerSqft:
      rate,

    areaSqft:
      totalArea,
  };
}

/*
|--------------------------------------------------------------------------
| SAVE ESTIMATE
|--------------------------------------------------------------------------
*/

export async function saveEstimate(
  payload
) {
  /*
   * Backend OFF.
   * Local demo save.
   */

  if (USE_MOCK_BACKEND) {
    return {
      success: true,

      id:
        `DEMO-${Date.now()}`,

      source:
        "frontend-demo",
    };
  }

  const response =
    await fetch(
      `${COST_ESTIMATOR_API}/estimates`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Unable to save estimate."
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| BACKWARD COMPATIBILITY
|--------------------------------------------------------------------------
*/

export async function fetchLiveRatesFromDB() {
  return {
    source:
      "frontend-demo",

    rates:
      QUALITY_RATES,
  };
}

export async function recordEstimateInDB(
  estimate
) {
  return saveEstimate(
    estimate
  );
}

/*
|--------------------------------------------------------------------------
| FORMATTERS
|--------------------------------------------------------------------------
*/

export function formatBDT(value) {
  return `৳${Math.round(
    toNumber(value)
  ).toLocaleString("en-BD")}`;
}

export function formatSqft(value) {
  return `${Math.round(
    toNumber(value)
  ).toLocaleString("en-US")} sqft`;
}