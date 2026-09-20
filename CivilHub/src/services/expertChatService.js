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

export const ENGINEER_SPECS = {
  architect: {
    id: "architect",
    name: "Ar. Nusrat Jahan",
    title: "Senior Architect (Arc)",
    roleLabel: "Architect (Arc)",
    license: "IAB-K2104",
    threadId: THREAD_ARCHITECT,
    greeting:
      "Hello! I am Ar. Nusrat Jahan, your Architectural Consultant (IAB-K2104).\n\nI can assist you with Floor Area Ratio (FAR) calculations, mandatory front/rear setbacks, architectural floor layouts, and RAJUK/CDA approval preparation.",
  },
  structural: {
    id: "structural",
    name: "Engr. Tanvir Ahmed, PEng",
    title: "Principal Structural Engineer",
    roleLabel: "Structure Eng",
    license: "MIEB-18492",
    threadId: THREAD_STRUCTURAL,
    greeting:
      "Hello! I am Engr. Tanvir Ahmed, your Structural Engineering Consultant (MIEB-18492).\n\nI can help you evaluate column and shear wall sizing, earthquake-resistant RCC frame detailing, structural drawing review, and BNBC 2020 structural safety compliance.",
  },
  soil: {
    id: "soil",
    name: "Engr. Mohammad Rafiqul",
    title: "Geotechnical & Soil Specialist",
    roleLabel: "Soil Eng",
    license: "FIEB-09812",
    threadId: THREAD_SOIL,
    greeting:
      "Hello! I am Engr. Mohammad Rafiqul, your Geotechnical & Soil Specialist (FIEB-09812).\n\nI specialize in soil test review, borehole SPT N-value interpretation, allowable bearing capacity calculation, and cast-in-situ bored pile foundation design.",
  },
};

export function getThreadIdForEngineer(engineerType) {
  if (engineerType === "architect") return THREAD_ARCHITECT;
  if (engineerType === "soil") return THREAD_SOIL;
  return THREAD_STRUCTURAL;
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
  if (threadId === THREAD_ARCHITECT) {
    return [
      {
        id: "msg_welcome_arc",
        threadId: THREAD_ARCHITECT,
        senderRole: "engineer",
        engineerType: "architect",
        senderName: ENGINEER_SPECS.architect.name,
        text: ENGINEER_SPECS.architect.greeting,
        timestamp: new Date().toISOString(),
        attachedContext: null,
      },
    ];
  }
  if (threadId === THREAD_SOIL) {
    return [
      {
        id: "msg_welcome_soil",
        threadId: THREAD_SOIL,
        senderRole: "engineer",
        engineerType: "soil",
        senderName: ENGINEER_SPECS.soil.name,
        text: ENGINEER_SPECS.soil.greeting,
        timestamp: new Date().toISOString(),
        attachedContext: null,
      },
    ];
  }
  return [
    {
      id: "msg_welcome_structural",
      threadId: THREAD_STRUCTURAL,
      senderRole: "engineer",
      engineerType: "structural",
      senderName: ENGINEER_SPECS.structural.name,
      text: ENGINEER_SPECS.structural.greeting,
      timestamp: new Date().toISOString(),
      attachedContext: null,
    },
  ];
}

/**
 * Retrieve chat messages for a specific consultation thread.
 */
export async function getChatHistory(threadId = THREAD_STRUCTURAL) {
  try {
    const raw = await AsyncStorage.getItem(`${CHAT_STORAGE_KEY}_${threadId}`);
    if (!raw) {
      return getDefaultWelcomeForThread(threadId);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultWelcomeForThread(threadId);
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to load chat history from AsyncStorage:", err);
    return getDefaultWelcomeForThread(threadId);
  }
}

/**
 * Append a single message to persistent chat history.
 */
export async function appendChatMessage(messagePayload, threadId = THREAD_STRUCTURAL) {
  if (!messagePayload || !messagePayload.text || !messagePayload.text.trim()) {
    throw new Error("Cannot append an empty message.");
  }

  const senderRole = messagePayload.senderRole || "client";

  let fallbackSenderName = "Client";
  if (senderRole === "ai") fallbackSenderName = AI_SPEC.name;
  else if (senderRole === "engineer") fallbackSenderName = "Engineer";

  const messageToSave = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    threadId,
    senderRole,
    engineerType: messagePayload.engineerType || null,
    senderName: messagePayload.senderName || fallbackSenderName,
    text: messagePayload.text.trim(),
    timestamp: new Date().toISOString(),
    attachedContext: messagePayload.attachedContext || null,
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
 * Clear chat history for a thread back to initial welcome message.
 */
export async function clearChatHistory(threadId = THREAD_STRUCTURAL) {
  try {
    await AsyncStorage.removeItem(`${CHAT_STORAGE_KEY}_${threadId}`);
    return getDefaultWelcomeForThread(threadId);
  } catch (err) {
    console.error("Failed to clear chat history:", err);
    return getDefaultWelcomeForThread(threadId);
  }
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

