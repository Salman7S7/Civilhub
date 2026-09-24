// backend/bnbcExpertEngine.js
// -----------------------------------------------------------------------------
// CivilHub BNBC 2020 & Bangladesh Civil Engineering Expert Engine
//
// Governed by:
// - Bangladesh National Building Code (BNBC 2020)
// - RAJUK: Dhaka Mohanagar Imarat Nirman Bidhimala 2008 & DAP (2022–2035)
// - CDA: Chattogram Imarat Nirman Bidhimala 2008 & CDA Master Plan
// - KDA: Khulna Development Authority Imarat Nirman Bidhimala & Master Plan
// - RDA: Rajshahi Development Authority Act 2018 & Building Regulations
// - General Municipal / Pourashava Imarat Nirman Bidhimala
// -----------------------------------------------------------------------------

const AUTHORITY_TABLES = {
  RAJUK: {
    name: "RAJUK (Rajdhani Unnayan Kartripakkha - Dhaka)",
    bylaw: "Dhaka Mohanagar Imarat Nirman Bidhimala 2008 & DAP (2022–2035)",
    minRoadWidthForPermit: 12,
    minGateWidth: 18,
    roadWidthHeightTable: [
      { minWidth: 60, maxStories: 20, label: "60 ft+" },
      { minWidth: 40, maxStories: 14, label: "40–59 ft" },
      { minWidth: 25, maxStories: 10, label: "25–39 ft" },
      { minWidth: 20, maxStories: 7, label: "20–24 ft" },
      { minWidth: 18, maxStories: 6, label: "18–19 ft" },
      { minWidth: 12, maxStories: 4, label: "12–17 ft" },
      { minWidth: 0, maxStories: 3, label: "Under 12 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 1.5m (5.0 ft), Rear setback ≥ 1.5m (5.0 ft), Side setbacks ≥ 1.0m (3.3 ft) on each side.",
      midRise: "Front setback ≥ 2.0m (6.5 ft), Rear setback ≥ 2.0m (6.5 ft), Side setbacks ≥ 1.25m (4.1 ft).",
      highRise: "Front setback ≥ 2.5m (8.2 ft), Rear setback ≥ 2.5m (8.2 ft), Side setbacks ≥ 1.5m (5.0 ft). Fire tender access lane mandatory.",
    },
  },
  CDA: {
    name: "CDA (Chattogram Development Authority)",
    bylaw: "Chattogram Imarat Nirman Bidhimala 2008 & CDA Master Plan",
    minRoadWidthForPermit: 12,
    minGateWidth: 10,
    roadWidthHeightTable: [
      { minWidth: 50, maxStories: 18, label: "50 ft+" },
      { minWidth: 36, maxStories: 12, label: "36–49 ft" },
      { minWidth: 24, maxStories: 9, label: "24–35 ft" },
      { minWidth: 16, maxStories: 7, label: "16–23 ft" },
      { minWidth: 12, maxStories: 5, label: "12–15 ft" },
      { minWidth: 10, maxStories: 3, label: "10–11 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 1.5m (5.0 ft), Rear setback ≥ 1.5m (5.0 ft), Side setbacks ≥ 1.0m (3.3 ft).",
      midRise: "Front setback ≥ 1.8m (6.0 ft), Rear setback ≥ 1.8m (6.0 ft), Side setbacks ≥ 1.2m (4.0 ft).",
      highRise: "Front setback ≥ 2.4m (8.0 ft), Rear setback ≥ 2.4m (8.0 ft), Side setbacks ≥ 1.5m (5.0 ft).",
    },
  },
  KDA: {
    name: "KDA (Khulna Development Authority)",
    bylaw: "Khulna Development Authority Imarat Nirman Bidhimala & Master Plan",
    minRoadWidthForPermit: 10,
    minGateWidth: 10,
    roadWidthHeightTable: [
      { minWidth: 45, maxStories: 16, label: "45 ft+" },
      { minWidth: 33, maxStories: 11, label: "33–44 ft" },
      { minWidth: 23, maxStories: 8, label: "23–32 ft" },
      { minWidth: 16, maxStories: 7, label: "16–22 ft" },
      { minWidth: 10, maxStories: 4, label: "10–15 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 1.5m (5.0 ft), Rear setback ≥ 1.5m (5.0 ft), Side setbacks ≥ 1.0m (3.3 ft).",
      midRise: "Front setback ≥ 1.8m (6.0 ft), Rear setback ≥ 1.8m (6.0 ft), Side setbacks ≥ 1.2m (4.0 ft).",
      highRise: "Front setback ≥ 2.4m (8.0 ft), Rear setback ≥ 2.1m (7.0 ft), Side setbacks ≥ 1.5m (5.0 ft).",
    },
  },
  RDA: {
    name: "RDA (Rajshahi Development Authority)",
    bylaw: "Rajshahi Development Authority Act 2018 & Building Regulations",
    minRoadWidthForPermit: 10,
    minGateWidth: 10,
    roadWidthHeightTable: [
      { minWidth: 45, maxStories: 16, label: "45 ft+" },
      { minWidth: 31, maxStories: 11, label: "31–44 ft" },
      { minWidth: 22, maxStories: 8, label: "22–30 ft" },
      { minWidth: 15, maxStories: 6, label: "15–21 ft" },
      { minWidth: 10, maxStories: 4, label: "10–14 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 1.5m (5.0 ft), Rear setback ≥ 1.5m (5.0 ft), Side setbacks ≥ 1.0m (3.3 ft).",
      midRise: "Front setback ≥ 1.8m (6.0 ft), Rear setback ≥ 1.8m (6.0 ft), Side setbacks ≥ 1.2m (4.0 ft).",
      highRise: "Front setback ≥ 2.4m (8.0 ft), Rear setback ≥ 2.1m (7.0 ft), Side setbacks ≥ 1.5m (5.0 ft).",
    },
  },
  General: {
    name: "General Municipal / Pourashava",
    bylaw: "Pourashava Imarat Nirman Bidhimala & BNBC 2020 Baseline",
    minRoadWidthForPermit: 10,
    minGateWidth: 10,
    roadWidthHeightTable: [
      { minWidth: 40, maxStories: 10, label: "40 ft+" },
      { minWidth: 25, maxStories: 7, label: "25–39 ft" },
      { minWidth: 16, maxStories: 5, label: "16–24 ft" },
      { minWidth: 10, maxStories: 4, label: "10–15 ft" },
      { minWidth: 0, maxStories: 2, label: "Under 10 ft" },
    ],
    setbacks: {
      lowRise: "Front setback ≥ 1.5m (5.0 ft), Rear setback ≥ 1.5m (5.0 ft), Side setbacks ≥ 1.0m (3.3 ft).",
      midRise: "Front setback ≥ 1.8m (6.0 ft), Rear setback ≥ 1.8m (6.0 ft), Side setbacks ≥ 1.2m (4.0 ft).",
      highRise: "Front setback ≥ 2.4m (8.0 ft), Rear setback ≥ 2.1m (7.0 ft), Side setbacks ≥ 1.5m (5.0 ft).",
    },
  },
};

const DISCLAIMER = "\n\n*Disclaimer: Final approval depends on the relevant development authority (RAJUK/CDA/RDA/KDA) and formal review by an IEB-licensed structural engineer and IAB architect.*";

/**
 * Extract numerical targets from query text
 */
function extractQueryEntities(text, context = null) {
  const lower = text.toLowerCase();

  // Extract authority
  let authorityKey = context?.authority ? context.authority.toUpperCase() : null;
  if (!authorityKey || !AUTHORITY_TABLES[authorityKey]) {
    if (lower.includes("cda") || lower.includes("chattogram") || lower.includes("chittagong")) authorityKey = "CDA";
    else if (lower.includes("kda") || lower.includes("khulna")) authorityKey = "KDA";
    else if (lower.includes("rda") || lower.includes("rajshahi")) authorityKey = "RDA";
    else if (lower.includes("pourashava") || lower.includes("municipal")) authorityKey = "General";
    else authorityKey = "RAJUK"; // default to RAJUK (Dhaka)
  }

  // Extract stories
  let stories = context?.floors || null;
  const storyMatch = lower.match(/(\d+)\s*[-–—]?\s*(?:story|stories|storied|floor|floors|tola)/);
  if (storyMatch) stories = parseInt(storyMatch[1], 10);

  // Extract road width
  let roadWidth = context?.roadWidth || null;
  const roadMatch = lower.match(/(\d+(?:\.\d+)?)\s*[-–—]?\s*(?:ft|feet|foot|meter|m)\b\s*(?:wide|road|frontage|access)?/) ||
                     lower.match(/(?:road|frontage|access)\s*(?:of|is|width)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*[-–—]?\s*(?:ft|feet|foot)?/);
  if (roadMatch) {
    let val = parseFloat(roadMatch[1]);
    if (lower.includes("meter") || lower.includes(" m ")) val = Math.round(val * 3.28084);
    roadWidth = val;
  }

  // Extract plot size
  let katha = context?.katha || null;
  const kathaMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:katha|kattha|cottah)/);
  if (kathaMatch) katha = parseFloat(kathaMatch[1]);

  return { authorityKey, stories, roadWidth, katha, lower };
}

/**
 * Generate authoritative response for building code and civil engineering queries
 */
function generateBnbcExpertAnswer(question, context = null) {
  if (!question || !String(question).trim()) {
    return "Please enter a specific question about Bangladesh building regulations, BNBC 2020, FAR, or setbacks." + DISCLAIMER;
  }

  const trimmed = question.trim();
  const cleanLower = trimmed.toLowerCase().replace(/[?!.,;:~]/g, "").trim();

  // 0a. Greetings & Casual Queries
  const isGreeting = /^(hi|hello|hey|heyy|heya|hiya|assalamu\s*alaikum|salam|namaste|good\s*(?:morning|afternoon|evening|day))$/i.test(cleanLower);
  if (isGreeting) {
    return (
      `Hello! 👋 I am your **CivilHub AI Assistant**, specializing in the Bangladesh National Building Code (BNBC 2020) and municipal development rules.\n\n` +
      `Here are some topics you can ask me about:\n` +
      `- **Permissible Height & Road Width**: e.g., *"Can I build 7 stories on a 20ft road under RAJUK?"*\n` +
      `- **Mandatory Setbacks**: e.g., *"What is the mandatory FAR setback rule?"*\n` +
      `- **Road Requirements**: e.g., *"Minimum road width for a 10-story building?"*\n` +
      `- **Soil & Foundation**: e.g., *"When is soil SPT testing mandatory under BNBC 2020?"*\n` +
      `- **Plot Coverage**: e.g., *"What is the maximum ground coverage (MGC) for residential?"*\n` +
      `- **Authority Bylaws**: Specific rules for RAJUK (Dhaka), CDA (Chattogram), KDA (Khulna), or RDA (Rajshahi).\n\n` +
      `How can I assist your construction planning today?`
    );
  }

  // 0b. Thanks / Appreciation
  const isThanks = /^(thanks|thank\s*you|thx|ty|dhonnobad|many\s*thanks)$/i.test(cleanLower) || (cleanLower.includes("thank") && !cleanLower.includes("road") && !cleanLower.includes("story") && !cleanLower.includes("far"));
  if (isThanks) {
    return (
      `You're very welcome! 😊\n\n` +
      `If you have any further questions about setback clearances, structural codes, or municipal permits, feel free to ask anytime.\n\n` +
      `*Tip: If you need signed submission drawings or official plan endorsements, you can also consult our licensed professionals in the **"Chat with Human Expert"** tab.*`
    );
  }

  // 0c. Capability / Identity
  const isHelpOrIdentity = /^(who\s*are\s*you|what\s*can\s*you\s*do|help|how\s*to\s*use|features)$/i.test(cleanLower);
  if (isHelpOrIdentity) {
    return (
      `I am the **CivilHub AI Building Code Consultant**, designed to provide instant answers on Bangladesh construction bylaws.\n\n` +
      `### What I Can Do:\n` +
      `1. **Check Permissible Stories**: Tell me your road width and desired story count.\n` +
      `2. **Explain BNBC 2020**: Inquire about soil test (SPT), mandatory passenger lifts, fire staircases, and seismic detailing.\n` +
      `3. **Setbacks & FAR**: Calculate required front, rear, and side setback buffers.\n` +
      `4. **Regional Authorities**: Compare RAJUK (Dhaka), CDA (Chattogram), KDA (Khulna), and RDA (Rajshahi) requirements.\n\n` +
      `Try asking: *"What is the minimum road width for a 10-story building in Dhaka?"*`
    );
  }

  const { authorityKey, stories, roadWidth, katha, lower } = extractQueryEntities(question, context);
  const authority = AUTHORITY_TABLES[authorityKey] || AUTHORITY_TABLES.RAJUK;

  // 1. Specific Query: Road width vs Stories (e.g., "Can I build 7 stories on a 20ft road under RAJUK?")
  if (stories && roadWidth) {
    const table = authority.roadWidthHeightTable;
    const match = table.find((row) => roadWidth >= row.minWidth);
    const maxStoriesAllowed = match ? match.maxStories : 2;
    const isPermissible = stories <= maxStoriesAllowed;
    const isThreshold = stories === maxStoriesAllowed;

    let verdict = "";
    if (isPermissible) {
      verdict = isThreshold
        ? `**Yes, conditionally.** Under ${authority.name}, a **${roadWidth} ft road permits up to ${maxStoriesAllowed} stories** (${stories} stories is at the allowable limit).`
        : `**Yes, permissible.** Under ${authority.name}, a **${roadWidth} ft road permits up to ${maxStoriesAllowed} stories** (your proposal of ${stories} stories is within guidelines).`;
    } else {
      verdict = `**No, this exceeds typical limits.** Under ${authority.name}, a **${roadWidth} ft road permits a maximum of ${maxStoriesAllowed} stories** (your proposal of ${stories} stories exceeds the threshold).`;
    }

    const setbackText = stories >= 11
      ? authority.setbacks.highRise
      : stories >= 7
      ? authority.setbacks.midRise
      : authority.setbacks.lowRise;

    let bnbcNotes = [];
    if (stories > 6) {
      bnbcNotes.push("- **Mandatory Lift**: BNBC 2020 (Part 3, Chapter 3) mandates at least one passenger elevator for all buildings exceeding 6 stories or 20 meters height.");
      bnbcNotes.push("- **Fire Service NOC**: Prior clearance from the Bangladesh Fire Service & Civil Defence is mandatory.");
    }
    if (stories >= 10) {
      bnbcNotes.push("- **Dual Fire Stairs**: BNBC 2020 (Part 4) mandates an enclosed, pressurized emergency fire escape staircase in addition to the main stair.");
    }
    if (authorityKey === "RAJUK") {
      bnbcNotes.push(`- **Dhaka Entry Gate Width**: Plot frontage gate must be minimum **${authority.minGateWidth} ft** for multi-family residential plan approval.`);
    }

    return (
      `### Regulatory Evaluation: ${stories} Stories on ${roadWidth} ft Road\n\n` +
      `${verdict}\n\n` +
      `#### Authority Road-Width Limits (${authority.name}):\n` +
      table.map((row) => `- **${row.label} road**: Maximum **${row.maxStories} stories**`).join("\n") +
      `\n\n#### Mandatory Setbacks for ${stories} Stories:\n` +
      `- ${setbackText}\n\n` +
      (bnbcNotes.length > 0 ? `#### Mandatory BNBC 2020 Compliance:\n${bnbcNotes.join("\n")}\n\n` : "") +
      `#### Key Approvals Required:\n` +
      `- Land Use Clearance (LUC) & Plan Sanction from ${authorityKey}.\n` +
      `- Geotechnical bore-hole soil investigation report (minimum 3 boreholes).\n` +
      `- Structural analysis with ETABS/SAP2000 compliant with BNBC 2020 Seismic Zone requirements.` +
      DISCLAIMER
    );
  }

  // 2. Specific Query: Minimum road width for N stories (e.g., "Minimum road width for a 10-story building?")
  if (stories && (lower.includes("minimum road") || lower.includes("road width") || lower.includes("road required") || lower.includes("how much road"))) {
    const findMinRoad = (auth) => {
      const reversed = [...auth.roadWidthHeightTable].reverse();
      const match = reversed.find((row) => row.maxStories >= stories);
      return match ? `${match.minWidth} ft` : "60 ft+";
    };

    const rajukMin = findMinRoad(AUTHORITY_TABLES.RAJUK);
    const cdaMin = findMinRoad(AUTHORITY_TABLES.CDA);
    const kdaMin = findMinRoad(AUTHORITY_TABLES.KDA);
    const rdaMin = findMinRoad(AUTHORITY_TABLES.RDA);
    const genMin = findMinRoad(AUTHORITY_TABLES.General);

    return (
      `### Minimum Road Width for a ${stories}-Story Building\n\n` +
      `Under Bangladeshi urban planning bylaws and BNBC 2020 guidelines, the minimum frontage road width required for a **${stories}-story building** varies by jurisdiction:\n\n` +
      `- **RAJUK (Dhaka)**: **${rajukMin}** (Permits 10 stories on 25–39 ft roads; 40 ft+ allows up to 14 stories under DAP 2022–2035).\n` +
      `- **CDA (Chattogram)**: **${cdaMin}** (Chattogram Imarat Nirman Bidhimala requires 36 ft+ for 10–12 stories).\n` +
      `- **KDA (Khulna)**: **${kdaMin}** (KDA master plan requires 33 ft+ for 9–11 stories).\n` +
      `- **RDA (Rajshahi)**: **${rdaMin}** (RDA building rules require 31 ft+ for 9–11 stories).\n` +
      `- **General Pourashava / Municipal**: **${genMin}** (40 ft+ recommended for 10 stories).\n\n` +
      `#### Mandatory Statutory Requirements for a ${stories}-Story Building:\n` +
      `- **Dual Fire Exit Staircases**: BNBC 2020 Part 4 mandates two separate exit stairways (one pressurized fire-rated stair) for buildings 10 stories / 33m or taller.\n` +
      `- **Passenger Lift**: Legally mandatory (BNBC Part 3, Chapter 3 requires passenger elevator for > 6 stories; dual lifts recommended for 10 stories).\n` +
      `- **Fire Fighting Equipment**: Dedicated underground water reservoir (min 25,000–50,000 gal), automated wet riser, and yard hydrant.\n` +
      `- **Gate & Driveway**: Minimum 18 ft plot access gate and 14 ft internal driveway for emergency fire tender circulation (RAJUK).\n` +
      `- **Soil Investigation**: Minimum 3 to 5 boreholes down to 80–100 ft with SPT testing.` +
      DISCLAIMER
    );
  }

  // 3. Soil Testing & SPT Queries (e.g., "When is soil SPT testing mandatory under BNBC 2020?")
  if (lower.includes("soil") || lower.includes("spt") || lower.includes("borehole") || lower.includes("bearing capacity") || lower.includes("geotechnical") || lower.includes("pile") || lower.includes("piling")) {
    return (
      `### Geotechnical Soil Investigation & SPT Rules (BNBC 2020 Part 6)\n\n` +
      `Under **BNBC 2020 (Part 6, Chapter 3 - Soils and Foundations)**, subsoil investigation is legally mandatory for construction across Bangladesh.\n\n` +
      `#### 1. When is Soil Testing Mandatory?\n` +
      `- **All RCC framed multi-story structures** (mandatory for any building exceeding 2 stories).\n` +
      `- Any building with a **basement floor** or semi-basement.\n` +
      `- Any structure located near river embankments, coastal salinity zones (CDA/KDA), or soft alluvial depressions.\n\n` +
      `#### 2. Borehole Count & Depth Guidelines:\n` +
      `- **Up to 5 Katha**: Minimum **3 boreholes** placed diagonally and at key column locations.\n` +
      `- **5 to 10 Katha**: Minimum **4 to 5 boreholes**.\n` +
      `- **Drilling Depth**: Minimum **60 to 100 ft** (or 5m into hard stratum with SPT N > 30).\n` +
      `- **Test Interval**: Standard Penetration Test (SPT) conducted every **5 ft (1.5m)** depth.\n\n` +
      `#### 3. Interpretation of SPT N-Values:\n` +
      `- **N = 0 to 4 (Very Soft/Loose)**: High liquefaction risk; shallow footings strictly unsafe; cast-in-situ bored piles required.\n` +
      `- **N = 5 to 10 (Soft to Medium)**: Safe bearing capacity ~0.6–1.0 tsf; mat/raft footing or piles required for 5+ stories.\n` +
      `- **N = 11 to 20 (Medium Stiff/Dense)**: Safe bearing capacity ~1.2–1.8 tsf; isolated or strip footings feasible for low-rise; mat foundation for mid-rise.\n` +
      `- **N > 25–30 (Dense Sand/Hard Clay)**: High bearing capacity (> 2.5 tsf); ideal terminating depth for pile tips.\n\n` +
      `#### 4. Mandatory Laboratory Tests:\n` +
      `- Grain size distribution (sieve and hydrometer analysis).\n` +
      `- Atterberg Limits (Liquid Limit, Plastic Limit, Plasticity Index).\n` +
      `- Direct Shear & Unconfined Compressive Strength (UCC).\n` +
      `- Consolidation test (e-log p curve for settlement calculation).` +
      DISCLAIMER
    );
  }

  // 4. Maximum Ground Coverage (MGC) Queries
  if (lower.includes("mgc") || lower.includes("ground coverage") || lower.includes("open space") || lower.includes("permeab")) {
    return (
      `### Maximum Ground Coverage (MGC) Rules (BNBC 2020 & RAJUK)\n\n` +
      `**Maximum Ground Coverage (MGC)** defines the maximum footprint percentage of the plot that a building can occupy at ground level.\n\n` +
      `#### Residential MGC Schedule by Plot Size:\n` +
      `| Plot Size | Max Ground Coverage (MGC) | Mandatory Open Space |\n` +
      `|---|---|---|\n` +
      `| **Up to 2 Katha** (≤ 134 sqm) | **67.5%** | **32.5%** |\n` +
      `| **2 to 3 Katha** (134–201 sqm) | **65.0%** | **35.0%** |\n` +
      `| **3 to 5 Katha** (201–335 sqm) | **62.5%** | **37.5%** |\n` +
      `| **5 to 10 Katha** (335–670 sqm) | **60.0%** | **40.0%** |\n` +
      `| **10 to 15 Katha** (670–1005 sqm) | **55.0%** | **45.0%** |\n` +
      `| **Above 15 Katha** (> 1005 sqm) | **50.0%** | **50.0%** |\n\n` +
      `#### Critical MGC & Open Space Rules (RAJUK DAP 2022–2035):\n` +
      `- **50% Soft Pavement Rule**: At least 50% of the mandatory open space must remain unpaved / permeable natural earth for rainwater absorption.\n` +
      `- **Driveway Inclusion**: Paved driveways and parking entries count within the total allowable covered/paved area.\n` +
      `- **Setback Preservation**: Mandatory front, rear, and side setbacks must always be maintained regardless of MGC percentage.` +
      DISCLAIMER
    );
  }

  // 5. Mandatory FAR & Setback Rules
  if (lower.includes("far") || lower.includes("floor area ratio") || lower.includes("setback")) {
    return (
      `### Floor Area Ratio (FAR) & Mandatory Setback Rules (BNBC 2020 & RAJUK)\n\n` +
      `#### 1. What is FAR?\n` +
      `$$\\text{FAR} = \\frac{\\text{Total Gross Built-up Area across all floors}}{\\text{Total Net Plot Area}}$$\n` +
      `*Exemptions from FAR*: Uncovered open terraces, basement car parking, lift machine room, fire stair shaft, and underground water reservoir are typically excluded from FAR calculation.\n\n` +
      `#### 2. Mandatory Setback Clearances (RAJUK & BNBC 2020):\n` +
      `- **Low-Rise (Up to 6 stories)**:\n` +
      `  - Front Setback: **≥ 1.5m (5.0 ft)** from road centerline or boundary line.\n` +
      `  - Rear Setback: **≥ 1.5m (5.0 ft)**.\n` +
      `  - Side Setbacks: **≥ 1.0m (3.3 ft)** on each side.\n` +
      `- **Mid-Rise (7 to 10 stories)**:\n` +
      `  - Front Setback: **≥ 2.0m (6.5 ft)**.\n` +
      `  - Rear Setback: **≥ 2.0m (6.5 ft)**.\n` +
      `  - Side Setbacks: **≥ 1.25m (4.1 ft)** each side.\n` +
      `- **High-Rise (11+ stories / > 33m height)**:\n` +
      `  - Front Setback: **≥ 2.5m (8.2 ft)**.\n` +
      `  - Rear Setback: **≥ 2.5m (8.2 ft)**.\n` +
      `  - Side Setbacks: **≥ 1.5m (5.0 ft)**. Dedicated 3.65m (12 ft) fire tender circulation path mandatory.\n\n` +
      `#### 3. Balcony Cantilever Clearances:\n` +
      `- Cantilever balconies can project up to **0.75m (2.5 ft)** into setback zones, provided clear distance to the plot boundary is at least **1.0m (3.3 ft)**.\n` +
      `- Balcony area must not exceed 25% of the room perimeter it serves.` +
      DISCLAIMER
    );
  }

  // 6. Lift & Elevator Rules
  if (lower.includes("lift") || lower.includes("elevator")) {
    return (
      `### Passenger Lift & Elevator Regulations (BNBC 2020 Part 3)\n\n` +
      `Under **BNBC 2020 (Part 3, Chapter 3 - Building Services: Elevators & Escalators)**:\n\n` +
      `- **Mandatory Threshold**: A passenger elevator is **legally mandatory for any building exceeding 6 stories or 20 meters in height**.\n` +
      `- **Dual Elevator Requirement**: Recommended for buildings exceeding 10 stories or developments with more than 25 apartment units per floor core.\n` +
      `- **Stretcher / Fireman Lift**: Mandatory for high-rise buildings (over 10 stories / 33m) to accommodate medical stretchers and emergency firefighting operations.\n` +
      `- **Power Backup**: Automatic standby diesel generator (synchronous ATS panel) is legally mandatory to provide elevator evacuation during grid outages.\n` +
      `- **Machine Room Ventilation**: Well-ventilated elevator machine room with minimum clear headroom of 2.2m.` +
      DISCLAIMER
    );
  }

  // 7. Fire Safety & Emergency Staircase Rules
  if (lower.includes("fire") || lower.includes("stair") || lower.includes("emergency exit") || lower.includes("noc")) {
    return (
      `### Fire Safety & Emergency Staircase Provisions (BNBC 2020 Part 4)\n\n` +
      `Under **BNBC 2020 (Part 4 - Fire Protection)** and Fire Service & Civil Defence regulations:\n\n` +
      `- **Dual Staircases**: Mandatory for buildings exceeding **33 meters in height (approx. 10 stories)** or floor occupant loads exceeding 50 persons per floor.\n` +
      `- **Fire Stair Separation**: The emergency fire stair must be enclosed with minimum 2-hour fire-rated RCC/brick walls and self-closing 1.5-hour fire doors.\n` +
      `- **Travel Distance**: Maximum travel distance from any point in a dwelling unit to an exit staircase door must not exceed **25 meters (approx. 82 ft)**.\n` +
      `- **Fire Service NOC**: Mandatory for all buildings exceeding 6 stories or commercial/industrial developments.\n` +
      `- **Water Supply**: Dedicated underground fire water reservoir (minimum 25,000–50,000 gallons) separate from domestic water, with diesel-driven automatic fire pump.` +
      DISCLAIMER
    );
  }

  // 8. Parking Rules
  if (lower.includes("parking") || lower.includes("garage") || lower.includes("car")) {
    return (
      `### Car Parking Provisions (RAJUK & BNBC 2020)\n\n` +
      `Under RAJUK Imarat Nirman Bidhimala and DAP Guidelines:\n\n` +
      `- **Residential Standards**:\n` +
      `  - Units ≥ 1,200 sqft: **1 car parking space per apartment unit**.\n` +
      `  - Units < 1,000 sqft: **1 car parking space per 2 units**.\n` +
      `- **Standard Parking Bay Dimensions**: Minimum **2.4m × 4.8m (8.0 ft × 16.0 ft)** for each car.\n` +
      `- **Driveway Width**: Minimum **4.25m (14 ft)** for two-way circulation; **3.0m (10 ft)** for one-way.\n` +
      `- **Basement Ramp Slope**: Maximum gradient of **1:8 (12.5%)** for standard car ramps with 1:16 transition zones at top and bottom.\n` +
      `- **Clear Headroom**: Minimum **2.4m (8.0 ft)** clear vertical clearance beneath basement beams and service ducts.` +
      DISCLAIMER
    );
  }

  // 9. Seismic Design & Structural Specifications
  if (lower.includes("seismic") || lower.includes("earthquake") || lower.includes("rebar") || lower.includes("steel") || lower.includes("concrete") || lower.includes("structural")) {
    return (
      `### Seismic Design & Structural Specifications (BNBC 2020 Part 6)\n\n` +
      `Under **BNBC 2020 (Part 6 - Structural Design)**:\n\n` +
      `#### 1. Bangladesh Seismic Zonation:\n` +
      `- **Zone 1 (Z = 0.12)**: Southwestern region (Khulna, Barishal, Jashore) - Low seismic risk.\n` +
      `- **Zone 2 (Z = 0.20)**: Central region (Dhaka, Gazipur, Cumilla, Rajshahi) - Moderate seismic risk.\n` +
      `- **Zone 3 (Z = 0.28)**: Southeastern & Northern region (Chattogram, Cox's Bazar, Mymensingh) - Severe seismic risk.\n` +
      `- **Zone 4 (Z = 0.36)**: Northeastern region (Sylhet, Sunamganj, Kurigram) - Extreme seismic risk.\n\n` +
      `#### 2. Materials Specification:\n` +
      `- **Rebar**: High-yield 500W (500 MPa / 72.5 ksi) deformed steel bars with minimum 14% elongation.\n` +
      `- **Concrete Strength**: Minimum cylinder compressive strength $f'_c = 3,000\\text{ to }3,500\\text{ psi}$ (20.7–24.1 MPa) for columns and shear walls.\n` +
      `- **Ductile Detailing**: Columns must have seismic confinement hoops spaced at max **4 inches (100mm) center-to-center** within the plastic hinge zone (end 2 feet of column-beam joints).` +
      DISCLAIMER
    );
  }

  // 10. General / Comprehensive Fallback Response
  const isConstructionQuery = /(road|width|story|stories|storied|floor|floors|tola|setback|far|mgc|coverage|soil|spt|borehole|foundation|pile|footing|rebar|steel|concrete|cement|brick|building|house|structure|structural|architect|architecture|rajuk|cda|kda|rda|pourashava|municipality|bylaw|dap|permit|approval|plan|cantilever|balcony|lift|elevator|stair|staircase|fire|noc|safety|parking|garage|katha|sqft|bigha|seismic|earthquake|zone|zoning|occupancy|residential|commercial|drainage|plumbing)/i.test(cleanLower);

  if (!isConstructionQuery) {
    return "Gemini is temporarily unavailable, so I could not answer this general question. Please try again shortly.";
  }

  return (
    `### Bangladesh Building Code & Engineering Advisory (BNBC 2020 & ${authority.name})\n\n` +
    `Regarding your inquiry on: **"${question.trim()}"**\n\n` +
    `#### Core Statutory Guidelines:\n` +
    `- **Permissible Height & Road Width**: Road width dictates maximum permissible stories under ${authority.name}. For instance, a 20ft road permits up to 7 stories, while a 25ft road permits up to 10 stories.\n` +
    `- **Floor Area Ratio (FAR)**: Governed by road width, plot area, and DAP 2022–2035 zoning tables.\n` +
    `- **Setbacks**: Minimum front setback is 1.5m (5 ft) for roads up to 25ft; 2.0m for mid-rise; side separations are 1.0m to 1.25m.\n` +
    `- **Soil Investigation**: Mandatory borehole SPT testing down to 60–100 ft for all multi-story RCC structures (BNBC Part 6).\n` +
    `- **Elevator Mandate**: Mandatory for buildings exceeding 6 stories or 20m height (BNBC Part 3, Chapter 3).\n` +
    `- **Fire Safety**: Dual emergency exit staircases and Fire NOC mandatory for buildings 10 stories / 33m or taller (BNBC Part 4).` +
    DISCLAIMER
  );
}

module.exports = {
  AUTHORITY_TABLES,
  generateBnbcExpertAnswer,
};
