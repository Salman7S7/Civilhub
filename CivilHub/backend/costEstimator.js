import {
  RAJUK_GROUND_COVERAGE_RULES,
  BD_CONSTRUCTION_RATES,
  BD_COST_BREAKDOWN_PERCENTAGES,
  AVERAGE_ROOM_SIZES,
} from "./costEstimatorData.js";

/**
 * Convert land area in Katha to Sq Ft (1 Katha = 720 Sq Ft in BD)
 */
export function kathaToSqFt(katha) {
  return parseFloat(katha || 0) * 720;
}

/**
 * Calculate RAJUK Maximum Ground Coverage (MGC) percentage and max buildable area
 */
export function calculateRajukCoverage(landAreaKatha) {
  const katha = parseFloat(landAreaKatha) || 0;
  const totalLandSqFt = kathaToSqFt(katha);

  const rule = RAJUK_GROUND_COVERAGE_RULES.find(
    (r) => katha >= r.minKatha && katha < r.maxKatha
  ) || RAJUK_GROUND_COVERAGE_RULES[2]; // Default 62.5%

  const maxMGCPercent = rule.maxMGCPercent;
  const maxGroundFootprintSqFt = (totalLandSqFt * maxMGCPercent) / 100;
  const mandatoryOpenSpaceSqFt = totalLandSqFt - maxGroundFootprintSqFt;

  return {
    totalLandSqFt,
    maxMGCPercent,
    maxGroundFootprintSqFt,
    mandatoryOpenSpaceSqFt,
    ruleDescription: rule.description,
  };
}

/**
 * Calculate estimated area per floor based on detailed room counts
 */
export function calculateFloorAreaFromRooms(roomDetails) {
  const {
    bedrooms = 0,
    masterBedrooms = 0,
    bathrooms = 0,
    kitchens = 0,
    livingRooms = 0,
    diningRooms = 0,
    balconies = 0,
  } = roomDetails || {};

  const area =
    bedrooms * AVERAGE_ROOM_SIZES.bedroom +
    masterBedrooms * AVERAGE_ROOM_SIZES.masterBedroom +
    bathrooms * AVERAGE_ROOM_SIZES.bathroom +
    kitchens * AVERAGE_ROOM_SIZES.kitchen +
    livingRooms * AVERAGE_ROOM_SIZES.livingRoom +
    diningRooms * AVERAGE_ROOM_SIZES.diningRoom +
    balconies * AVERAGE_ROOM_SIZES.balcony +
    AVERAGE_ROOM_SIZES.corridorStairs;

  return Math.round(area);
}

/**
 * Main Building Cost Calculation Function
 */
export function calculateBuildingCost(input) {
  const {
    landAreaKatha = 0,
    numberOfFloors = 1,
    qualityTier = "standard",
    customSqFtPerFloor = null,
    roomDetails = null,
  } = input;

  // 1. RAJUK Land Coverage Calculation
  const rajukCoverage = calculateRajukCoverage(landAreaKatha);

  // 2. Floor Area Determination
  let areaPerFloor = 0;
  let areaSource = "RAJUK Max Coverage Footprint";

  if (roomDetails && roomDetails.useRoomDetails) {
    areaPerFloor = calculateFloorAreaFromRooms(roomDetails);
    areaSource = "Detailed Room Calculation";
  } else if (customSqFtPerFloor && parseFloat(customSqFtPerFloor) > 0) {
    areaPerFloor = parseFloat(customSqFtPerFloor);
    areaSource = "Custom Floor Area";
  } else {
    areaPerFloor = rajukCoverage.maxGroundFootprintSqFt;
  }

  const floors = Math.max(1, parseInt(numberOfFloors) || 1);
  const totalBuiltUpAreaSqFt = areaPerFloor * floors;

  // Check if room floor area exceeds RAJUK ground coverage limit
  const isExceedingRajukMGC = areaPerFloor > rajukCoverage.maxGroundFootprintSqFt;

  // 3. Construction Rate Determination
  const selectedRateObj = BD_CONSTRUCTION_RATES[qualityTier] || BD_CONSTRUCTION_RATES.standard;
  const ratePerSqFt = selectedRateObj.ratePerSqFt;

  // 4. Total Cost Calculation
  const totalEstimatedCost = totalBuiltUpAreaSqFt * ratePerSqFt;

  // 5. Categorized Cost Breakdown based on RAJUK/BD rules
  const costBreakdown = BD_COST_BREAKDOWN_PERCENTAGES.map((item) => {
    const itemAmount = (totalEstimatedCost * item.percentage) / 100;
    return {
      ...item,
      amountBDT: Math.round(itemAmount),
    };
  });

  return {
    landAreaKatha: parseFloat(landAreaKatha) || 0,
    rajukCoverage,
    numberOfFloors: floors,
    areaPerFloorSqFt: Math.round(areaPerFloor),
    totalBuiltUpAreaSqFt: Math.round(totalBuiltUpAreaSqFt),
    areaSource,
    isExceedingRajukMGC,
    qualityTier,
    qualityLabel: selectedRateObj.label,
    ratePerSqFt,
    totalEstimatedCostBDT: Math.round(totalEstimatedCost),
    costBreakdown,
    roomDetails,
  };
}