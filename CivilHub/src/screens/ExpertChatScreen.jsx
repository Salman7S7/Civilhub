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
  queryAiExpert,
  getThreadIdForEngineer,
  getAvailableExperts,
  getExpertById,
  AI_SPEC,
  ENGINEER_SPECS,
  VERIFIED_EXPERTS,
  THREAD_AI,
} from "../services/expertChatService";

const DISCIPLINE_FILTERS = [
  { id: "all", label: "All Experts" },
  { id: "architect", label: "Architects" },
  { id: "structural", label: "Structural" },
  { id: "soil", label: "Soil / Geotech" },
];

export default function ExpertChatScreen({ route, session }) {
  const user = session?.user;
  const isEngineer = user?.role === "engineer";
  const engineerDiscipline = user?.engineerType || "structural";

  // 2 Chat Options: "ai" (Chat with AI Expert) vs "human" (Chat with Human Expert)
  // Default to "ai" for clients; default to "human" for engineers (client consultation)
  const [chatMode, setChatMode] = useState(isEngineer ? "human" : "ai");

  // For Client in Human mode: select specific verified expert (null displays Messenger directory)
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("all");

  const selectedExpert = selectedExpertId ? getExpertById(selectedExpertId) : null;
  const activeDiscipline = isEngineer
    ? engineerDiscipline
    : selectedExpert?.discipline || "structural";

  const activeThreadId =
    chatMode === "ai"
      ? THREAD_AI
      : isEngineer
      ? getThreadIdForEngineer(engineerDiscipline)
      : selectedExpert
      ? selectedExpert.threadId
      : "thread_client_structural_1";

  const activeSpec =
    chatMode === "ai"
      ? AI_SPEC
      : isEngineer
      ? ENGINEER_SPECS[engineerDiscipline] || ENGINEER_SPECS.structural
      : selectedExpert || VERIFIED_EXPERTS[0];

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
      // 3. CLIENT LOGGED IN: Sends question to active Human Engineer (No automated bot reply)
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
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to send message.");
      }
    }
  };

  // Reset conversation
  const handleClearHistory = async () => {
    const threadName =
      chatMode === "ai"
        ? "AI conversation"
        : `${activeSpec.roleLabel} consultation`;
    const confirmMessage = `Are you sure you want to clear this ${threadName}?`;

    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm(confirmMessage);
        if (confirmed) {
          try {
            const resetMessages = await clearChatHistory(activeThreadId);
            setMessages(resetMessages);
          } catch (err) {
            console.error("Failed to clear chat history:", err);
          }
        }
      }
      return;
    }

    Alert.alert("Reset Conversation", confirmMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear Thread",
        style: "destructive",
        onPress: async () => {
          try {
            const resetMessages = await clearChatHistory(activeThreadId);
            setMessages(resetMessages);
          } catch (err) {
            console.error("Failed to clear chat history:", err);
          }
        },
      },
    ]);
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

  // Filter experts for the Messenger-style directory
  const filteredExperts = VERIFIED_EXPERTS.filter((exp) => {
    if (filterDiscipline !== "all" && exp.discipline !== filterDiscipline) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = exp.name.toLowerCase().includes(q);
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchFirm = exp.firm.toLowerCase().includes(q);
      const matchLicense = exp.license.toLowerCase().includes(q);
      const matchSpecialty = exp.specialties?.some((s) => s.toLowerCase().includes(q));
      return matchName || matchTitle || matchFirm || matchLicense || matchSpecialty;
    }
    return true;
  });

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
                  name={isEngineer ? "hard-hat" : selectedExpert ? "account-tie" : "account-group"}
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
                  : selectedExpert
                  ? selectedExpert.name
                  : "Verified Civil Experts"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {chatMode === "ai"
                  ? "Powered by Google Gemini & BNBC 2020"
                  : isEngineer
                  ? "Direct Client Consultation"
                  : selectedExpert
                  ? `${selectedExpert.roleLabel} • ${selectedExpert.license}`
                  : "Browse & consult licensed professionals"}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {chatMode === "human" && !isEngineer && !selectedExpert ? (
              <View style={styles.verifiedCountBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.verifiedCountText}>
                  {VERIFIED_EXPERTS.length} Verified
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={handleClearHistory}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Clear chat history"
              >
                <Ionicons name="trash-outline" size={19} color="#ef4444" />
              </TouchableOpacity>
            )}
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

        {/* MESSENGER-STYLE EXPERT DIRECTORY (When in Human mode & no expert is selected) */}
        {chatMode === "human" && !isEngineer && !selectedExpert ? (
          <View style={styles.directoryContainer}>
            {/* Search Input */}
            <View style={styles.searchBarWrapper}>
              <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, license, firm, or specialty..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Discipline Filter Chips */}
            <View style={styles.filterChipsRow}>
              {DISCIPLINE_FILTERS.map((filter) => {
                const isActive = filterDiscipline === filter.id;
                const count =
                  filter.id === "all"
                    ? VERIFIED_EXPERTS.length
                    : VERIFIED_EXPERTS.filter((e) => e.discipline === filter.id).length;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterDiscipline(filter.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                      ]}
                    >
                      {filter.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Experts List */}
            <ScrollView
              style={styles.expertsScrollView}
              contentContainerStyle={styles.expertsListContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.directoryHeaderRow}>
                <Text style={styles.directorySectionTitle}>
                  Available Verified Consultants
                </Text>
                <Text style={styles.directorySectionSub}>
                  {filteredExperts.length} online
                </Text>
              </View>

              {filteredExperts.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <MaterialCommunityIcons name="account-search" size={48} color="#94a3b8" />
                  <Text style={styles.emptyStateTitle}>No experts found</Text>
                  <Text style={styles.emptyStateSub}>
                    Try searching with different keywords or switch filter categories.
                  </Text>
                </View>
              ) : (
                filteredExperts.map((expert) => (
                  <TouchableOpacity
                    key={expert.id}
                    style={styles.expertCard}
                    activeOpacity={0.7}
                    onPress={() => setSelectedExpertId(expert.id)}
                  >
                    <View style={styles.expertCardHeader}>
                      {/* Avatar with Initials & Online dot */}
                      <View style={styles.avatarWrapper}>
                        <View
                          style={[
                            styles.expertAvatar,
                            { backgroundColor: expert.avatarColor || "#2563eb" },
                          ]}
                        >
                          <Text style={styles.expertAvatarText}>
                            {expert.avatarInitials}
                          </Text>
                        </View>
                        <View style={styles.onlineDot} />
                      </View>

                      {/* Main Info */}
                      <View style={styles.expertCardMain}>
                        <View style={styles.expertNameRow}>
                          <Text style={styles.expertCardName} numberOfLines={1}>
                            {expert.name}
                          </Text>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#2563eb"
                            style={styles.verifiedIcon}
                          />
                        </View>
                        <Text style={styles.expertCardTitle} numberOfLines={1}>
                          {expert.title}
                        </Text>
                        <Text style={styles.expertCardMeta} numberOfLines={1}>
                          <Text style={styles.licenseHighlight}>{expert.license}</Text>
                          {" • "}
                          {expert.firm}
                        </Text>
                      </View>

                      {/* Rating Badge */}
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={13} color="#f59e0b" />
                        <Text style={styles.ratingBadgeText}>
                          {expert.rating.split(" ")[0]}
                        </Text>
                      </View>
                    </View>

                    {/* Specialties Chips */}
                    <View style={styles.specialtiesWrapper}>
                      {expert.specialties.map((spec, sIdx) => (
                        <View key={sIdx} style={styles.specialtyChip}>
                          <Text style={styles.specialtyChipText}>{spec}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Card Footer: Action Button */}
                    <View style={styles.expertCardFooter}>
                      <Text style={styles.experienceText}>
                        {expert.experience}
                      </Text>
                      <View style={styles.chatActionBtn}>
                        <Text style={styles.chatActionBtnText}>Chat Now</Text>
                        <Ionicons name="chevron-forward" size={14} color="#ffffff" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        ) : (
          /* ACTIVE CHAT VIEW (AI mode, or Selected Expert, or Engineer mode) */
          <>
            {/* When chatting with a selected expert: Sub-header with Back Button */}
            {chatMode === "human" && !isEngineer && selectedExpert && (
              <View style={styles.expertActiveSubHeader}>
                <TouchableOpacity
                  style={styles.backToExpertsBtn}
                  onPress={() => setSelectedExpertId(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color="#2563eb" />
                  <Text style={styles.backToExpertsBtnText}>All Experts</Text>
                </TouchableOpacity>

                <View style={styles.expertActiveInfo}>
                  <View
                    style={[
                      styles.miniAvatar,
                      { backgroundColor: selectedExpert.avatarColor || "#2563eb" },
                    ]}
                  >
                    <Text style={styles.miniAvatarText}>
                      {selectedExpert.avatarInitials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expertActiveName} numberOfLines={1}>
                      {selectedExpert.name}
                    </Text>
                    <Text style={styles.expertActiveRole} numberOfLines={1}>
                      {selectedExpert.license} • {selectedExpert.firm}
                    </Text>
                  </View>
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
                            isEng && selectedExpert?.avatarColor && {
                              backgroundColor: selectedExpert.avatarColor,
                            },
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
                    : selectedExpert
                    ? `Ask ${selectedExpert.name}...`
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
          </>
        )}
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
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
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
  verifiedCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  verifiedCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  directoryContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    padding: 0,
  },
  filterChipsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  expertsScrollView: {
    flex: 1,
  },
  expertsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  directoryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  directorySectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  directorySectionSub: {
    fontSize: 11,
    color: "#64748b",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  emptyStateSub: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  expertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },
  expertCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  expertAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  expertAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  expertCardMain: {
    flex: 1,
    gap: 2,
  },
  expertNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expertCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  expertCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  expertCardMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  licenseHighlight: {
    fontWeight: "600",
    color: "#334155",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  specialtiesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specialtyChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  specialtyChipText: {
    fontSize: 11,
    color: "#475569",
  },
  expertCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  experienceText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  chatActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  chatActionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  expertActiveSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 12,
  },
  backToExpertsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 2,
  },
  backToExpertsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },
  expertActiveInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  expertActiveName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  expertActiveRole: {
    fontSize: 10,
    color: "#0284c7",
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
