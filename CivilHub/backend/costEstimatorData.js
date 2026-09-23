// Bangladesh Standard (BNBC / RAJUK) Construction Cost & Land Rules Data

// RAJUK Max Ground Coverage (MGC) rules by plot size (in Katha)
export const RAJUK_GROUND_COVERAGE_RULES = [
  { minKatha: 0, maxKatha: 2, maxMGCPercent: 67.5, description: "Up to 2 Katha" },
  { minKatha: 2, maxKatha: 3, maxMGCPercent: 65.0, description: "2 to 3 Katha" },
  { minKatha: 3, maxKatha: 5, maxMGCPercent: 62.5, description: "3 to 5 Katha" },
  { minKatha: 5, maxKatha: 10, maxMGCPercent: 60.0, description: "5 to 10 Katha" },
  { minKatha: 10, maxKatha: 999, maxMGCPercent: 50.0, description: "Above 10 Katha" },
];

// Standard Cost per Sq Ft in Bangladesh (BDT) based on quality
export const BD_CONSTRUCTION_RATES = {
  basic: {
    ratePerSqFt: 1800,
    label: "Basic / Low-Cost",
    description: "Standard local materials, basic tiles, standard sanitary fittings.",
  },
  standard: {
    ratePerSqFt: 2400,
    label: "Standard Quality",
    description: "Good quality brand cement, rebar, 24x24 tiles, modern fittings.",
  },
  premium: {
    ratePerSqFt: 3200,
    label: "Premium / Luxury",
    description: "High-end imported/brand materials, luxury sanitary, premium finishes.",
  },
};

// Cost percentage breakdown based on standard Bangladesh/RAJUK building practice
export const BD_COST_BREAKDOWN_PERCENTAGES = [
  {
    category: "Civil & Structural Works",
    percentage: 45,
    description: "Soil test, piling, foundation, RCC columns, beams, slabs, brickwork.",
    rajukNote: "Based on BNBC structural safety and RAJUK RCC design norms.",
  },
  {
    category: "Finishing Works",
    percentage: 25,
    description: "Plaster, floor/wall tiles, painting, doors, windows, glass.",
    rajukNote: "Standard interior & exterior finishing allowance.",
  },
  {
    category: "Electrical System",
    percentage: 10,
    description: "Concealed wiring, switchboards, circuit breakers, light fixtures, earthing.",
    rajukNote: "Compliant with BNBC electrical safety codes.",
  },
  {
    category: "Plumbing & Sanitary Works",
    percentage: 10,
    description: "Pipes, water supply, sewage, bathroom fittings, overhead & underground tank.",
    rajukNote: "Standard WASA & BNBC sanitation guidelines.",
  },
  {
    category: "RAJUK Approval & Design Fees",
    percentage: 5,
    description: "Architectural plan, structural design, RAJUK/Municipality approval fees, vetting.",
    rajukNote: "Mandatory RAJUK approval & engineering consultancy allowance.",
  },
  {
    category: "Contingency & Miscellaneous",
    percentage: 5,
    description: "Labor safety, site management, unexpected price fluctuations.",
    rajukNote: "Recommended buffer for construction management.",
  },
];

// Average Room Dimensions (Sq Ft) for detailed estimation
export const AVERAGE_ROOM_SIZES = {
  bedroom: 140, // 12ft x 11.5ft
  masterBedroom: 180, // 14ft x 13ft
  bathroom: 42, // 6ft x 7ft
  kitchen: 70, // 7ft x 10ft
  livingRoom: 200, // 14ft x 14ft
  diningRoom: 140, // 12ft x 11.5ft
  balcony: 35, // 5ft x 7ft
  corridorStairs: 150, // Common circulation & stairs per floor
};