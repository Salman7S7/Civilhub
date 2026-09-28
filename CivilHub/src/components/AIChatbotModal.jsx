// src/components/AIChatbotModal.jsx
// -----------------------------------------------------------------------------
// Full-screen modal chat interface for asking the Gemini-powered building
// code assistant questions. Keeps its own local message history in state
// (reset each time the modal closes) and delegates the API call to
// geminiService.askBuildingCodeAI.
// Fixed: stable scroll (no jumps/replays) using onContentSizeChange pattern.
// -----------------------------------------------------------------------------
import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { askBuildingCodeAI } from "../services/geminiService";

const SUGGESTED_QUESTIONS = [
  "Can I build 7 stories on a 20ft road under RAJUK?",
  "What is the mandatory FAR setback rule?",
  "Minimum road width for a 10-story building?",
];

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

export default function AIChatbotModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: nextId(),
      role: "assistant",
      text:
        "Hi! I'm your BNBC & RAJUK building code assistant. Ask me anything about height limits, setbacks, FAR, or road-width rules across RAJUK, CDA, RDA, KDA, or municipal regions.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const sendLockRef = useRef(false);
  // Use a flag instead of setTimeout to avoid scroll jumps
  const pendingScrollRef = useRef(false);

  const appendMessage = (message) => {
    pendingScrollRef.current = true;
    setMessages((previous) => [...previous, message]);
  };

  const sendMessage = async (textOverride) => {
    const text = (textOverride ?? inputText).trim();
    if (!text || sendLockRef.current) return;

    sendLockRef.current = true;
    const userMessage = { id: nextId(), role: "user", text };
    appendMessage(userMessage);
    setInputText("");
    setLoading(true);

    try {
      const answer = await askBuildingCodeAI(text);
      appendMessage({ id: nextId(), role: "assistant", text: answer });
    } catch (error) {
      appendMessage({
        id: nextId(),
        role: "assistant",
        text: error.message || "Something went wrong. Please try again.",
        isError: true,
      });
    } finally {
      sendLockRef.current = false;
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.bubbleRow,
          { justifyContent: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        {!isUser && (
          <View style={styles.avatarCircle}>
            <Ionicons name="sparkles" size={13} color="#ffffff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
            item.isError && styles.bubbleError,
          ]}
        >
          <Text style={isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
            {item.text}
          </Text>
        </View>
        {isUser && <View style={styles.userSpacer} />}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={18} color="#ffffff" />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>CivilHub AI Code Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by OpenRouter GPT-4o & BNBC 2020</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            style={styles.messagesListView}
            // Stable scroll: fires natively after layout, no setTimeout jitter
            onContentSizeChange={() => {
              if (pendingScrollRef.current) {
                pendingScrollRef.current = false;
                listRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />

          {/* Suggested questions — shown only before the user has asked anything */}
          {messages.length === 1 && (
            <View style={styles.suggestionsWrap}>
              <Text style={styles.suggestionsLabel}>SUGGESTED QUESTIONS</Text>
              {SUGGESTED_QUESTIONS.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionChipText}>{q}</Text>
                  <View style={styles.suggestionArrow}>
                    <Ionicons name="arrow-up" size={14} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading && (
            <View style={styles.typingRow}>
              <View style={styles.typingAvatar}>
                <Ionicons name="sparkles" size={11} color="#ffffff" />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#4f46e5" />
                <Text style={styles.typingText}>Thinking through BNBC & RAJUK rules...</Text>
              </View>
            </View>
          )}

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about building codes, FAR, setbacks..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.85}
            >
              <Ionicons name="send" size={17} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    width: "100%",
    maxWidth: 780,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginLeft: 10,
  },
  messagesListView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  userSpacer: {
    width: 4,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  bubbleUser: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 5,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  bubbleAssistant: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e0e7ff",
    borderBottomLeftRadius: 5,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleError: {
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
  },
  bubbleTextUser: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextAssistant: {
    color: "#1e293b",
    fontSize: 14,
    lineHeight: 21,
  },
  suggestionsWrap: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: "#f0f4f8",
  },
  suggestionsLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#dde3ed",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionChipText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    paddingRight: 10,
    lineHeight: 18,
  },
  suggestionArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
  },
  typingAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e0e7ff",
    borderRadius: 14,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e8edf2",
    gap: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f4f7fa",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#dde3ed",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: "#1e293b",
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#b0bec9",
    shadowOpacity: 0,
    elevation: 0,
  },
});
