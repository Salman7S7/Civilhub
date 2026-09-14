// src/services/costEstimator.js
// -----------------------------------------------------------------------------
// Interactive Cost Estimator — Feature 1 (proposal.md §1 & MySQL Integration).
//
// Inputs : total floors, floor area (sqft per floor), material quality grade
//          (Standard / Premium / Luxury), basement flag, garage flag.
// Outputs: cost split into structure / finishing / electrical / plumbing
//          categories, with per-floor breakdown.
//
// Syncs rates dynamically from MySQL database (construction_rates table)
// with built-in Bangladesh 2026 rule-of-thumb baseline defaults.
// -----------------------------------------------------------------------------

const BACKEND_BASE_URL = "http://localhost:4000";

export const QUALITY_GRADES = ["standard", "premium", "luxury"];

// Baseline construction rates per sqft (BDT) per quality grade
export let RATE_PER_SQFT = {
  standard: 2200,
  premium: 2800,
  luxury: 3600,
};

// Baseline category shares
export let CATEGORY_SHARE = {
  structure: 0.45,
  finishing: 0.3,
  electrical: 0.12,
  plumbing: 0.13,
};

// Extra built-up area assumptions
export let BASEMENT_AREA_FACTOR = 0.9;
export let BASEMENT_RATE_FACTOR = 1.25;
export let GARAGE_AREA_SQFT = 250;
export let GARAGE_RATE_FACTOR = 0.8;

let dbRatesLoaded = false;

/**
 * Fetch live construction rates from MySQL database.
 *
 * @returns {Promise<Object>}
 */
export async function fetchLiveRatesFromDB() {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/costs/rates`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        if (data.rates.standard?.rate_per_sqft) RATE_PER_SQFT.standard = data.rates.standard.rate_per_sqft;
        if (data.rates.premium?.rate_per_sqft) RATE_PER_SQFT.premium = data.rates.premium.rate_per_sqft;
        if (data.rates.luxury?.rate_per_sqft) RATE_PER_SQFT.luxury = data.rates.luxury.rate_per_sqft;

        const std = data.rates.standard;
        if (std) {
          if (std.structure_share) CATEGORY_SHARE.structure = std.structure_share;
          if (std.finishing_share) CATEGORY_SHARE.finishing = std.finishing_share;
          if (std.electrical_share) CATEGORY_SHARE.electrical = std.electrical_share;
          if (std.plumbing_share) CATEGORY_SHARE.plumbing = std.plumbing_share;
          if (std.basement_rate_factor) BASEMENT_RATE_FACTOR = std.basement_rate_factor;
          if (std.basement_area_factor) BASEMENT_AREA_FACTOR = std.basement_area_factor;
          if (std.garage_rate_factor) GARAGE_RATE_FACTOR = std.garage_rate_factor;
          if (std.garage_area_sqft) GARAGE_AREA_SQFT = std.garage_area_sqft;
        }

        dbRatesLoaded = true;
        return { source: "mysql", rates: data.rates };
      }
    }
  } catch (err) {
    console.warn("Could not fetch live rates from MySQL, using baseline rates:", err.message);
  }
  return { source: "baseline", rates: { standard: RATE_PER_SQFT.standard, premium: RATE_PER_SQFT.premium, luxury: RATE_PER_SQFT.luxury } };
}

/**
 * Persist an estimate calculation to MySQL database.
 */
export async function recordEstimateInDB(params, result, designTitle = null) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/costs/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        floors: result.floors,
        floorAreaSqft: result.floorAreaSqft,
        quality: result.quality,
        hasBasement: params.hasBasement,
        hasGarage: params.hasGarage,
        designTitle: designTitle || params.designTitle || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn("Could not save estimate to MySQL database:", err.message);
  }
  return null;
}

export function normalizeQuality(quality) {
  const q = String(quality || "standard").toLowerCase();
  return QUALITY_GRADES.includes(q) ? q : "standard";
}

/**
 * Estimate construction cost using MySQL rates or baseline.
 *
 * @param {object} params
 * @param {number|string} params.floors - total floors (>= 1)
 * @param {number|string} params.floorAreaSqft - floor area per floor in sqft (> 0)
 * @param {string} params.quality - standard | premium | luxury
 * @param {boolean} params.hasBasement
 * @param {boolean} params.hasGarage
 * @returns {object}
 */
export function estimateConstructionCost({
  floors,
  floorAreaSqft,
  quality,
  hasBasement,
  hasGarage,
}) {
  const grade = normalizeQuality(quality);
  const ratePerSqft = RATE_PER_SQFT[grade] || 2200;

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
