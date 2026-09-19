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
  getThreadIdForEngineer,
  ENGINEER_SPECS,
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

  // For Client: can switch which engineer to consult (Arc, Structure Eng, Soil Eng)
  // For Engineer: locked strictly to their own discipline to talk to Client only!
  const [selectedDiscipline, setSelectedDiscipline] = useState(
    isEngineer ? engineerDiscipline : "structural"
  );

  const activeDiscipline = isEngineer ? engineerDiscipline : selectedDiscipline;
  const activeThreadId = getThreadIdForEngineer(activeDiscipline);
  const activeSpec = ENGINEER_SPECS[activeDiscipline] || ENGINEER_SPECS.structural;

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

    if (isEngineer) {
      // 1. ENGINEER LOGGED IN: Talks to Client only
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
      // 2. CLIENT LOGGED IN: Sends question to active Engineer
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
      "Are you sure you want to clear this consultation thread?",
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

  // Quick starter prompts based on user role and discipline
  const getQuickPrompts = () => {
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
            <View style={styles.headerIconCircle}>
              <MaterialCommunityIcons
                name={isEngineer ? "hard-hat" : "account-tie"}
                size={22}
                color="#2563eb"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>
                {isEngineer ? "Client Consultation" : activeSpec.roleLabel}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEngineer
                  ? "Direct Client Consultation"
                  : `Consulting ${activeSpec.name}`}
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

        {/* FOR CLIENT: Switch between 3 Engineers (Arc, Structure Eng, Soil Eng) */}
        {!isEngineer && (
          <View style={styles.engineerSwitchBar}>
            <Text style={styles.engineerSwitchLabel}>Select Engineer to Chat With:</Text>
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
              // Determine if this bubble belongs to current user
              const isMyMessage = isEngineer
                ? msg.senderRole === "engineer"
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
                    <View style={styles.avatarBadge}>
                      <MaterialCommunityIcons
                        name={isEngineer ? "account" : "hard-hat"}
                        size={16}
                        color="#ffffff"
                      />
                    </View>
                  )}

                  {/* Bubble Content */}
                  <View
                    style={[
                      styles.bubble,
                      isMyMessage ? styles.myBubble : styles.otherBubble,
                    ]}
                  >
                    <View style={styles.bubbleHeader}>
                      <Text
                        style={[
                          styles.senderName,
                          isMyMessage
                            ? styles.mySenderName
                            : styles.otherSenderName,
                        ]}
                      >
                        {isMyMessage
                          ? isEngineer
                            ? `You (${activeSpec.roleLabel})`
                            : "You (Client)"
                          : msg.senderName || (isEngineer ? "Client" : activeSpec.roleLabel)}
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
                <View style={styles.avatarBadge}>
                  <MaterialCommunityIcons name="hard-hat" size={16} color="#ffffff" />
                </View>
                <View style={[styles.bubble, styles.otherBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.typingText}>
                    {activeSpec.name} is preparing consultation...
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
              isEngineer
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
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});
