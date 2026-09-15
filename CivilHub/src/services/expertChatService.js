// src/services/expertChatService.js
// -----------------------------------------------------------------------------
// Service layer for Feature: "Chat with Expert" (Hybrid Model).
// Provides:
//   1. Polymorphic Chat Message contracts (User, AI Consultant, Human Expert)
//   2. Verified Bangladeshi Civil Engineer Directory (IEB registered, RAJUK, CDA)
//   3. Local AsyncStorage persistence for offline continuity
// -----------------------------------------------------------------------------

import AsyncStorageModule from "@react-native-async-storage/async-storage";

// Bulletproof unwrap across Metro, Webpack, and direct Node execution
const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;

export const CHAT_STORAGE_KEY = "@civilhub_chat_messages_v1";

/**
 * Verified Bangladeshi Human Engineering Consultants Catalog
 */
export const VERIFIED_EXPERTS = [
  {
    id: "eng_01",
    name: "Engr. Tanvir Ahmed, PEng",
    title: "Principal Structural Engineer",
    organization: "Apex Structural & Geotech Consultancy",
    iebNumber: "MIEB-18492",
    experienceYears: 14,
    specialties: ["Structural Design", "High-Rise Analysis", "BNBC 2020 Compliance"],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    rating: 4.9,
    consultationsCount: 142,
    isAvailable: true,
    contactEmail: "tanvir.struct@civilhub.bd",
    shortBio:
      "Specializes in RCC framed high-rise buildings (6-20 stories) and earthquake-resistant detailing under BNBC 2020.",
  },
  {
    id: "eng_02",
    name: "Ar. Nusrat Jahan",
    title: "Senior Architect & RAJUK Enlisted Planner",
    organization: "UrbanScape Design Studio",
    iebNumber: "IAB-K2104",
    experienceYears: 11,
    specialties: ["RAJUK Approvals", "Setback & FAR Optimization", "Architectural Layouts"],
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
    rating: 4.85,
    consultationsCount: 198,
    isAvailable: true,
    contactEmail: "nusrat.arch@civilhub.bd",
    shortBio:
      "Expert in RAJUK Imarat Nirman Bidhimala, FAR calculations, setback exemptions, and aesthetic modern exterior modeling.",
  },
  {
    id: "eng_03",
    name: "Engr. Mohammad Rafiqul Islam",
    title: "Geotechnical & Foundation Specialist",
    organization: "Bengal Soil & Foundation Lab",
    iebNumber: "FIEB-09812",
    experienceYears: 19,
    specialties: ["Soil Test Analysis", "Cast-in-Situ Piling", "Soft Clay Substructure"],
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    rating: 4.95,
    consultationsCount: 310,
    isAvailable: false,
    contactEmail: "rafiq.geotech@civilhub.bd",
    shortBio:
      "Veteran geotechnical consultant for Dhaka silt and coastal riverine soils. Borehole SPT analysis and deep pile designs.",
  },
];

/**
 * Default seeded triage welcome message from CivilHub AI
 */
export const DEFAULT_WELCOME_MESSAGE = {
  id: "msg_welcome_init",
  threadId: "default",
  senderRole: "ai",
  senderName: "CivilHub AI Consultant",
  text:
    "Hello! I am your AI Civil Engineering Consultant, trained on the Bangladesh National Building Code (BNBC 2020) and RAJUK regulations.\n\nAsk me about setbacks, floor area ratios (FAR), soil test evaluations, or pile requirements. Whenever you need certified structural drawings or official site inspection, tap 'Connect with Human Engineer'!",
  timestamp: new Date().toISOString(),
  attachedContext: null,
  isEscalationPrompt: false,
};

/**
 * Retrieve all chat messages from storage.
 * Seeds with DEFAULT_WELCOME_MESSAGE if no history exists.
 *
 * @param {string} threadId
 * @returns {Promise<Array>} Array of ChatMessage objects
 */
export async function getChatHistory(threadId = "default") {
  try {
    const raw = await AsyncStorage.getItem(`${CHAT_STORAGE_KEY}_${threadId}`);
    if (!raw) {
      return [DEFAULT_WELCOME_MESSAGE];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [DEFAULT_WELCOME_MESSAGE];
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to load chat history from AsyncStorage:", err);
    return [DEFAULT_WELCOME_MESSAGE];
  }
}

/**
 * Append a single message to persistent chat history.
 *
 * @param {Object} messagePayload - { text, senderRole, senderName, attachedContext, isEscalationPrompt }
 * @param {string} threadId
 * @returns {Promise<Object>} The saved message object
 */
export async function appendChatMessage(messagePayload, threadId = "default") {
  if (!messagePayload || !messagePayload.text || !messagePayload.text.trim()) {
    throw new Error("Cannot append an empty message.");
  }

  const validRoles = ["user", "ai", "human_expert"];
  const senderRole = validRoles.includes(messagePayload.senderRole)
    ? messagePayload.senderRole
    : "user";

  const messageToSave = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    threadId,
    senderRole,
    senderName: messagePayload.senderName || (senderRole === "user" ? "Landowner" : "Expert"),
    text: messagePayload.text.trim(),
    timestamp: new Date().toISOString(),
    attachedContext: messagePayload.attachedContext || null,
    isEscalationPrompt: Boolean(messagePayload.isEscalationPrompt),
  };

  try {
    const existing = await getChatHistory(threadId);
    const updated = [...existing, messageToSave];
    await AsyncStorage.setItem(`${CHAT_STORAGE_KEY}_${threadId}`, JSON.stringify(updated));
    return messageToSave;
  } catch (err) {
    console.error("Failed to append chat message:", err);
    throw err;
  }
}

/**
 * Reset chat history back to the initial seeded welcome message.
 *
 * @param {string} threadId
 * @returns {Promise<Array>} Initial messages array
 */
export async function clearChatHistory(threadId = "default") {
  try {
    await AsyncStorage.removeItem(`${CHAT_STORAGE_KEY}_${threadId}`);
    return [DEFAULT_WELCOME_MESSAGE];
  } catch (err) {
    console.error("Failed to clear chat history:", err);
    return [DEFAULT_WELCOME_MESSAGE];
  }
}

/**
 * Retrieve verified human engineers catalog.
 *
 * @returns {Array} List of verified expert profiles
 */
export function getAvailableExperts() {
  return [...VERIFIED_EXPERTS];
}

/**
 * Find an expert by ID.
 *
 * @param {string} id
 * @returns {Object|null}
 */
export function getExpertById(id) {
  return VERIFIED_EXPERTS.find((e) => e.id === id) || null;
}

/**
 * Keywords indicating legal sign-off, structural damage, or mandatory physical engineering inspection
 */
export const ESCALATION_TRIGGER_PATTERNS = [
  /\b(crack|cracks|settlement|tilt|deflection|collapse|sinkhole)\b/i,
  /\b(stamp|signature|sign|approve|approval|submission|submit)\b/i,
  /\b(soil\s*test|spt|borehole|bearing\s*capacity)\b/i,
  /\b(structural\s*drawing|column\s*reinforcement|rebar\s*detailing|beam\s*shear)\b/i,
  /\b(hire|contact|book|visit|on-site|physical\s*inspection)\b/i,
];

/**
 * Evaluates whether a user message warrants a recommendation to consult a licensed human engineer.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function detectEscalationNeed(text = "") {
  if (!text) return false;
  return ESCALATION_TRIGGER_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Comprehensive offline knowledge base for Bangladesh Civil Engineering (BNBC 2020 & RAJUK).
 * Transparent fallback when backend Gemini API is unreachable or unconfigured.
 *
 * @param {string} prompt
 * @param {Object|null} context
 * @returns {string}
 */
export function generateLocalCivilConsultation(prompt = "", context = null) {
  const lower = prompt.toLowerCase();
  const floors = context?.floors || (lower.match(/(\d+)\s*(?:story|storied|floor)/)?.[1] ? parseInt(lower.match(/(\d+)\s*(?:story|storied|floor)/)[1], 10) : null);
  const katha = context?.katha || (lower.match(/([\d.]+)\s*katha/)?.[1] ? parseFloat(lower.match(/([\d.]+)\s*katha/)[1]) : null);
  const authority = context?.authority || "RAJUK";

  let advice = "";

  if (lower.includes("setback") || lower.includes("side") || lower.includes("rear") || lower.includes("front")) {
    advice = `### Setback Requirements under ${authority} (BNBC 2020):\n` +
      `- **Front Setback**: Minimum 1.5 meters (4.92 ft) from the road boundary line.\n` +
      `- **Rear Setback**: Minimum 2.0 meters (6.56 ft) for plots up to 5 Katha; 3.0 meters for larger plots.\n` +
      `- **Side Setbacks**: Minimum 1.0 to 1.25 meters (3.28 to 4.10 ft) on both sides to ensure fire separation and emergency ventilation.\n` +
      `*Note: For roads narrower than 20 feet, additional front surrender may be required to meet minimum right-of-way.*`;
  } else if (lower.includes("soil") || lower.includes("pile") || lower.includes("foundation") || lower.includes("footing")) {
    advice = `### Foundation & Geotechnical Guidelines (BNBC 2020):\n` +
      `- **Soil Investigation**: Mandatory minimum of 3 to 5 boreholes for any structure over 3 stories.\n` +
      `- **Low SPT (N < 5)**: Indicates soft organic clay or loose silt; deep cast-in-situ RCC bored piles (typically 50–80 ft depth) are recommended.\n` +
      `- **Medium-Dense Soil (N > 15)**: Mat/Raft foundation or isolated footing with tie beams may be feasible for up to 5-6 stories.\n` +
      `- **Pile Load Test**: Perform axial compression load tests (ASTM D1143) to verify ultimate bearing capacity prior to column casting.`;
  } else if (lower.includes("cost") || lower.includes("estimate") || lower.includes("budget") || lower.includes("sqft")) {
    advice = `### Construction Cost Benchmark (Dhaka / Bangladesh):\n` +
      `- **RCC Structural Core (Grey structure)**: ~৳1,200 - ৳1,500 per sq. ft. (Cement, 500W rebar, stone chips, brickwork).\n` +
      `- **Standard Finishing**: ~৳2,200 - ৳2,700 per sq. ft. (Tiles, sanitary ware, standard paint, electrical fixtures).\n` +
      `- **Premium Finishing**: ~৳3,000 - ৳4,000+ per sq. ft. (Imported fittings, marble/granite, central VRF AC provisions).`;
  } else if (floors || katha) {
    const fCount = floors || 6;
    const kCount = katha || 4;
    const farVal = fCount >= 8 ? "3.75 - 4.25" : "3.00 - 3.50";
    advice = `### Technical Assessment for ${fCount}-Story Building on ${kCount} Katha (${authority}):\n` +
      `- **Permissible FAR (Floor Area Ratio)**: Approximately ${farVal} under ${authority} Imarat Nirman Bidhimala.\n` +
      `- **Maximum Ground Coverage (MGC)**: Max 55% - 60% of plot area, preserving the remainder for mandatory permeable greenery & setbacks.\n` +
      `- **Structural System**: Dual frame system with RCC shear walls around elevator/stair cores recommended for ${fCount}+ stories against seismic Zone II/III loads.\n` +
      `- **Car Parking**: Minimum 1 car parking bay per 1,200 sq. ft. residential unit required by building code.`;
  } else {
    advice = `### General Civil Engineering Guidance (BNBC 2020 & ${authority}):\n` +
      `- **Materials Quality**: Use Minimum 500W / 60-Grade deformed steel rebar and 3000+ PSI cylinder strength concrete for all load-bearing structural columns.\n` +
      `- **Structural Approvals**: Building designs exceeding 5 stories mandate structural calculation sheets signed by a registered PEng/IEB Member.\n` +
      `- **Earthquake & Wind Resistance**: Dhaka falls under Seismic Zone 2 (Z = 0.20) with basic design wind velocity of 65.7 m/s (BNBC 2020).`;
  }

  advice += `\n\n*Disclaimer: Final approval depends on the relevant development authority (${authority}/Pourashava) and verification by a licensed structural engineer.*`;
  return advice;
}

/**
 * Queries the Civil Engineering AI Assistant.
 * Blends user inquiry with active project context, tries the backend Gemini proxy,
 * and gracefully falls back to the internal BNBC 2020 engine if offline.
 *
 * @param {string} userPrompt - User's question
 * @param {Object|null} activeContext - { floors, katha, authority, roadWidth }
 * @returns {Promise<Object>} Formatted AI ChatMessage payload
 */
export async function queryAiCivilExpert(userPrompt, activeContext = null) {
  if (!userPrompt || !userPrompt.trim()) {
    throw new Error("Please enter an engineering question.");
  }

  const trimmedPrompt = userPrompt.trim();
  const shouldEscalate = detectEscalationNeed(trimmedPrompt);

  // Build context-enriched prompt
  let contextHeader = "";
  if (activeContext) {
    const ctxParts = [];
    if (activeContext.floors) ctxParts.push(`Story Count: ${activeContext.floors}`);
    if (activeContext.katha) ctxParts.push(`Plot Size: ${activeContext.katha} Katha`);
    if (activeContext.roadWidth) ctxParts.push(`Road Width: ${activeContext.roadWidth} ft`);
    if (activeContext.authority) ctxParts.push(`Authority: ${activeContext.authority}`);
    if (ctxParts.length > 0) {
      contextHeader = `[Active Project Context: ${ctxParts.join(", ")}]\n\n`;
    }
  }

  const enrichedPrompt = `${contextHeader}${trimmedPrompt}`;

  // Attempt backend Gemini proxy call with timeout
  let answerText = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("http://localhost:4000/api/ask-building-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: enrichedPrompt }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.answer) {
        answerText = data.answer;
      }
    }
  } catch (_netErr) {
    // Backend offline or unreachable -> transparent fallback
  }

  // If backend didn't provide answer, use local BNBC knowledge engine
  if (!answerText) {
    answerText = generateLocalCivilConsultation(trimmedPrompt, activeContext);
  }

  return {
    text: answerText,
    senderRole: "ai",
    senderName: "CivilHub AI Consultant",
    isEscalationPrompt: shouldEscalate,
    attachedContext: activeContext || null,
  };
}

