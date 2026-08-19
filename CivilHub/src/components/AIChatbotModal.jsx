// src/components/AIChatbotModal.jsx
// -----------------------------------------------------------------------------
// Full-screen modal chat interface for asking the Gemini-powered building
// code assistant questions. Keeps its own local message history in state
// (reset each time the modal closes) and delegates the API call to
// geminiService.askBuildingCodeAI.
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

  const sendMessage = async (textOverride) => {
    const text = (textOverride ?? inputText).trim();
    if (!text || loading) return;

    const userMessage = { id: nextId(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const answer = await askBuildingCodeAI(text);
      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: error.message || "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      // Auto-scroll to the latest message once it's rendered.
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
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
            <Ionicons name="sparkles" size={14} color="#ffffff" />
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
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={20} color="#2563eb" />
            <Text style={styles.headerTitle}>Building Code AI Assistant</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color="#1e293b" />
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
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Suggested questions — shown only before the user has asked anything */}
          {messages.length === 1 && (
            <View style={styles.suggestionsWrap}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(q)}
                >
                  <Text style={styles.suggestionChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading && (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.typingText}>Thinking through BNBC & RAJUK rules...</Text>
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
            >
              <Ionicons name="send" size={18} color="#ffffff" />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
  },
  bubbleError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  bubbleTextUser: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextAssistant: {
    color: "#1e293b",
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  suggestionChipText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1e293b",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
});
