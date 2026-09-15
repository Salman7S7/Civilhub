// src/screens/ExpertChatScreen.jsx
// -----------------------------------------------------------------------------
// Main screen for Feature: "Chat with Expert" (Hybrid Model).
// Provides:
//   1. AI Civil Engineering Consultant triage (BNBC 2020 & RAJUK rules)
//   2. Active plot/project context banner
//   3. Quick discussion starter prompt chips
//   4. Polymorphic message bubbles (User, AI Consultant, Human Engineer)
//   5. Escalation prompt to connect with licensed human engineers
//   6. Persistent chat history with AsyncStorage
// -----------------------------------------------------------------------------

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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getChatHistory,
  appendChatMessage,
  clearChatHistory,
  queryAiCivilExpert,
} from "../services/expertChatService";
import ExpertDirectoryModal from "../components/chat/ExpertDirectoryModal";

const QUICK_STARTER_PROMPTS = [
  { label: "📐 Setbacks", prompt: "What are the front, rear, and side setback rules under RAJUK?" },
  { label: "🏗️ Soil & Piling", prompt: "When is cast-in-situ bored piling mandatory according to BNBC 2020?" },
  { label: "🏢 Permissible FAR", prompt: "How is FAR (Floor Area Ratio) calculated for a multi-story building?" },
  { label: "💰 Construction Cost", prompt: "What is the average RCC structural cost per sqft in Dhaka right now?" },
  { label: "🚗 Parking Rules", prompt: "What is the mandatory car parking requirement for residential apartments?" },
];

export default function ExpertChatScreen({ route, navigation, onOpenExpertDirectory }) {
  // Extract initial context passed from Feasibility or Design Suggestions screens
  const initialContext = route?.params?.initialContext || null;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeContext, setActiveContext] = useState(initialContext);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [directoryVisible, setDirectoryVisible] = useState(false);

  const scrollViewRef = useRef(null);

  // Sync route params when navigated with new parameters
  useEffect(() => {
    if (route?.params?.initialContext) {
      setActiveContext(route.params.initialContext);
    }
  }, [route?.params?.initialContext]);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  // Auto-scroll to bottom on new messages or typing
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending a message
  const handleSend = async (textToSend = inputText) => {
    const trimmed = (textToSend || "").trim();
    if (!trimmed || isTyping) return;

    setInputText("");

    // 1. Optimistically append user message
    try {
      const savedUserMsg = await appendChatMessage({
        text: trimmed,
        senderRole: "user",
        senderName: "Landowner",
        attachedContext: activeContext,
      });

      setMessages((prev) => [...prev, savedUserMsg]);
      setIsTyping(true);

      // 2. Query AI Civil Engineering Consultant
      const aiResponse = await queryAiCivilExpert(trimmed, activeContext);

      // 3. Persist AI response
      const savedAiMsg = await appendChatMessage(aiResponse);
      setMessages((prev) => [...prev, savedAiMsg]);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to process message.");
    } finally {
      setIsTyping(false);
    }
  };

  // Reset conversation
  const handleClearHistory = () => {
    Alert.alert(
      "Reset Conversation",
      "Are you sure you want to clear this engineering consultation thread?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            const resetMessages = await clearChatHistory();
            setMessages(resetMessages);
          },
        },
      ]
    );
  };

  // Trigger Human Expert Directory
  const handleEscalateToHuman = (attachedContext = null) => {
    if (attachedContext) {
      setActiveContext(attachedContext);
    }
    setDirectoryVisible(true);
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
              <MaterialCommunityIcons name="hard-hat" size={22} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Civil Engineering Expert</Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>AI Consultant Active (BNBC 2020)</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerDirectoryBtn}
              activeOpacity={0.8}
              onPress={() => handleEscalateToHuman()}
            >
              <Ionicons name="people" size={16} color="#ffffff" />
              <Text style={styles.headerDirectoryBtnText}>Engineers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleClearHistory}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Context Banner */}
        {activeContext && (
          <View style={styles.contextBanner}>
            <View style={styles.contextBannerContent}>
              <MaterialCommunityIcons name="office-building-cog" size={16} color="#1d4ed8" />
              <Text style={styles.contextBannerText} numberOfLines={1}>
                Active Context:{" "}
                {activeContext.floors ? `${activeContext.floors} Stories` : ""}
                {activeContext.katha ? ` • ${activeContext.katha} Katha` : ""}
                {activeContext.authority ? ` • ${activeContext.authority}` : " • BNBC"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveContext(null)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Discussion Starter Chips */}
        <View style={styles.quickChipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsContainer}
          >
            {QUICK_STARTER_PROMPTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                activeOpacity={0.7}
                onPress={() => handleSend(item.prompt)}
              >
                <Text style={styles.quickChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages Stream */}
        {loadingHistory ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loaderText}>Loading consultation history...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.senderRole === "user" ? styles.userRow : styles.expertRow,
                ]}
              >
                {/* AI / Expert Avatar */}
                {msg.senderRole !== "user" && (
                  <View
                    style={[
                      styles.avatarBadge,
                      msg.senderRole === "human_expert"
                        ? styles.humanAvatarBadge
                        : styles.aiAvatarBadge,
                    ]}
                  >
                    {msg.senderRole === "human_expert" ? (
                      <MaterialCommunityIcons name="account-tie" size={16} color="#ffffff" />
                    ) : (
                      <MaterialCommunityIcons name="robot" size={16} color="#ffffff" />
                    )}
                  </View>
                )}

                {/* Message Bubble */}
                <View
                  style={[
                    styles.bubble,
                    msg.senderRole === "user"
                      ? styles.userBubble
                      : msg.senderRole === "human_expert"
                      ? styles.humanBubble
                      : styles.aiBubble,
                  ]}
                >
                  {/* Sender Header */}
                  <View style={styles.bubbleHeader}>
                    <Text
                      style={[
                        styles.senderName,
                        msg.senderRole === "user"
                          ? styles.userSenderName
                          : msg.senderRole === "human_expert"
                          ? styles.humanSenderName
                          : styles.aiSenderName,
                      ]}
                    >
                      {msg.senderName}
                    </Text>
                    <Text
                      style={[
                        styles.timestamp,
                        msg.senderRole === "user"
                          ? styles.userTimestamp
                          : styles.expertTimestamp,
                      ]}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>

                  {/* Body Text */}
                  <Text
                    style={[
                      styles.messageText,
                      msg.senderRole === "user"
                        ? styles.userMessageText
                        : styles.expertMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Attached Project Specs Tag */}
                  {msg.attachedContext && (
                    <View style={styles.attachedContextPill}>
                      <Ionicons name="document-text-outline" size={11} color="#94a3b8" />
                      <Text style={styles.attachedContextText}>
                        Ref: {msg.attachedContext.floors ? `${msg.attachedContext.floors}fl ` : ""}
                        {msg.attachedContext.katha ? `${msg.attachedContext.katha}kt` : ""}
                      </Text>
                    </View>
                  )}

                  {/* Escalation Recommendation Button */}
                  {msg.isEscalationPrompt && (
                    <TouchableOpacity
                      style={styles.escalationButton}
                      activeOpacity={0.85}
                      onPress={() => handleEscalateToHuman(msg.attachedContext)}
                    >
                      <Ionicons name="shield-checkmark" size={15} color="#ffffff" />
                      <Text style={styles.escalationButtonText}>
                        Connect with Licensed Human Engineer
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <View style={[styles.messageRow, styles.expertRow]}>
                <View style={[styles.avatarBadge, styles.aiAvatarBadge]}>
                  <MaterialCommunityIcons name="robot" size={16} color="#ffffff" />
                </View>
                <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#93c5fd" />
                  <Text style={styles.typingText}>Consulting BNBC 2020 rules...</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Message Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about setbacks, FAR, soil tests, or costs..."
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
              <Ionicons name="send" size={17} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Verified Human Engineer Directory Modal */}
      <ExpertDirectoryModal
        visible={directoryVisible}
        onClose={() => setDirectoryVisible(false)}
        onSelectExpert={(newMsg) => {
          setMessages((prev) => [...prev, newMsg]);
        }}
        activeContext={activeContext}
      />
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10b981",
  },
  statusText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerDirectoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerDirectoryBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  headerActionBtn: {
    padding: 4,
  },
  contextBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
  },
  contextBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  contextBannerText: {
    fontSize: 12,
    color: "#1e40af",
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickChipText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: "#64748b",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  expertRow: {
    justifyContent: "flex-start",
  },
  avatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  aiAvatarBadge: {
    backgroundColor: "#1e293b",
  },
  humanAvatarBadge: {
    backgroundColor: "#b45309",
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 4,
  },
  humanBubble: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#d97706",
    borderBottomLeftRadius: 4,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 10,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "700",
  },
  userSenderName: {
    color: "#dbeafe",
  },
  aiSenderName: {
    color: "#93c5fd",
  },
  humanSenderName: {
    color: "#fbbf24",
  },
  timestamp: {
    fontSize: 9,
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  expertTimestamp: {
    color: "#94a3b8",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userMessageText: {
    color: "#ffffff",
  },
  expertMessageText: {
    color: "#f1f5f9",
  },
  attachedContextPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  attachedContextText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  escalationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d97706",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  escalationButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  typingText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 100,
    fontSize: 13,
    color: "#0f172a",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.7,
  },
});
