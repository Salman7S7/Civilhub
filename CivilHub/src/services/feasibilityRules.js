// src/services/feasibilityRules.js
// -----------------------------------------------------------------------------
// Authority-Specific Feasibility Rules for Bangladesh Building Construction
//
// Governed by:
// 1. Bangladesh National Building Code (BNBC 2020) — National baseline gazetted
//    by the Ministry of Housing and Public Works (MoHPW), Government of Bangladesh.
// 2. Specific Development Authority Bylaws & Master Plans:
//    - RAJUK (Dhaka): Dhaka Mohanagar Imarat Nirman Bidhimala 2008 & DAP (2022–2035)
//    - CDA (Chattogram): Chattogram Imarat Nirman Bidhimala 2008 & CDA Master Plan
//    - KDA (Khulna): Khulna Development Authority Imarat Nirman Bidhimala & Master Plan
//    - RDA (Rajshahi): Rajshahi Development Authority Act 2018 & Building Bylaws
//    - Pourashava / Municipal: Pourashava Imarat Nirman Bidhimala & BNBC 2020
//
// ⚠️ DISCLAIMER:
// This calculation provides directional planning heuristics. Real permits require
// formal Land Use Clearance (LUC) / Plan Approval from the respective authority,
// soil investigation, and drawings signed by an IEB/IAB registered structural engineer
// and architect.
// -----------------------------------------------------------------------------

// National BNBC 2020 Baseline Constants (Applicable throughout Bangladesh)
export const BNBC_STANDARDS = {
  codeName: "Bangladesh National Building Code (BNBC 2020)",
  gazetteDate: "February 2021 (MoHPW)",
  liftMandatoryAboveStories: 6, // Part 3, Chapter 3: Mandatory for buildings > 6 storeys or height > 20m
  fireStairsMandatoryAboveStories: 10, // Part 4: Mandatory dual staircase & fire safety for height > 33m
  fireNocRequiredAboveStories: 6, // Fire Service & Civil Defence NOC mandatory
  soilTestMandatory: true, // Part 6: Mandatory geotechnical bore-hole testing for all RCC structures
};

// Authority-Specific Configuration & Bylaws
export const AUTHORITY_RULES = {
  RAJUK: {
    key: "RAJUK",
    shortName: "RAJUK",
    authorityName: "Rajdhani Unnayan Kartripakkha (RAJUK - Dhaka)",
    governingBylaw: "Dhaka Mohanagar Imarat Nirman Bidhimala 2008 & DAP (2022–2035)",
    officialPortal: "https://rajuk.gov.bd",
    minGateWidthFt: 18, // Dhaka rule: Plot entry width below 18 ft blocks plan sanction for multi-family
    minDrivewayWidthFt: 14,
    minRoadWidthForPermitFt: 12,
    roadWidthHeightTable: [
      { minWidth: 60, maxStories: 20, label: "60 ft+" },
      { minWidth: 40, maxStories: 14, label: "40–59 ft" },
      { minWidth: 25, maxStories: 10, label: "25–39 ft" },
      { minWidth: 20, maxStories: 7, label: "20–24 ft" },
      { minWidth: 18, maxStories: 6, label: "18–19 ft (min gate requirement)" },
      { minWidth: 12, maxStories: 4, label: "12–17 ft" },
      { minWidth: 0, maxStories: 3, label: "Under 12 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 5 ft (1.5m), side ≥ 3.3 ft (1m), rear ≥ 5 ft (1.5m) for up to 6 storeys.",
      midRise: "Front setback ≥ 6.5 ft (2.0m), side ≥ 4 ft (1.25m), rear ≥ 6.5 ft (2.0m). Dedicated driveway required.",
      highRise: "Front setback ≥ 8.2 ft (2.5m), side ≥ 5 ft (1.5m), rear ≥ 8.2 ft (2.5m). Fire tender access lane mandatory.",
    },
    localNotes: [
      "RAJUK DAP 2022–2035 enforces neighborhood-specific Floor Area Ratio (FAR) and height caps (e.g. Uttara, Gulshan, Nikunja vary).",
      "CAAB (Civil Aviation Authority) height clearance NOC is mandatory if within the flight funnel of Hazrat Shahjalal or Tejgaon airports.",
    ],
  },

  CDA: {
    key: "CDA",
    shortName: "CDA",
    authorityName: "Chattogram Development Authority (CDA - Chittagong)",
    governingBylaw: "Chattogram Imarat Nirman Bidhimala 2008 & CDA Master Plan",
    officialPortal: "https://www.cda.gov.bd",
    minGateWidthFt: 10, // CDA allows standard residential gate width of 10-12 ft
    minDrivewayWidthFt: 11,
    minRoadWidthForPermitFt: 12, // 3.75m public road minimum for multi-storey
    roadWidthHeightTable: [
      { minWidth: 50, maxStories: 18, label: "50 ft+" },
      { minWidth: 36, maxStories: 12, label: "36–49 ft" },
      { minWidth: 24, maxStories: 9, label: "24–35 ft" },
      { minWidth: 16, maxStories: 7, label: "16–23 ft" },
      { minWidth: 12, maxStories: 5, label: "12–15 ft (3.75m public access)" },
      { minWidth: 10, maxStories: 3, label: "10–11 ft (internal access only)" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 5 ft (1.5m), side ≥ 3.3 ft (1m), rear ≥ 5 ft (1.5m) (CDA 2008 residential band).",
      midRise: "Front setback ≥ 6 ft (1.8m), side ≥ 4 ft (1.2m), rear ≥ 6 ft (1.8m) under CDA guidelines.",
      highRise: "Front setback ≥ 8 ft (2.4m), side ≥ 5 ft (1.5m), rear ≥ 8 ft (2.4m) with dedicated fire engine corridor.",
    },
    localNotes: [
      "Strict Hill Cutting Prohibition: If the plot is on or within 50m of hilly terrain (Khulshi, Pahartali, Nasirabad, Bayezid), DoE (Dept. of Environment) and CDA slope stability NOC are legally mandatory.",
      "Coastal Salinity Zone: High durability sulphate-resistant cement and adequate concrete cover specified under CDA structural standards.",
    ],
  },

  KDA: {
    key: "KDA",
    shortName: "KDA",
    authorityName: "Khulna Development Authority (KDA - Khulna)",
    governingBylaw: "Khulna Development Authority Imarat Nirman Bidhimala & KDA Master Plan",
    officialPortal: "https://kda.gov.bd",
    minGateWidthFt: 10, // KDA residential plots do NOT require the 18 ft Dhaka gate
    minDrivewayWidthFt: 10,
    minRoadWidthForPermitFt: 10, // 3.0m minimum road width for residential sanction
    roadWidthHeightTable: [
      { minWidth: 45, maxStories: 16, label: "45 ft+" },
      { minWidth: 33, maxStories: 11, label: "33–44 ft" },
      { minWidth: 23, maxStories: 8, label: "23–32 ft" },
      { minWidth: 16, maxStories: 7, label: "16–22 ft" },
      { minWidth: 10, maxStories: 4, label: "10–15 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 5 ft (1.5m), side ≥ 3.3 ft (1m), rear ≥ 5 ft (1.5m) under KDA building rules.",
      midRise: "Front setback ≥ 6 ft (1.8m), side ≥ 4 ft (1.2m), rear ≥ 6 ft (1.8m) for 6–8 storeys.",
      highRise: "Front setback ≥ 8 ft (2.4m), side ≥ 5 ft (1.5m), rear ≥ 7 ft (2.1m) under KDA high-rise provisions.",
    },
    localNotes: [
      "Soft Deltaic Alluvial Soil & Saline Water Table: Rigorous borehole soil testing and engineered pile foundations are mandatory for 4+ storeys in Khulna.",
      "Rupsha/Bhairab Drainage Corridors: KDA conservancy and watercourse setback clearances apply to plots near Khulna natural canals (khals).",
    ],
  },

  RDA: {
    key: "RDA",
    shortName: "RDA",
    authorityName: "Rajshahi Development Authority (RDA - Rajshahi)",
    governingBylaw: "Rajshahi Development Authority Act 2018 & Building Regulations",
    officialPortal: "http://rdarajshahi.gov.bd",
    minGateWidthFt: 10,
    minDrivewayWidthFt: 10,
    minRoadWidthForPermitFt: 10,
    roadWidthHeightTable: [
      { minWidth: 45, maxStories: 16, label: "45 ft+" },
      { minWidth: 31, maxStories: 11, label: "31–44 ft" },
      { minWidth: 22, maxStories: 8, label: "22–30 ft" },
      { minWidth: 15, maxStories: 6, label: "15–21 ft" },
      { minWidth: 10, maxStories: 4, label: "10–14 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 5 ft (1.5m), side ≥ 3.3 ft (1m), rear ≥ 5 ft (1.5m) (RDA standard residential band).",
      midRise: "Front setback ≥ 6 ft (1.8m), side ≥ 4 ft (1.2m), rear ≥ 6 ft (1.8m) under RDA light-angle provisions.",
      highRise: "Front setback ≥ 8 ft (2.4m), side ≥ 5 ft (1.5m), rear ≥ 7 ft (2.1m) under RDA master plan.",
    },
    localNotes: [
      "Padma River Embankment & Flood Protection Buffer: Strict non-encroachment setback applies to plots within the Padma river defense embankment zone.",
      "Barind Tract Red Clay Soil: Foundation designs must account for soil moisture shrinkage and expansion characteristics common in the Rajshahi Barind region.",
    ],
  },

  General: {
    key: "General",
    shortName: "General / Pourashava",
    authorityName: "General Municipal / Pourashava Jurisdiction",
    governingBylaw: "Pourashava Imarat Nirman Bidhimala & BNBC 2020",
    officialPortal: "http://www.lged.gov.bd",
    minGateWidthFt: 10,
    minDrivewayWidthFt: 10,
    minRoadWidthForPermitFt: 10,
    roadWidthHeightTable: [
      { minWidth: 40, maxStories: 10, label: "40 ft+" },
      { minWidth: 25, maxStories: 7, label: "25–39 ft" },
      { minWidth: 16, maxStories: 5, label: "16–24 ft" },
      { minWidth: 10, maxStories: 4, label: "10–15 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 5 ft, side ≥ 3.3 ft, rear ≥ 5 ft under standard Pourashava bylaws.",
      midRise: "Front setback ≥ 6 ft, side ≥ 4 ft, rear ≥ 6 ft under BNBC guidelines.",
      highRise: "Front setback ≥ 8 ft, side ≥ 5 ft, rear ≥ 7 ft.",
    },
    localNotes: [
      "Approval is granted by the local Pourashava Building Committee or District Administration.",
      "Must strictly comply with BNBC 2020 national safety standards for lift, fire safety, and structural engineering.",
    ],
  },
};

/**
 * Normalizes user input region strings (e.g. "KDA - Khulna", "KDA", "rajuk") to canonical key.
 */
export function resolveAuthority(regionInput) {
  if (!regionInput) return AUTHORITY_RULES.RAJUK;
  const upper = String(regionInput).toUpperCase();
  if (upper.includes("CDA") || upper.includes("CHITTAGONG") || upper.includes("CHATTOGRAM")) {
    return AUTHORITY_RULES.CDA;
  }
  if (upper.includes("KDA") || upper.includes("KHULNA")) {
    return AUTHORITY_RULES.KDA;
  }
  if (upper.includes("RDA") || upper.includes("RAJSHAHI")) {
    return AUTHORITY_RULES.RDA;
  }
  if (upper.includes("MUNICIPAL") || upper.includes("POURASHAVA") || upper.includes("GENERAL")) {
    return AUTHORITY_RULES.General;
  }
  return AUTHORITY_RULES.RAJUK;
}

/**
 * Looks up maximum allowable storeys based on road width under the specific authority's table.
 */
export function getMaxStoriesForAuthority(authority, roadWidthFt) {
  const width = Number(roadWidthFt) || 0;
  const table = authority.roadWidthHeightTable || AUTHORITY_RULES.RAJUK.roadWidthHeightTable;
  const match = table.find((row) => width >= row.minWidth);
  return match ? match.maxStories : 2;
}

/**
 * Returns setback notes corresponding to target height under authority guidelines.
 */
export function getAuthoritySetbackNotes(authority, targetStories) {
  const stories = Number(targetStories) || 0;
  if (stories >= 11) {
    return authority.setbacks.highRise;
  }
  if (stories >= 7) {
    return `${authority.setbacks.midRise} A lift is mandatory above ${BNBC_STANDARDS.liftMandatoryAboveStories} storeys under BNBC.`;
  }
  return authority.setbacks.lowRise;
}

/**
 * Evaluates authority-specific & national compliance flags.
 */
export function getComplianceFlags({ authority, roadWidthFt, targetStories }) {
  const flags = [];
  const width = Number(roadWidthFt) || 0;
  const stories = Number(targetStories) || 0;

  // 1. Road & Gate Access Checks
  if (width < authority.minRoadWidthForPermitFt) {
    flags.push(
      `Access road width (${width} ft) is below the recommended minimum (${authority.minRoadWidthForPermitFt} ft) for multi-storey plan approval under ${authority.shortName}.`
    );
  }

  if (authority.key === "RAJUK" && width < authority.minGateWidthFt) {
    flags.push(
      `RAJUK Dhaka Rule: Plot entry/gate frontage under ${authority.minGateWidthFt} ft blocks building plan sanction for multi-family residential.`
    );
  } else if (width < authority.minGateWidthFt) {
    flags.push(
      `${authority.shortName} standard requires minimum ${authority.minGateWidthFt} ft vehicle gate access.`
    );
  }

  // 2. BNBC 2020 Nationwide Baseline Checks
  if (stories > BNBC_STANDARDS.liftMandatoryAboveStories) {
    flags.push(
      `BNBC 2020 National Rule: A passenger lift is mandatory for all buildings exceeding ${BNBC_STANDARDS.liftMandatoryAboveStories} storeys or 20 m height.`
    );
  }

  if (stories > BNBC_STANDARDS.fireStairsMandatoryAboveStories) {
    flags.push(
      `BNBC 2020 National Rule: Fire stairs, emergency exits, and dedicated fire-fighting vehicle access are legally mandatory above ${BNBC_STANDARDS.fireStairsMandatoryAboveStories} storeys / 33 m height.`
    );
  }

  if (stories > BNBC_STANDARDS.fireNocRequiredAboveStories) {
    flags.push(
      `Fire Service & Civil Defence NOC clearance required prior to construction commencement.`
    );
  }

  // 3. Local Authority Geographic / Terrain Flags
  if (authority.localNotes && authority.localNotes.length > 0) {
    authority.localNotes.forEach((note) => {
      flags.push(`Local ${authority.shortName} Bylaw: ${note}`);
    });
  }

  return flags;
}

/**
 * Evaluates feasibility for the given form inputs against BD Government & Authority rules.
 */
export function evaluateFeasibility({ landArea, landUnit, roadWidth, region, targetStories }) {
  const authority = resolveAuthority(region);
  const roadWidthNum = Number(roadWidth) || 0;
  const target = Number(targetStories) || 0;
  const maxAllowedStories = getMaxStoriesForAuthority(authority, roadWidthNum);

  let status = "Permissible";
  let statusColor = "success";
  let message = "";

  if (target > maxAllowedStories) {
    status = "Violates Guidelines";
    statusColor = "danger";
    message = `A ${target}-storey building exceeds the typical allowable height (${maxAllowedStories} storeys) for a ${roadWidthNum} ft road under ${authority.authorityName}.`;
  } else if (target === maxAllowedStories) {
    status = "Conditional";
    statusColor = "warning";
    message = `A ${target}-storey building is at the upper threshold for a ${roadWidthNum} ft road under ${authority.shortName}. Approval requires strict LUC verification, FAR calculation, and structural/fire safety sign-off.`;
  } else {
    message = `A ${target}-storey building is generally permissible for a ${roadWidthNum} ft road under ${authority.shortName} planning bylaws.`;
  }

  const landInDecimal = landUnit === "katha" ? Number(landArea) * 1.65 : Number(landArea);
  let landNote = "";
  if (landInDecimal > 0 && landInDecimal < 3) {
    landNote =
      "Note: Plots under ~3 decimals are classified as small plots and may be subject to restricted ground coverage (MGC) and heightened setback ratios.";
  }

  return {
    status,
    statusColor,
    message,
    maxRecommendedHeight: `${maxAllowedStories} storeys (estimate)`,
    setbackNotes: getAuthoritySetbackNotes(authority, target),
    landNote,
    complianceFlags: getComplianceFlags({ authority, roadWidthFt: roadWidthNum, targetStories: target }),
    authority: {
      key: authority.key,
      shortName: authority.shortName,
      authorityName: authority.authorityName,
      governingBylaw: authority.governingBylaw,
      officialPortal: authority.officialPortal,
      baselineCode: BNBC_STANDARDS.codeName,
    },
  };
}
