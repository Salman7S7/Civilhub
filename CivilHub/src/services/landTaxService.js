// src/services/landTaxService.js
// -----------------------------------------------------------------------------
// Land Development Tax (ভূমি উন্নয়ন কর / খাজনা) & Holding Tax Calculator Engine
// Exact Bangladesh Ministry of Land (ldtax.gov.bd) standard model
// -----------------------------------------------------------------------------

export const UNITS = [
  { key: "katha", label: "Katha", badge: "KATHA", toDecimal: 1.65 },
  { key: "decimal", label: "Decimal", badge: "DECIMAL", toDecimal: 1.0 },
  { key: "sqft", label: "Sq", badge: "SQ. FT", toDecimal: 1 / 435.6 },
  { key: "bigha", label: "Bigha", badge: "BIGHA", toDecimal: 33.0 },
];

export const USAGE_TYPES = [
  { key: "residential", label: "Residential (আবাসিক)", title: "RESIDENTIAL" },
  { key: "commercial", label: "Commercial (বাণিজ্যিক)", title: "COMMERCIAL" },
  { key: "industrial", label: "Industrial (শিল্প)", title: "INDUSTRIAL" },
  { key: "agricultural", label: "Agricultural (কৃষি)", title: "AGRICULTURAL" },
];

export const REGIONS = [
  {
    key: "dhaka_ctg",
    title: "Dhaka / Ctg Metro (ক-শ্রেণি)",
    subtitle: "DNCC, DSCC, CCC, Gazipur & Narayanganj Metro",
    holdingRatio: 0.75,
    rates: {
      residential: 300,
      commercial: 1000,
      industrial: 800,
      agricultural: 2.0,
    },
  },
  {
    key: "other_city",
    title: "Other City Corp (খ-শ্রেণি)",
    subtitle: "Rajshahi, Khulna, Sylhet, Barishal, Rangpur, Cumilla, Mymensingh",
    holdingRatio: 0.6,
    rates: {
      residential: 150,
      commercial: 600,
      industrial: 450,
      agricultural: 1.5,
    },
  },
  {
    key: "municipality",
    title: "District / Municipality (পৌরসভা)",
    subtitle: "District Headquarters & Class-A/B Municipalities",
    holdingRatio: 0.5,
    rates: {
      residential: 60,
      commercial: 250,
      industrial: 180,
      agricultural: 1.0,
    },
  },
  {
    key: "rural",
    title: "Union Parishad / Rural (পল্লী এলাকা)",
    subtitle: "Rural Upazila & Union Parishad areas",
    holdingRatio: 0.25,
    rates: {
      residential: 15,
      commercial: 60,
      industrial: 40,
      agricultural: 0.5,
    },
  },
];

export const YEAR_OPTIONS = [1, 2, 3, 5];

export function computeLandTax({
  areaValue,
  unitKey = "katha",
  usageKey = "residential",
  regionKey = "dhaka_ctg",
  years = 1,
  includeHoldingTax = true,
}) {
  const numericArea = parseFloat(areaValue) || 0;
  if (numericArea <= 0) {
    throw new Error("Please enter a valid land area.");
  }

  const unit = UNITS.find((u) => u.key === unitKey) || UNITS[0];
  const usage = USAGE_TYPES.find((u) => u.key === usageKey) || USAGE_TYPES[0];
  const region = REGIONS.find((r) => r.key === regionKey) || REGIONS[0];

  const decimalArea = numericArea * unit.toDecimal;
  const ratePerDecimal = region.rates[usageKey] || 300;

  let annualBaseTax = 0;
  if (usageKey === "agricultural") {
    if (decimalArea <= 825) {
      // Up to 25 bighas base tax exemption
      annualBaseTax = Math.max(10, Math.round(decimalArea * 0.1));
    } else {
      annualBaseTax = Math.round(decimalArea * ratePerDecimal);
    }
  } else {
    annualBaseTax = Math.round(decimalArea * ratePerDecimal);
  }

  const validYears = Math.max(1, parseInt(years, 10) || 1);
  const totalBaseTax = annualBaseTax * validYears;

  let annualHoldingTax = 0;
  if (includeHoldingTax && usageKey !== "agricultural") {
    annualHoldingTax = Math.round(annualBaseTax * region.holdingRatio);
  } else if (includeHoldingTax && usageKey === "agricultural") {
    annualHoldingTax = 20; // Nominal rural holding tax
  }

  const totalHoldingTax = annualHoldingTax * validYears;

  // 6.25% surcharge for unpaid past years
  const surcharge = validYears > 1 ? Math.round(annualBaseTax * (validYears - 1) * 0.0625) : 0;

  const totalAmount = totalBaseTax + totalHoldingTax + surcharge;

  return {
    rawArea: numericArea,
    unitName: unit.label.toLowerCase(),
    unitBadge: unit.badge,
    decimalArea: parseFloat(decimalArea.toFixed(2)),
    kathaArea: parseFloat((decimalArea / 1.65).toFixed(2)),
    bighaArea: parseFloat((decimalArea / 33).toFixed(2)),
    usageTitle: usage.title,
    usageLabel: usage.label,
    regionTitle: region.title,
    ratePerDecimal,
    years: validYears,
    annualBaseTax,
    totalBaseTax,
    annualHoldingTax,
    totalHoldingTax,
    includeHoldingTax,
    surcharge,
    totalAmount,
  };
}
