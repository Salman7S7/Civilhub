// src/services/costEstimator.js
// -----------------------------------------------------------------------------
// Interactive Cost Estimator — Feature 1 (proposal.md §1).
//
// Inputs : total floors, floor area (sqft per floor), material quality grade
//          (Standard / Premium / Luxury), basement flag, garage flag.
// Outputs: cost split into structure / finishing / electrical / plumbing
//          categories, with per-floor breakdown.
//
// Rates are BDT per sqft rule-of-thumb estimates for Bangladesh (2026),
// NOT a quoted BOQ. Keep assumptions explicit so they can be replaced with
// an authoritative dataset later.
// -----------------------------------------------------------------------------

export const QUALITY_GRADES = ["standard", "premium", "luxury"];

// Base construction rate per sqft (BDT) per quality grade.
export const RATE_PER_SQFT = {
  standard: 2200,
  premium: 2800,
  luxury: 3600,
};

// Category split of the base build cost. Must sum to 1.
export const CATEGORY_SHARE = {
  structure: 0.45,
  finishing: 0.3,
  electrical: 0.12,
  plumbing: 0.13,
};

// Extra built-up area assumptions.
export const BASEMENT_AREA_FACTOR = 0.9; // basement ≈ 90% of one floor plate
export const BASEMENT_RATE_FACTOR = 1.25; // basements cost more per sqft (retaining, waterproofing)
export const GARAGE_AREA_SQFT = 250; // single garage footprint
export const GARAGE_RATE_FACTOR = 0.8; // garage is simpler finish than living space

export function normalizeQuality(quality) {
  const q = String(quality || "standard").toLowerCase();
  return QUALITY_GRADES.includes(q) ? q : "standard";
}

/**
 * Estimate construction cost.
 *
 * @param {object} params
 * @param {number|string} params.floors - total floors (>= 1)
 * @param {number|string} params.floorAreaSqft - floor area per floor in sqft (> 0)
 * @param {string} params.quality - standard | premium | luxury
 * @param {boolean} params.hasBasement
 * @param {boolean} params.hasGarage
 * @returns {{
 *   quality: string,
 *   floors: number,
 *   floorAreaSqft: number,
 *   ratePerSqft: number,
 *   floorsCost: number,
 *   basementCost: number,
 *   garageCost: number,
 *   baseCost: number,
 *   structure: number,
 *   finishing: number,
 *   electrical: number,
 *   plumbing: number,
 *   total: number,
 *   perFloor: Array<{ floor: number, areaSqft: number, cost: number }>,
 *   totalBuiltUpArea: number,
 * }}
 */
export function estimateConstructionCost({
  floors,
  floorAreaSqft,
  quality,
  hasBasement,
  hasGarage,
}) {
  const grade = normalizeQuality(quality);
  const ratePerSqft = RATE_PER_SQFT[grade];

  const floorCount = Math.max(1, Math.floor(Number(floors) || 1));
  const areaPerFloor = Math.max(0, Number(floorAreaSqft) || 0);

  const basement = Boolean(hasBasement);
  const garage = Boolean(hasGarage);

  const floorsCost = floorCount * areaPerFloor * ratePerSqft;

  const basementCost = basement
    ? areaPerFloor * BASEMENT_AREA_FACTOR * ratePerSqft * BASEMENT_RATE_FACTOR
    : 0;

  const garageCost = garage
    ? GARAGE_AREA_SQFT * ratePerSqft * GARAGE_RATE_FACTOR
    : 0;

  const baseCost = floorsCost + basementCost + garageCost;

  const structure = baseCost * CATEGORY_SHARE.structure;
  const finishing = baseCost * CATEGORY_SHARE.finishing;
  const electrical = baseCost * CATEGORY_SHARE.electrical;
  const plumbing = baseCost * CATEGORY_SHARE.plumbing;

  const total = structure + finishing + electrical + plumbing;

  // Per-floor breakdown: each above-ground floor costs the same;
  // basement / garage are listed as separate lines so the sum reconciles.
  const perFloor = [];
  for (let i = 1; i <= floorCount; i += 1) {
    perFloor.push({
      floor: i,
      areaSqft: areaPerFloor,
      cost: areaPerFloor * ratePerSqft,
    });
  }
  if (basement) {
    perFloor.push({
      floor: 0,
      label: "Basement",
      areaSqft: areaPerFloor * BASEMENT_AREA_FACTOR,
      cost: basementCost,
    });
  }
  if (garage) {
    perFloor.push({
      label: "Garage",
      areaSqft: GARAGE_AREA_SQFT,
      cost: garageCost,
    });
  }

  const totalBuiltUpArea =
    floorCount * areaPerFloor +
    (basement ? areaPerFloor * BASEMENT_AREA_FACTOR : 0) +
    (garage ? GARAGE_AREA_SQFT : 0);

  return {
    quality: grade,
    floors: floorCount,
    floorAreaSqft: areaPerFloor,
    ratePerSqft,
    floorsCost,
    basementCost,
    garageCost,
    baseCost,
    structure,
    finishing,
    electrical,
    plumbing,
    total,
    perFloor,
    totalBuiltUpArea,
  };
}

export function formatBDT(value) {
  return `৳ ${Math.round(value || 0).toLocaleString()}`;
}
