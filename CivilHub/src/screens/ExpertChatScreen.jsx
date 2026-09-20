// src/screens/ExpertChatScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getChatHistory,
  appendChatMessage,
  clearChatHistory,
  queryEngineerExpert,
  queryAiExpert,
  getThreadIdForEngineer,
  AI_SPEC,
  ENGINEER_SPECS,
  THREAD_AI,
  THREAD_STRUCTURAL,
  THREAD_ARCHITECT,
  THREAD_SOIL,
} from "../services/expertChatService";

const ENGINEER_CHIPS = [
  { id: "architect", label: "Arc (Architect)", icon: "drawing" },
  { id: "structural", label: "Structure Eng", icon: "pillar" },
  { id: "soil", label: "Soil Eng", icon: "shovel" },
];

export default function ExpertChatScreen({ route, session }) {
  const user = session?.user;
  const isEngineer = user?.role === "engineer";
  const engineerDiscipline = user?.engineerType || "structural";

  // 2 Chat Options: "ai" (Chat with AI Expert) vs "human" (Chat with Human Expert)
  // Default to "ai" for clients; default to "human" for engineers (client consultation)
  const [chatMode, setChatMode] = useState(isEngineer ? "human" : "ai");

  // For Client in Human mode: select which engineer to consult
  // For Engineer: locked strictly to their own discipline to talk to Client
  const [selectedDiscipline, setSelectedDiscipline] = useState(
    isEngineer ? engineerDiscipline : "structural"
  );

  const activeDiscipline = isEngineer ? engineerDiscipline : selectedDiscipline;
  const activeThreadId =
    chatMode === "ai"
      ? THREAD_AI
      : getThreadIdForEngineer(activeDiscipline);
  const activeSpec =
    chatMode === "ai"
      ? AI_SPEC
      : ENGINEER_SPECS[activeDiscipline] || ENGINEER_SPECS.structural;

  const initialContext = route?.params?.initialContext || null;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeContext, setActiveContext] = useState(initialContext);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const scrollViewRef = useRef(null);

  // Sync route params when navigated with new parameters
  useEffect(() => {
    if (route?.params?.initialContext) {
      setActiveContext(route.params.initialContext);
    }
  }, [route?.params?.initialContext]);

  // Load chat history whenever activeThreadId changes
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setLoadingHistory(true);
      try {
        const history = await getChatHistory(activeThreadId);
        if (isMounted) setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [activeThreadId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Send message
  const handleSend = async (textToSend = inputText) => {
    const trimmed = (textToSend || "").trim();
    if (!trimmed || isTyping) return;

    setInputText("");

    if (chatMode === "ai") {
      // 1. CHAT WITH AI EXPERT (Powered by Google Gemini)
      try {
        const savedUserMsg = await appendChatMessage(
          {
            text: trimmed,
            senderRole: "client",
            senderName: user?.name || "Client",
            attachedContext: activeContext,
          },
          THREAD_AI
        );

        setMessages((prev) => [...prev, savedUserMsg]);
        setIsTyping(true);

        const aiReply = await queryAiExpert(trimmed, activeContext);
        const savedReply = await appendChatMessage(aiReply, THREAD_AI);
        setMessages((prev) => [...prev, savedReply]);
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to process AI question.");
      } finally {
        setIsTyping(false);
      }
    } else if (isEngineer) {
      // 2. ENGINEER LOGGED IN: Talks to Client in Human mode
      try {
        const savedEngineerMsg = await appendChatMessage(
          {
            text: trimmed,
            senderRole: "engineer",
            engineerType: activeDiscipline,
            senderName: user?.name || activeSpec.name,
            attachedContext: activeContext,
          },
          activeThreadId
        );
        setMessages((prev) => [...prev, savedEngineerMsg]);
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to send message.");
      }
    } else {
      // 3. CLIENT LOGGED IN: Sends question to active Human Engineer
      try {
        const savedClientMsg = await appendChatMessage(
          {
            text: trimmed,
            senderRole: "client",
            senderName: user?.name || "Client",
            attachedContext: activeContext,
          },
          activeThreadId
        );

        setMessages((prev) => [...prev, savedClientMsg]);
        setIsTyping(true);

        // Get engineering response tailored for the selected discipline
        const expertReply = await queryEngineerExpert(
          trimmed,
          activeDiscipline,
          activeContext
        );

        const savedReply = await appendChatMessage(expertReply, activeThreadId);
        setMessages((prev) => [...prev, savedReply]);
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to process consultation.");
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Reset conversation
  const handleClearHistory = () => {
    Alert.alert(
      "Reset Conversation",
      `Are you sure you want to clear this ${chatMode === "ai" ? "AI" : "consultation"} thread?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Thread",
          style: "destructive",
          onPress: async () => {
            const resetMessages = await clearChatHistory(activeThreadId);
            setMessages(resetMessages);
          },
        },
      ]
    );
  };

  // Quick starter prompts based on chat mode, user role, and discipline
  const getQuickPrompts = () => {
    if (chatMode === "ai") {
      return [
        "Can I build 7 stories on a 20ft road under RAJUK?",
        "What is the mandatory FAR setback rule?",
        "Minimum road width for a 10-story building?",
        "When is soil SPT testing mandatory under BNBC 2020?",
        "What is the maximum ground coverage (MGC) for residential?",
      ];
    }
    if (isEngineer) {
      return [
        "Please provide the architectural floor layout.",
        "Kindly share the certified soil investigation SPT report.",
        "What is the front road width and setback clearance?",
        "Please confirm total story count and basement requirements.",
      ];
    }
    if (activeDiscipline === "architect") {
      return [
        "What are the mandatory setbacks for my plot under RAJUK?",
        "How is Floor Area Ratio (FAR) calculated?",
        "What are the requirements for car parking and open space?",
      ];
    }
    if (activeDiscipline === "soil") {
      return [
        "When is cast-in-situ bored piling mandatory under BNBC 2020?",
        "What SPT N-value is required for shallow footing?",
        "How many boreholes are needed for a 6-story building?",
      ];
    }
    return [
      "What column sizing is typical for a 6-story RCC building?",
      "What are the BNBC 2020 seismic requirements for Dhaka?",
      "Can you review my beam rebar specifications?",
    ];
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.headerIconCircle,
                chatMode === "ai" && styles.headerIconCircleAI,
              ]}
            >
              {chatMode === "ai" ? (
                <Ionicons name="sparkles" size={20} color="#4f46e5" />
              ) : (
                <MaterialCommunityIcons
                  name={isEngineer ? "hard-hat" : "account-tie"}
                  size={22}
                  color="#2563eb"
                />
              )}
            </View>
            <View>
              <Text style={styles.headerTitle}>
                {chatMode === "ai"
                  ? "CivilHub AI Assistant"
                  : isEngineer
                  ? "Client Consultation"
                  : activeSpec.roleLabel}
              </Text>
              <Text style={styles.headerSubtitle}>
                {chatMode === "ai"
                  ? "Powered by Google Gemini & BNBC 2020"
                  : isEngineer
                  ? "Direct Client Consultation"
                  : `Consulting ${activeSpec.name} (${activeSpec.license})`}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleClearHistory}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2 OPTIONS TOGGLE: Chat with AI Expert vs Chat with Human Expert */}
        <View style={styles.modeToggleBar}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              chatMode === "ai" && styles.modeTabActiveAI,
            ]}
            onPress={() => setChatMode("ai")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={chatMode === "ai" ? "#ffffff" : "#4f46e5"}
            />
            <Text
              style={[
                styles.modeTabText,
                chatMode === "ai" && styles.modeTabTextActive,
              ]}
            >
              Chat with AI Expert
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              chatMode === "human" && styles.modeTabActiveHuman,
            ]}
            onPress={() => setChatMode("human")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isEngineer ? "account-group" : "account-hard-hat"}
              size={16}
              color={chatMode === "human" ? "#ffffff" : "#2563eb"}
            />
            <Text
              style={[
                styles.modeTabText,
                chatMode === "human" && styles.modeTabTextActive,
              ]}
            >
              {isEngineer ? "Client Chat" : "Chat with Human Expert"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FOR CLIENT IN HUMAN MODE: Switch between 3 Engineers (Arc, Structure Eng, Soil Eng) */}
        {chatMode === "human" && !isEngineer && (
          <View style={styles.engineerSwitchBar}>
            <Text style={styles.engineerSwitchLabel}>Select Human Engineer to Consult:</Text>
            <View style={styles.engineerTabsRow}>
              {ENGINEER_CHIPS.map((chip) => {
                const isActive = selectedDiscipline === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.engineerTab, isActive && styles.engineerTabActive]}
                    activeOpacity={0.75}
                    onPress={() => setSelectedDiscipline(chip.id)}
                  >
                    <MaterialCommunityIcons
                      name={chip.icon}
                      size={16}
                      color={isActive ? "#ffffff" : "#475569"}
                    />
                    <Text
                      style={[
                        styles.engineerTabText,
                        isActive && styles.engineerTabTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* FOR CLIENT IN AI MODE: Quick hint with switch to human */}
        {chatMode === "ai" && !isEngineer && (
          <View style={styles.aiHintBanner}>
            <View style={styles.aiHintLeft}>
              <Ionicons name="information-circle-outline" size={15} color="#4f46e5" />
              <Text style={styles.aiHintText}>
                Instant BNBC 2020 answers from Gemini AI. Need IEB sealed drawings?
              </Text>
            </View>
            <TouchableOpacity
              style={styles.aiHintBtn}
              onPress={() => setChatMode("human")}
            >
              <Text style={styles.aiHintBtnText}>Ask Human</Text>
            </TouchableOpacity>
          </View>
        )}



        {/* Active Context Banner if any */}
        {activeContext && (
          <View style={styles.contextBanner}>
            <View style={styles.contextBannerContent}>
              <MaterialCommunityIcons name="office-building-cog" size={15} color="#1d4ed8" />
              <Text style={styles.contextBannerText} numberOfLines={1}>
                Context: {activeContext.floors ? `${activeContext.floors} Fl ` : ""}
                {activeContext.katha ? `• ${activeContext.katha} Katha ` : ""}
                {activeContext.authority ? `• ${activeContext.authority}` : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setActiveContext(null)}>
              <Ionicons name="close" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Starter Chips */}
        <View style={styles.quickChipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsContainer}
          >
            {getQuickPrompts().map((promptText, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                activeOpacity={0.7}
                onPress={() => handleSend(promptText)}
              >
                <Text style={styles.quickChipText}>{promptText}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages Stream */}
        {loadingHistory ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loaderText}>Loading consultation messages...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isAi = msg.senderRole === "ai";
              const isEng = msg.senderRole === "engineer";
              // Determine if this bubble belongs to current user
              const isMyMessage = isEngineer
                ? isEng
                : msg.senderRole === "client" || msg.senderRole === "user";

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isMyMessage ? styles.myRow : styles.otherRow,
                  ]}
                >
                  {/* Left avatar for other party */}
                  {!isMyMessage && (
                    <View
                      style={[
                        styles.avatarBadge,
                        isAi && styles.avatarBadgeAI,
                      ]}
                    >
                      {isAi ? (
                        <Ionicons name="sparkles" size={14} color="#ffffff" />
                      ) : (
                        <MaterialCommunityIcons
                          name={isEngineer ? "account" : "hard-hat"}
                          size={16}
                          color="#ffffff"
                        />
                      )}
                    </View>
                  )}

                  {/* Bubble Content */}
                  <View
                    style={[
                      styles.bubble,
                      isMyMessage
                        ? styles.myBubble
                        : isAi
                        ? styles.aiBubble
                        : styles.otherBubble,
                    ]}
                  >
                    <View style={styles.bubbleHeader}>
                      <Text
                        style={[
                          styles.senderName,
                          isMyMessage
                            ? styles.mySenderName
                            : isAi
                            ? styles.aiSenderName
                            : styles.otherSenderName,
                        ]}
                      >
                        {isMyMessage
                          ? isEngineer
                            ? `You (${activeSpec.roleLabel})`
                            : "You (Client)"
                          : msg.senderName || (isAi ? "CivilHub AI Assistant" : activeSpec.roleLabel)}
                      </Text>
                      <Text
                        style={[
                          styles.timestamp,
                          isMyMessage
                            ? styles.myTimestamp
                            : styles.otherTimestamp,
                        ]}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.messageText,
                        isMyMessage
                          ? styles.myMessageText
                          : isAi
                          ? styles.aiMessageText
                          : styles.otherMessageText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <View style={[styles.messageRow, styles.otherRow]}>
                <View
                  style={[
                    styles.avatarBadge,
                    chatMode === "ai" && styles.avatarBadgeAI,
                  ]}
                >
                  {chatMode === "ai" ? (
                    <Ionicons name="sparkles" size={14} color="#ffffff" />
                  ) : (
                    <MaterialCommunityIcons name="hard-hat" size={16} color="#ffffff" />
                  )}
                </View>
                <View
                  style={[
                    styles.bubble,
                    chatMode === "ai" ? styles.aiBubble : styles.otherBubble,
                    styles.typingBubble,
                  ]}
                >
                  <ActivityIndicator
                    size="small"
                    color={chatMode === "ai" ? "#4f46e5" : "#2563eb"}
                  />
                  <Text style={styles.typingText}>
                    {chatMode === "ai"
                      ? "Gemini AI is analyzing building codes..."
                      : `${activeSpec.name} is preparing consultation...`}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={
              chatMode === "ai"
                ? "Ask AI about BNBC, setbacks, FAR, approvals..."
                : isEngineer
                ? "Type message to Client..."
                : `Ask ${activeSpec.roleLabel}...`
            }
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              chatMode === "ai" && styles.sendButtonAI,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  headerIconCircleAI: {
    backgroundColor: "#eef2ff",
    borderColor: "#c7d2fe",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionBtn: {
    padding: 6,
  },
  modeToggleBar: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 6,
  },
  modeTabActiveAI: {
    backgroundColor: "#4f46e5",
    borderColor: "#4338ca",
  },
  modeTabActiveHuman: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  modeTabTextActive: {
    color: "#ffffff",
  },
  aiHintBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e7ff",
  },
  aiHintLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  aiHintText: {
    fontSize: 11,
    color: "#4338ca",
    fontWeight: "500",
  },
  aiHintBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiHintBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  engineerSwitchBar: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  engineerSwitchLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  engineerTabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  engineerTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 5,
  },
  engineerTabActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  engineerTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  engineerTabTextActive: {
    color: "#ffffff",
  },
  engineerInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  engineerInfoBannerText: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "600",
    flex: 1,
  },
  contextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe",
  },
  contextBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  contextBannerText: {
    fontSize: 12,
    color: "#1d4ed8",
    fontWeight: "600",
  },
  quickChipsWrapper: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
  },
  quickChipsContainer: {
    paddingHorizontal: 14,
    gap: 8,
  },
  quickChip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quickChipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loaderText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  avatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  avatarBadgeAI: {
    backgroundColor: "#4f46e5",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  aiBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: "#c7d2fe",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "700",
  },
  mySenderName: {
    color: "#bfdbfe",
  },
  otherSenderName: {
    color: "#2563eb",
  },
  aiSenderName: {
    color: "#4f46e5",
  },
  timestamp: {
    fontSize: 10,
  },
  myTimestamp: {
    color: "#bfdbfe",
  },
  otherTimestamp: {
    color: "#94a3b8",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  myMessageText: {
    color: "#ffffff",
  },
  otherMessageText: {
    color: "#1e293b",
  },
  aiMessageText: {
    color: "#0f172a",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 90,
    color: "#0f172a",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonAI: {
    backgroundColor: "#4f46e5",
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});
