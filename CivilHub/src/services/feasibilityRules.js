// src/services/feasibilityRules.js
// -----------------------------------------------------------------------------
// Local feasibility heuristics used by FeasibilityForm for an *instant estimate*.
//
// ⚠️ IMPORTANT — READ BEFORE SHIPPING:
// Actual RAJUK approvals depend on plot size, road width, AND the specific
// Detailed Area Plan (DAP 2022–2035) zone — e.g. published reporting shows
// residential height caps varying by neighborhood (around 6 storeys in
// Kuril/Khilkhet/Nikunja, 7 in Uttara, 8 in Gulshan/Banani/Baridhara), and
// RAJUK has been actively amending these zone rules through 2025. FAR and
// Maximum Ground Coverage (MGC) also scale with both plot size and road
// width per the RAJUK FAR/MGC guideline tables (Dhaka Imarat Nirman
// Bidhimala). None of that zone-by-zone detail can be safely reduced to one
// static table here — a wrong number could cost someone a real permit.
//
// What IS hardcoded below are specific, commonly documented regulatory
// thresholds that are not zone-dependent:
//   - Minimum plot entry gate width: 18 ft (else plan approval is refused)
//   - Minimum driveway width: 14 ft
//   - Lift mandatory above 6 storeys
//   - Fire stairs mandatory above 10 storeys / 33 m height
//   - CAAB height clearance required near airport/runway zones
//
// This file gives a *directional* planning estimate only. Before any real
// construction decision, the plot's actual FAR/MGC/height entitlement must
// be confirmed via RAJUK's Land Use Clearance (LUC) process (or the
// equivalent CDA/RDA/KDA/municipal process), and a licensed structural
// engineer should review the final design.
// -----------------------------------------------------------------------------

// Directional road-width → max-storey planning bands. These are a simplified
// approximation for demo purposes, broadly consistent with how wider roads
// unlock higher FAR/MGC and thus more storeys under RAJUK guidelines — but
// they are NOT a substitute for the actual FAR/MGC table lookup, which also
// depends on plot size and DAP zone.
const ROAD_WIDTH_HEIGHT_TABLE = [
  { minWidth: 60, maxStories: 20, label: "60 ft+" },
  { minWidth: 40, maxStories: 14, label: "40–59 ft" },
  { minWidth: 25, maxStories: 10, label: "25–39 ft" },
  { minWidth: 20, maxStories: 7, label: "20–24 ft" },
  { minWidth: 18, maxStories: 6, label: "18–19 ft (min. gate width)" },
  { minWidth: 12, maxStories: 4, label: "12–17 ft" },
  { minWidth: 0, maxStories: 3, label: "Under 12 ft" },
];

const MIN_GATE_WIDTH_FT = 18;
const MIN_DRIVEWAY_WIDTH_FT = 14;
const LIFT_REQUIRED_ABOVE_STORIES = 6;
const FIRE_STAIRS_REQUIRED_ABOVE_STORIES = 10;

function getMaxStoriesForRoadWidth(roadWidthFt) {
  const width = Number(roadWidthFt) || 0;
  const match = ROAD_WIDTH_HEIGHT_TABLE.find((row) => width >= row.minWidth);
  return match ? match.maxStories : 3;
}

function getSetbackNotes(targetStories) {
  if (targetStories >= 11) {
    return "Front setback ≥ 8 ft, side ≥ 5 ft, rear ≥ 6 ft (typical high-rise band). Fire stairs and a dedicated fire-service access lane are mandatory above 10 storeys / 33 m.";
  }
  if (targetStories >= 7) {
    return `Front setback ≥ 6 ft, side ≥ 4 ft, rear ≥ 5 ft (typical mid-rise band). A lift is mandatory above ${LIFT_REQUIRED_ABOVE_STORIES} storeys.`;
  }
  return "Front setback ≥ 5 ft, side ≥ 3 ft, rear ≥ 4 ft (typical low-rise band).";
}

function getComplianceFlags({ roadWidthFt, targetStories }) {
  const flags = [];
  const width = Number(roadWidthFt) || 0;
  const stories = Number(targetStories) || 0;

  if (width < MIN_GATE_WIDTH_FT) {
    flags.push(
      `Plot entry/gate width below ${MIN_GATE_WIDTH_FT} ft typically blocks RAJUK plan approval outright — confirm actual gate width, not just road width.`
    );
  }
  if (width < MIN_DRIVEWAY_WIDTH_FT) {
    flags.push(`Internal driveway must be at least ${MIN_DRIVEWAY_WIDTH_FT} ft wide.`);
  }
  if (stories > LIFT_REQUIRED_ABOVE_STORIES) {
    flags.push(`A lift is mandatory for buildings above ${LIFT_REQUIRED_ABOVE_STORIES} storeys.`);
  }
  if (stories > FIRE_STAIRS_REQUIRED_ABOVE_STORIES) {
    flags.push(
      `Fire stairs and fire-service access are mandatory above ${FIRE_STAIRS_REQUIRED_ABOVE_STORIES} storeys or 33 m height.`
    );
  }
  return flags;
}

/**
 * Evaluates feasibility for the given form inputs and returns a structured
 * result the UI can render as a status card. This is a planning ESTIMATE —
 * see the file header for what it does and doesn't cover.
 */
export function evaluateFeasibility({ landArea, landUnit, roadWidth, region, targetStories }) {
  const maxAllowedStories = getMaxStoriesForRoadWidth(roadWidth);
  const target = Number(targetStories) || 0;

  let status = "Permissible";
  let statusColor = "success";
  let message = "";

  if (target > maxAllowedStories) {
    status = "Violates Guidelines";
    statusColor = "danger";
    message = `A ${target}-storey building typically exceeds what a ${roadWidth} ft road allows under ${region} planning guidance.`;
  } else if (target === maxAllowedStories) {
    status = "Conditional";
    statusColor = "warning";
    message = `A ${target}-storey building is at the upper limit for a ${roadWidth} ft road under ${region}. This needs LUC confirmation and structural/fire review.`;
  } else {
    message = `A ${target}-storey building is generally within range for a ${roadWidth} ft road under ${region} planning guidance.`;
  }

  const landInDecimal = landUnit === "katha" ? Number(landArea) * 3.6 : Number(landArea);
  let landNote = "";
  if (landInDecimal > 0 && landInDecimal < 3) {
    landNote =
      "Note: Plots under ~3 decimals often face stricter FAR/MGC and height restrictions regardless of road width.";
  }

  return {
    status,
    statusColor,
    message,
    maxRecommendedHeight: `${maxAllowedStories} storeys (estimate)`,
    setbackNotes: getSetbackNotes(target),
    landNote,
    complianceFlags: getComplianceFlags({ roadWidthFt: roadWidth, targetStories: target }),
  };
}
