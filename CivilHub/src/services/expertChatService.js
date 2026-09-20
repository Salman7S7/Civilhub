// src/services/expertChatService.js
import { BACKEND_BASE_URL } from "./apiConfig.js";
import AsyncStorageModule from "@react-native-async-storage/async-storage";

// Bulletproof unwrap across Metro, Webpack, and direct Node execution
const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;

export const CHAT_STORAGE_KEY = "@civilhub_chat_messages_v2";

export const THREAD_AI = "thread_client_ai";
export const THREAD_STRUCTURAL = "thread_client_structural";
export const THREAD_ARCHITECT = "thread_client_architect";
export const THREAD_SOIL = "thread_client_soil";

export const AI_SPEC = {
  id: "ai",
  name: "CivilHub AI Assistant",
  title: "Building Code & BNBC AI (Gemini)",
  roleLabel: "AI Expert",
  license: "Google Gemini • BNBC 2020",
  threadId: THREAD_AI,
  greeting:
    "Hello! I am your CivilHub AI Assistant powered by Google Gemini and BNBC 2020.\n\nI can answer questions regarding Floor Area Ratio (FAR), road setbacks, story height limits, seismic design rules, and municipal approvals across RAJUK, CDA, RDA, and KDA.",
};

export const VERIFIED_EXPERTS = [
  {
    id: "architect_1",
    name: "Ar. Nusrat Jahan",
    title: "Senior Architect (Arc)",
    roleLabel: "Architect",
    discipline: "architect",
    license: "IAB-K2104",
    experience: "12 years exp",
    firm: "Studio Nirman Dhaka",
    rating: "4.9 ★ (84 reviews)",
    specialties: ["Floor Layouts", "FAR Calculation", "RAJUK & CDA Approval"],
    threadId: "thread_client_architect_1",
    avatarInitials: "NJ",
    avatarColor: "#0284c7",
    greeting:
      "Hello! I am Ar. Nusrat Jahan, your Architectural Consultant (IAB-K2104).\n\nI can assist you with Floor Area Ratio (FAR) calculations, mandatory front/rear setbacks, architectural floor layouts, and RAJUK/CDA approval preparation.",
  },
  {
    id: "architect_2",
    name: "Ar. Mahmudul Hasan",
    title: "Principal Urban Architect",
    roleLabel: "Architect",
    discipline: "architect",
    license: "IAB-M3190",
    experience: "8 years exp",
    firm: "Hasan & Associates",
    rating: "4.8 ★ (56 reviews)",
    specialties: ["Residential Elevation", "Interior Space Planning", "Green Building"],
    threadId: "thread_client_architect_2",
    avatarInitials: "MH",
    avatarColor: "#0369a1",
    greeting:
      "Hello! I am Ar. Mahmudul Hasan (IAB-M3190). I specialize in modern residential elevation, sustainable building envelopes, and RAJUK building code compliance.",
  },
  {
    id: "structural_1",
    name: "Engr. Tanvir Ahmed, PEng",
    title: "Principal Structural Engineer",
    roleLabel: "Structure Eng",
    discipline: "structural",
    license: "MIEB-18492",
    experience: "15 years exp",
    firm: "Dhaka Structural Dynamics",
    rating: "5.0 ★ (112 reviews)",
    specialties: ["BNBC 2020", "Seismic RCC Detailing", "Shear Wall Design"],
    threadId: "thread_client_structural_1",
    avatarInitials: "TA",
    avatarColor: "#2563eb",
    greeting:
      "Hello! I am Engr. Tanvir Ahmed, PEng (MIEB-18492).\n\nI can help you evaluate column and shear wall sizing, earthquake-resistant RCC frame detailing, structural drawing review, and BNBC 2020 structural safety compliance.",
  },
  {
    id: "structural_2",
    name: "Engr. Shahriar Kabir",
    title: "Senior RCC Frame Specialist",
    roleLabel: "Structure Eng",
    discipline: "structural",
    license: "MIEB-22104",
    experience: "9 years exp",
    firm: "Apex Structural Engineers",
    rating: "4.9 ★ (63 reviews)",
    specialties: ["High-rise Detailing", "Beam-Column Joints", "ETABS Modeling"],
    threadId: "thread_client_structural_2",
    avatarInitials: "SK",
    avatarColor: "#1d4ed8",
    greeting:
      "Hello! I am Engr. Shahriar Kabir (MIEB-22104). I specialize in high-rise RCC framing, ductile rebar confinement, and ETABS structural analysis.",
  },
  {
    id: "soil_1",
    name: "Engr. Mohammad Rafiqul",
    title: "Geotechnical & Soil Specialist",
    roleLabel: "Soil Eng",
    discipline: "soil",
    license: "FIEB-09812",
    experience: "18 years exp",
    firm: "Bengal Geotechnical Lab",
    rating: "4.9 ★ (92 reviews)",
    specialties: ["Borehole SPT N-Value", "Bored Cast-in-Situ Piling", "Pile Load Test"],
    threadId: "thread_client_soil_1",
    avatarInitials: "MR",
    avatarColor: "#059669",
    greeting:
      "Hello! I am Engr. Mohammad Rafiqul, your Geotechnical & Soil Specialist (FIEB-09812).\n\nI specialize in soil test review, borehole SPT N-value interpretation, allowable bearing capacity calculation, and cast-in-situ bored pile foundation design.",
  },
  {
    id: "soil_2",
    name: "Engr. Anisur Rahman",
    title: "Foundation & Soil Consultant",
    roleLabel: "Soil Eng",
    discipline: "soil",
    license: "MIEB-17632",
    experience: "11 years exp",
    firm: "Delta Geo-Engineering",
    rating: "4.8 ★ (47 reviews)",
    specialties: ["Mat / Raft Footing", "Differential Settlement", "Soil Improvement"],
    threadId: "thread_client_soil_2",
    avatarInitials: "AR",
    avatarColor: "#047857",
    greeting:
      "Hello! I am Engr. Anisur Rahman (MIEB-17632). I evaluate soil bearing capacity, settlement risks in alluvial silt, and mat foundation suitability.",
  },
];

export const ENGINEER_SPECS = {
  architect: VERIFIED_EXPERTS[0],
  structural: VERIFIED_EXPERTS[2],
  soil: VERIFIED_EXPERTS[4],
};

export function getAvailableExperts(disciplineFilter = "all") {
  if (!disciplineFilter || disciplineFilter === "all") {
    return VERIFIED_EXPERTS;
  }
  return VERIFIED_EXPERTS.filter((e) => e.discipline === disciplineFilter);
}

export function getExpertById(expertId) {
  return (
    VERIFIED_EXPERTS.find((e) => e.id === expertId) ||
    VERIFIED_EXPERTS[2] // default to structural_1
  );
}

export function getExpertForThread(threadId) {
  return VERIFIED_EXPERTS.find((e) => e.threadId === threadId) || null;
}

export function getThreadIdForEngineer(engineerType) {
  if (engineerType === "architect") return "thread_client_architect_1";
  if (engineerType === "soil") return "thread_client_soil_1";
  return "thread_client_structural_1";
}

export const EXPERTS_STORAGE_KEY = "@civilhub_cached_experts_v1";

/**
 * Fetch verified experts dynamically from the MySQL database via REST API.
 * Falls back to local AsyncStorage cache and default verified list if offline.
 */
export async function fetchExpertsFromApi(disciplineFilter = "all") {
  try {
    const url =
      disciplineFilter && disciplineFilter !== "all"
        ? `${BACKEND_BASE_URL}/api/experts?discipline=${encodeURIComponent(disciplineFilter)}`
        : `${BACKEND_BASE_URL}/api/experts`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.experts) && data.experts.length > 0) {
        await AsyncStorage.setItem(EXPERTS_STORAGE_KEY, JSON.stringify(data.experts));
        return data.experts;
      }
    }
  } catch (err) {
    console.warn("[Experts API] Network fetch failed, falling back to local cache:", err.message);
  }

  // Fallback 1: AsyncStorage Cache
  try {
    const cached = await AsyncStorage.getItem(EXPERTS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!disciplineFilter || disciplineFilter === "all") return parsed;
        return parsed.filter((e) => e.discipline === disciplineFilter);
      }
    }
  } catch (_e) {}

  // Fallback 2: Built-in default catalog
  return getAvailableExperts(disciplineFilter);
}

export function getDefaultWelcomeForThread(threadId) {
  if (threadId === THREAD_AI) {
    return [
      {
        id: "msg_welcome_ai",
        threadId: THREAD_AI,
        senderRole: "ai",
        engineerType: "ai",
        senderName: AI_SPEC.name,
        text: AI_SPEC.greeting,
        timestamp: new Date().toISOString(),
        attachedContext: null,
      },
    ];
  }

  const expert = getExpertForThread(threadId);
  if (expert) {
    return [
      {
        id: `msg_welcome_${expert.id}`,
        threadId: expert.threadId,
        senderRole: "engineer",
        engineerType: expert.discipline,
        senderName: expert.name,
        text: expert.greeting,
        timestamp: new Date().toISOString(),
        attachedContext: null,
      },
    ];
  }

  // Fallbacks for legacy thread IDs
  if (threadId === THREAD_ARCHITECT) {
    return getDefaultWelcomeForThread("thread_client_architect_1");
  }
  if (threadId === THREAD_SOIL) {
    return getDefaultWelcomeForThread("thread_client_soil_1");
  }
  return getDefaultWelcomeForThread("thread_client_structural_1");
}

/**
 * Retrieve chat messages for a specific consultation thread from MySQL.
 * Syncs with local AsyncStorage cache for offline availability.
 */
export async function getChatHistory(threadId = THREAD_STRUCTURAL) {
  // For AI thread, use local AsyncStorage
  if (threadId === THREAD_AI) {
    try {
      const raw = await AsyncStorage.getItem(`${CHAT_STORAGE_KEY}_${threadId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_e) {}
    return getDefaultWelcomeForThread(threadId);
  }

  // For Human Consultation threads, query MySQL Backend
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/chat/messages/${encodeURIComponent(threadId)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        await AsyncStorage.setItem(`${CHAT_STORAGE_KEY}_${threadId}`, JSON.stringify(data.messages));
        return data.messages;
      }
    }
  } catch (err) {
    console.warn("[Chat History API] Network fetch failed, using local cache:", err.message);
  }

  // Cache fallback
  try {
    const raw = await AsyncStorage.getItem(`${CHAT_STORAGE_KEY}_${threadId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_e) {}

  return getDefaultWelcomeForThread(threadId);
}

/**
 * Append a single message to persistent chat history in MySQL and local cache.
 */
export async function appendChatMessage(messagePayload, threadId = THREAD_STRUCTURAL) {
  if (!messagePayload || !messagePayload.text || !messagePayload.text.trim()) {
    throw new Error("Cannot append an empty message.");
  }

  const senderRole = messagePayload.senderRole || "client";

  let fallbackSenderName = "Client";
  if (senderRole === "ai") fallbackSenderName = AI_SPEC.name;
  else if (senderRole === "engineer") fallbackSenderName = "Engineer";

  const cleanText = messagePayload.text.trim();
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const messageToSave = {
    id: msgId,
    threadId,
    senderRole,
    engineerType: messagePayload.engineerType || null,
    senderName: messagePayload.senderName || fallbackSenderName,
    text: cleanText,
    timestamp: new Date().toISOString(),
    attachedContext: messagePayload.attachedContext || null,
  };

  // Try saving to MySQL Backend
  if (threadId !== THREAD_AI) {
    try {
      await fetch(`${BACKEND_BASE_URL}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToSave),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.warn("[Append Chat API] Backend save failed, saving to local cache:", err.message);
    }
  }

  // Always sync local AsyncStorage cache
  try {
    const existing = await getChatHistory(threadId);
    const updated = [...existing, messageToSave];
    await AsyncStorage.setItem(`${CHAT_STORAGE_KEY}_${threadId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to persist message to AsyncStorage:", err);
  }

  return messageToSave;
}

/**
 * Clear chat history for a thread back to initial welcome message in MySQL and local cache.
 */
export async function clearChatHistory(threadId = THREAD_STRUCTURAL) {
  if (threadId !== THREAD_AI) {
    try {
      await fetch(`${BACKEND_BASE_URL}/api/chat/messages/${encodeURIComponent(threadId)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.warn("[Clear Chat API] Backend delete failed:", err.message);
    }
  }

  try {
    await AsyncStorage.removeItem(`${CHAT_STORAGE_KEY}_${threadId}`);
  } catch (err) {
    console.warn("Failed to clear chat history from AsyncStorage:", err);
  }

  return getDefaultWelcomeForThread(threadId);
}

/**
 * Discipline-tailored engineering advice generator
 */
export function generateDisciplineAdvice(prompt = "", engineerType = "structural", context = null) {
  const lower = prompt.toLowerCase();
  const floors = context?.floors || (lower.match(/(\d+)\s*(?:story|storied|floor)/)?.[1] ? parseInt(lower.match(/(\d+)\s*(?:story|storied|floor)/)[1], 10) : null);
  const katha = context?.katha || (lower.match(/([\d.]+)\s*katha/)?.[1] ? parseFloat(lower.match(/([\d.]+)\s*katha/)[1]) : null);
  const authority = context?.authority || "RAJUK";

  if (engineerType === "architect") {
    return (
      `### Architectural Assessment (Ar. Nusrat Jahan - ${authority} / BNBC 2020):\n\n` +
      `- **Setback Requirements**: For standard residential plots, ensure minimum 1.5m (4.92 ft) front setback, 2.0m rear setback, and 1.0m–1.25m side separation.\n` +
      `- **Floor Area Ratio (FAR)**: Calculated based on road width and plot area (${katha ? `${katha} Katha` : "your plot"}). Permissible FAR typically ranges from 3.15 to 4.20.\n` +
      `- **Light & Ventilation**: All habitable rooms mandate minimum 15% window-to-floor area ratio and clear shafts for bathrooms/kitchens.\n` +
      `- **Submission Drawings**: Architectural elevation, floor layouts, section views, and parking layouts must be signed before authority submission.`
    );
  }

  if (engineerType === "soil") {
    return (
      `### Geotechnical & Soil Evaluation (Engr. Mohammad Rafiqul - BNBC 2020):\n\n` +
      `- **Borehole SPT Testing**: Minimum 3 to 5 boreholes down to 60–100 ft recommended for ${floors ? `${floors}-story` : "multi-story"} construction.\n` +
      `- **Subsoil Condition**: If SPT N-values in the top 20–30 ft are below 10, shallow isolated footings are unsafe due to differential settlement.\n` +
      `- **Cast-in-Situ Piling**: Typically 500mm–600mm diameter bored piles with 60–80 ft length required in soft alluvial silt.\n` +
      `- **Pile Load Test**: Axial compression test (ASTM D1143) must confirm design bearing capacity before casting the pile cap.`
    );
  }

  // Structural Engineer (default)
  return (
    `### Structural Engineering Review (Engr. Tanvir Ahmed, PEng - BNBC 2020):\n\n` +
    `- **Structural Framing**: RCC dual system (Special Moment Resisting Frame + Shear Walls around elevator/staircase core) required for ${floors ? `${floors} stories` : "earthquake resistance"}.\n` +
    `- **Materials Specification**: Minimum 500W / 60-Grade deformed steel rebar and 3,000 to 3,500 PSI cylinder strength concrete for columns.\n` +
    `- **Seismic Detailing**: Dhaka/Chattogram seismic coefficients mandate ductile rebar confinement ties at column-beam joints (spacing max 4 inches in plastic hinge zones).\n` +
    `- **Load Analysis**: Dead load + live load + wind speed (65.7 m/s) + seismic zone factor (Z=0.20) modeled in ETABS/SAP2000.`
  );
}

/**
 * Query expert response when Client sends message to an engineer.
 */
export async function queryEngineerExpert(userPrompt, engineerType = "structural", activeContext = null) {
  if (!userPrompt || !userPrompt.trim()) {
    throw new Error("Please enter an engineering question.");
  }

  const trimmedPrompt = userPrompt.trim();
  const engineerSpec = ENGINEER_SPECS[engineerType] || ENGINEER_SPECS.structural;

  // Build context-enriched prompt
  let contextHeader = "";
  if (activeContext) {
    const ctxParts = [];
    if (activeContext.floors) ctxParts.push(`Story Count: ${activeContext.floors}`);
    if (activeContext.katha) ctxParts.push(`Plot Size: ${activeContext.katha} Katha`);
    if (activeContext.roadWidth) ctxParts.push(`Road Width: ${activeContext.roadWidth} ft`);
    if (activeContext.authority) ctxParts.push(`Authority: ${activeContext.authority}`);
    if (ctxParts.length > 0) {
      contextHeader = `[Project Context: ${ctxParts.join(", ")}]\n[Specialty: ${engineerSpec.roleLabel}]\n\n`;
    }
  }

  const enrichedPrompt = `${contextHeader}${trimmedPrompt}`;

  let answerText = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BACKEND_BASE_URL}/api/ask-building-code`, {
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
    // Backend offline or unreachable
  }

  if (!answerText) {
    answerText = generateDisciplineAdvice(trimmedPrompt, engineerType, activeContext);
  }

  return {
    text: answerText,
    senderRole: "engineer",
    engineerType,
    senderName: engineerSpec.name,
    attachedContext: activeContext || null,
  };
}

/**
 * Query Gemini AI Building Code Expert
 */
export async function queryAiExpert(userPrompt, activeContext = null) {
  if (!userPrompt || !userPrompt.trim()) {
    throw new Error("Please enter a question.");
  }

  const trimmedPrompt = userPrompt.trim();

  // Context enrichment
  let contextHeader = "";
  if (activeContext) {
    const ctxParts = [];
    if (activeContext.floors) ctxParts.push(`Story Count: ${activeContext.floors}`);
    if (activeContext.katha) ctxParts.push(`Plot Size: ${activeContext.katha} Katha`);
    if (activeContext.roadWidth) ctxParts.push(`Road Width: ${activeContext.roadWidth} ft`);
    if (activeContext.authority) ctxParts.push(`Authority: ${activeContext.authority}`);
    if (ctxParts.length > 0) {
      contextHeader = `[Project Context: ${ctxParts.join(", ")}]\n[Specialty: Building Code & BNBC 2020]\n\n`;
    }
  }

  const enrichedPrompt = `${contextHeader}${trimmedPrompt}`;

  let answerText = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${BACKEND_BASE_URL}/api/ask-building-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: enrichedPrompt }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (res.ok && data && data.answer) {
      answerText = data.answer;
    } else if (data && data.error) {
      answerText = data.error;
    }
  } catch (_netErr) {
    answerText = "Backend server is unreachable. Please ensure the backend is running.";
  }

  if (!answerText) {
    answerText = "Gemini API key is not configured in backend/.env. Please add GEMINI_API_KEY to enable AI chat.";
  }

  return {
    text: answerText,
    senderRole: "ai",
    engineerType: "ai",
    senderName: AI_SPEC.name,
    attachedContext: activeContext || null,
  };
}

export const generateLocalCivilConsultation = generateDisciplineAdvice;

