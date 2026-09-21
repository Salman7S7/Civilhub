// src/services/costEstimator.js

import { Platform } from "react-native";

/* =========================================================
   API CONFIG
========================================================= */

export const COST_ESTIMATOR_API =
  Platform.OS === "android"
    ? "http://10.0.2.2:4000/api/cost-estimator"
    : "http://localhost:4000/api/cost-estimator";

export const USE_MOCK_BACKEND = false;

/* =========================================================
   ROOM DEFAULTS
========================================================= */

export const ROOM_DEFAULTS = {
  bedroom: 120,
  bathroom: 45,
  living: 180,
  dining: 120,
  kitchen: 100,
  balcony: 40,
  other: 80,
};

export const ROOM_DEFAULT_SIZES = ROOM_DEFAULTS;

/* =========================================================
   QUALITY OPTIONS
========================================================= */

export const QUALITY_OPTIONS = [
  {
    value: "standard",
    label: "Standard",
    description: "Standard construction rate",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Premium construction rate",
  },
  {
    value: "luxury",
    label: "Luxury",
    description: "Luxury construction rate",
  },
];

/* =========================================================
   DEMO COST RATES
========================================================= */

const QUALITY_RATES = {
  standard: 3500,
  premium: 4500,
  luxury: 6000,
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
   DEMO REGULATION RULES
========================================================= */

const DEMO_RULES = {
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
   HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const normalizeAuthority = (value) => {
  const authority =
    String(value || "general").toLowerCase();

  return DEMO_RULES[authority]
    ? authority
    : "general";
};

const normalizeBuildingType = (value) => {
  const type =
    String(value || "residential").toLowerCase();

  return [
    "residential",
    "commercial",
    "mixed",
  ].includes(type)
    ? type
    : "residential";
};

const normalizeQuality = (value) => {
  const quality =
    String(value || "standard").toLowerCase();

  return QUALITY_RATES[quality]
    ? quality
    : "standard";
};

/* =========================================================
   UNIT CONVERSION
========================================================= */

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

/* =========================================================
   LAND AREA
========================================================= */

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
    String(unit)
      .toLowerCase()
      .startsWith("m");

  const areaSqft = isMeter
    ? sqmToSqft(l * w)
    : l * w;

  return {
    area: areaSqft,
    areaSqft,
    areaSqm: sqftToSqm(areaSqft),
  };
}

/* =========================================================
   REGULATION
========================================================= */

export function getRegulationRules({
  authority = "general",
  buildingType = "residential",
  roadWidth = 0,
} = {}) {
  const normalizedAuthority =
    normalizeAuthority(authority);

  const normalizedBuildingType =
    normalizeBuildingType(buildingType);

  const rules =
    DEMO_RULES[normalizedAuthority][
      normalizedBuildingType
    ];

  return {
    ...rules,
    authority: normalizedAuthority,
    buildingType: normalizedBuildingType,
    roadWidth: toNumber(roadWidth),
    source: "Frontend demo values",
    effectiveDate: "Demo only",
    isDemo: true,
  };
}

/* =========================================================
   FETCH REGULATION
========================================================= */

export async function fetchRegulationRules(
  params = {}
) {
  if (USE_MOCK_BACKEND) {
    return getRegulationRules(params);
  }

  const url =
    `${COST_ESTIMATOR_API}/regulations` +
    `?authority=${encodeURIComponent(
      params.authority || "general"
    )}` +
    `&buildingType=${encodeURIComponent(
      params.buildingType || "residential"
    )}` +
    `&roadWidth=${toNumber(
      params.roadWidth
    )}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Unable to load regulation rules."
    );
  }

  const data = await response.json();

  if (data?.rules) {
    return {
      ...data.rules,
      authority:
        data.authority ||
        params.authority ||
        "general",
      buildingType:
        data.buildingType ||
        params.buildingType ||
        "residential",
      source:
        data.source || "backend",
      effectiveDate:
        data.effectiveDate ||
        "Backend temporary values",
      isDemo: true,
    };
  }

  return data;
}

/* =========================================================
   COST RATES
========================================================= */

export function getCostRates(
  quality = "standard",
  buildingType = "residential"
) {
  const normalizedQuality =
    normalizeQuality(quality);

  return {
    quality: normalizedQuality,
    buildingType,
    ratePerSqft:
      QUALITY_RATES[normalizedQuality],
    source: "Frontend demo values",
    effectiveDate: "Demo only",
    isDemo: true,
  };
}

/* =========================================================
   FETCH COST RATES
========================================================= */

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

  const response = await fetch(
    `${COST_ESTIMATOR_API}/rates` +
      `?quality=${encodeURIComponent(
        quality
      )}` +
      `&buildingType=${encodeURIComponent(
        buildingType
      )}`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load cost rates."
    );
  }

  const data = await response.json();

  const normalizedQuality =
    normalizeQuality(quality);

  const rawRate =
    data?.rates?.[normalizedQuality] ||
    data?.[normalizedQuality] ||
    data;

  const ratePerSqft = Number(
    rawRate?.ratePerSqft ??
      rawRate?.rate_per_sqft ??
      rawRate
  );

  if (
    !Number.isFinite(ratePerSqft) ||
    ratePerSqft <= 0
  ) {
    throw new Error(
      "Invalid cost rate received from backend."
    );
  }

  return {
    ...rawRate,
    quality: normalizedQuality,
    buildingType,
    ratePerSqft,
  };
}

/* =========================================================
   BUILDING FOOTPRINT
========================================================= */

export function calculateBuildableFootprint({
  length,
  width,
  landLength,
  landWidth,
  unit = "ft",
  dimensionUnit,
  rules,
  roadFacing = "front",
} = {}) {
  const resolvedLength =
    length ?? landLength;

  const resolvedWidth =
    width ?? landWidth;

  const resolvedUnit =
    dimensionUnit || unit;

  const land = calculateLandArea({
    length: resolvedLength,
    width: resolvedWidth,
    unit: resolvedUnit,
  });

  const lengthFeet =
    String(resolvedUnit)
      .toLowerCase()
      .startsWith("m")
      ? meterToFeet(resolvedLength)
      : toNumber(resolvedLength);

  const widthFeet =
    String(resolvedUnit)
      .toLowerCase()
      .startsWith("m")
      ? meterToFeet(resolvedWidth)
      : toNumber(resolvedWidth);

  const effectiveRules = {
    coverage: 60,
    frontSetback: 5,
    rearSetback: 3,
    sideSetback: 3,
    ...(rules || {}),
  };

  const frontSetback =
    toNumber(
      effectiveRules.frontSetback
    );

  const rearSetback =
    toNumber(
      effectiveRules.rearSetback
    );

  const sideSetback =
    toNumber(
      effectiveRules.sideSetback
    );

  const usableLength = Math.max(
    0,
    lengthFeet -
      frontSetback -
      rearSetback
  );

  const usableWidth = Math.max(
    0,
    widthFeet -
      sideSetback * 2
  );

  const setbackArea =
    usableLength * usableWidth;

  const coverageArea =
    land.areaSqft *
    (toNumber(
      effectiveRules.coverage,
      60
    ) / 100);

  const maxFootprint = Math.min(
    setbackArea,
    coverageArea
  );

  return {
    landArea: land.areaSqft,
    landAreaSqm: land.areaSqm,

    lengthFeet,
    widthFeet,

    usableLength,
    usableWidth,

    setbackArea,
    coverageArea,

    maxFootprint:
      Math.max(0, maxFootprint),

    coveragePercent:
      toNumber(
        effectiveRules.coverage,
        60
      ),

    setbacks: {
      front: frontSetback,
      rear: rearSetback,
      side: sideSetback,
    },

    roadFacing,
  };
}

/* =========================================================
   ROOM AREA
========================================================= */

export function calculateRoomArea(
  rooms = {}
) {
  const list = Array.isArray(rooms)
    ? rooms
    : Object.entries(
        rooms || {}
      ).map(([type, value]) => ({
        type,
        count:
          value?.count ?? 0,
        area:
          value?.area ??
          value?.size ??
          0,
      }));

  return list.reduce(
    (total, room) => {
      const count = Math.max(
        0,
        toNumber(room?.count)
      );

      const area = Math.max(
        0,
        toNumber(
          room?.area ??
            room?.size
        )
      );

      return (
        total +
        count * area
      );
    },
    0
  );
}

/* =========================================================
   GROSS FLOOR AREA
========================================================= */

export function calculateGrossFloorArea(
  roomArea,
  allowancePercent = 20
) {
  const area = Math.max(
    0,
    toNumber(roomArea)
  );

  const allowance = Math.max(
    0,
    toNumber(allowancePercent)
  );

  return (
    area *
    (1 + allowance / 100)
  );
}

/* =========================================================
   FORMAT HELPERS
========================================================= */

export function formatBDT(value) {
  const amount = Math.round(
    toNumber(value)
  );

  return `৳${amount.toLocaleString(
    "en-BD"
  )}`;
}

export function formatSqft(value) {
  const area = toNumber(value);

  return `${Math.round(
    area
  ).toLocaleString(
    "en-BD"
  )} sqft`;
}

/* =========================================================
   LOCAL ESTIMATE
========================================================= */

export function calculateLocalEstimate({
  landLength = 0,
  landWidth = 0,
  dimensionUnit = "ft",
  authority = "general",
  buildingType = "residential",
  roadWidth = 0,
  roadFacing = "front",
  floorCount = 1,
  quality = "standard",
  hasBasement = false,
  hasGarage = false,
  floors = [],
  allowancePercent = 20,
} = {}) {
  const rules =
    getRegulationRules({
      authority,
      buildingType,
      roadWidth,
    });

  const rate =
    getCostRates(
      quality,
      buildingType
    );

  const footprint =
    calculateBuildableFootprint({
      landLength,
      landWidth,
      dimensionUnit,
      rules,
      roadFacing,
    });

  const normalizedFloors =
    Array.isArray(floors) &&
    floors.length > 0
      ? floors
      : Array.from(
          {
            length: Math.max(
              1,
              toNumber(
                floorCount,
                1
              )
            ),
          },
          (_, index) => ({
            floor: index + 1,
            rooms: [],
          })
        );

  const floorBreakdown =
    normalizedFloors.map(
      (floor, index) => {
        const roomArea =
          calculateRoomArea(
            floor?.rooms || []
          );

        const grossArea =
          calculateGrossFloorArea(
            roomArea,
            allowancePercent
          );

        return {
          floor:
            index + 1,
          netRoomArea:
            roomArea,
          grossArea,
        };
      }
    );

  const totalGrossFloorArea =
    floorBreakdown.reduce(
      (sum, floor) =>
        sum +
        floor.grossArea,
      0
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
    rate.ratePerSqft;

  const maxFarArea =
    footprint.landArea *
    rules.far;

  const firstFloorArea =
    floorBreakdown[0]
      ?.grossArea || 0;

  const coveragePass =
    firstFloorArea <=
    footprint.maxFootprint;

  const farPass =
    totalGrossFloorArea <=
    maxFarArea;

  const compliance =
    coveragePass &&
    farPass;

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
    success: true,

    landArea:
      footprint.landArea,

    buildableFootprint:
      footprint.maxFootprint,

    proposedGroundArea:
      firstFloorArea,

    totalGrossFloorArea,

    maxFarArea,

    ratePerSqft:
      rate.ratePerSqft,

    totalCost,

    breakdown,

    floorBreakdown,

    rules,

    compliance: {
      isCompliant:
        compliance,
      coveragePass,
      farPass,
    },

    buildingArea: {
      grossFloorArea:
        totalGrossFloorArea,
      basementArea,
      garageArea,
    },

    validation: [
      {
        label:
          "Ground Coverage",
        status:
          coveragePass
            ? "pass"
            : "fail",
      },
      {
        label: "FAR",
        status:
          farPass
            ? "pass"
            : "fail",
      },
    ],
  };
}

/* =========================================================
   SCREEN-SIDE CALCULATOR
========================================================= */

export function calculateEstimate({
  land = {},
  authority = "general",
  buildingType = "residential",
  floors = [],
  allowancePercent = 20,
  quality = "standard",
  hasBasement = false,
  hasGarage = false,
  rules,
  rates,
} = {}) {
  const landLength =
    toNumber(land.length);

  const landWidth =
    toNumber(land.width);

  const dimensionUnit =
    land.unit || "ft";

  const roadWidth =
    toNumber(
      land.roadWidth
    );

  const roadFacing =
    land.roadFacing ||
    "front";

  const effectiveRules =
    rules ||
    getRegulationRules({
      authority,
      buildingType,
      roadWidth,
    });

  const effectiveRate =
    rates ||
    getCostRates(
      quality,
      buildingType
    );

  const normalizedFloors =
    Array.isArray(floors) &&
    floors.length > 0
      ? floors.map(
          (floor, index) => ({
            ...floor,

            floor:
              index + 1,

            rooms:
              Array.isArray(
                floor?.rooms
              )
                ? floor.rooms
                : Object.entries(
                    floor?.rooms ||
                      {}
                  ).map(
                    ([type, value]) => ({
                      type,

                      count:
                        value?.count ??
                        0,

                      area:
                        value?.area ??
                        value?.size ??
                        0,
                    })
                  ),
          })
        )
      : [
          {
            floor: 1,
            rooms: [],
          },
        ];

  const localResult =
    calculateLocalEstimate({
      landLength,
      landWidth,
      dimensionUnit,
      authority,
      buildingType,
      roadWidth,
      roadFacing,
      floorCount:
        normalizedFloors.length,
      quality,
      hasBasement,
      hasGarage,
      floors:
        normalizedFloors,
      allowancePercent,
    });

  const footprint =
    calculateBuildableFootprint({
      landLength,
      landWidth,
      dimensionUnit,
      rules:
        effectiveRules,
      roadFacing,
    });

  const floorBreakdown =
    normalizedFloors.map(
      (floor, index) => {
        const roomArea =
          calculateRoomArea(
            floor.rooms
          );

        const grossArea =
          calculateGrossFloorArea(
            roomArea,
            allowancePercent
          );

        return {
          floor:
            index + 1,
          netRoomArea:
            roomArea,
          grossArea,
        };
      }
    );

  const totalGrossFloorArea =
    floorBreakdown.reduce(
      (sum, floor) =>
        sum +
        floor.grossArea,
      0
    );

  const firstFloorGrossArea =
    floorBreakdown[0]
      ?.grossArea || 0;

  const maxFarArea =
    footprint.landArea *
    toNumber(
      effectiveRules.far
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

  const ratePerSqft =
    toNumber(
      effectiveRate?.ratePerSqft,
      getCostRates(
        quality,
        buildingType
      ).ratePerSqft
    );

  const totalCost =
    totalCostArea *
    ratePerSqft;

  const coveragePass =
    firstFloorGrossArea <=
    footprint.maxFootprint +
      0.01;

  const farPass =
    totalGrossFloorArea <=
    maxFarArea + 0.01;

  const footprintPass =
    footprint.maxFootprint >
    0;

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
    ...localResult,

    success: true,

    landArea:
      footprint.landArea,

    maxBuildableFootprint:
      footprint.maxFootprint,

    proposedGroundArea:
      firstFloorGrossArea,

    totalGrossFloorArea,

    maxFarArea,

    ratePerSqft,

    totalCost,

    breakdown,

    floorBreakdown,

    rules:
      effectiveRules,

    buildingArea: {
      netRoomArea:
        floorBreakdown.reduce(
          (sum, floor) =>
            sum +
            floor.netRoomArea,
          0
        ),

      grossFloorArea:
        totalGrossFloorArea,

      basementArea,

      garageArea,
    },

    validation: [
      {
        label:
          "Ground coverage",

        value:
          `${Math.round(
            firstFloorGrossArea
          ).toLocaleString()} / ` +
          `${Math.round(
            footprint.maxFootprint
          ).toLocaleString()} sqft`,

        status:
          coveragePass
            ? "pass"
            : "fail",
      },

      {
        label: "FAR area",

        value:
          `${Math.round(
            totalGrossFloorArea
          ).toLocaleString()} / ` +
          `${Math.round(
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
      isCompliant:
        coveragePass &&
        farPass &&
        footprintPass,
    },

    options: {
      hasBasement,
      hasGarage,
      quality,
    },
  };
}

/* =========================================================
   MAIN CALCULATOR
========================================================= */

export async function calculateCostEstimate(
  params = {}
) {
  if (USE_MOCK_BACKEND) {
    return calculateLocalEstimate(
      params
    );
  }

  const response =
    await fetch(
      `${COST_ESTIMATOR_API}/estimate`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          params
        ),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Cost estimation failed."
    );
  }

  return data;
}

/* =========================================================
   SAVE ESTIMATE
========================================================= */

export async function saveEstimate(
  params = {}
) {
  const payload =
    params?.input &&
    typeof params.input ===
      "object"
      ? params.input
      : params;

  const response =
    await fetch(
      `${COST_ESTIMATOR_API}/estimates`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to save estimate."
    );
  }

  return data;
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  calculateLandArea,
  calculateBuildableFootprint,
  calculateRoomArea,
  calculateGrossFloorArea,
  calculateEstimate,
  calculateLocalEstimate,
  calculateCostEstimate,
  formatBDT,
  formatSqft,
  fetchRegulationRules,
  fetchCostRates,
  getRegulationRules,
  getCostRates,
  saveEstimate,
};