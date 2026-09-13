// src/components/chat/ExpertDirectoryModal.jsx
// -----------------------------------------------------------------------------
// Verified Human Engineer & Architect Directory Modal for CivilHub.
// Allows landowners to browse IEB-accredited Bangladeshi engineering
// consultants, view credentials, and initiate a direct consultation handoff.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getAvailableExperts,
  appendChatMessage,
} from "../../services/expertChatService";

const SPECIALTY_FILTERS = [
  { id: "all", label: "All Specialists" },
  { id: "structural", label: "Structural" },
  { id: "arch", label: "Architecture / RAJUK" },
  { id: "soil", label: "Soil & Foundation" },
];

export default function ExpertDirectoryModal({
  visible,
  onClose,
  onSelectExpert,
  activeContext,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const experts = getAvailableExperts();

  // Filter experts by specialty
  const filteredExperts = experts.filter((e) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "structural") {
      return e.specialties.some((s) => s.toLowerCase().includes("struct"));
    }
    if (activeFilter === "arch") {
      return e.specialties.some(
        (s) =>
          s.toLowerCase().includes("arch") || s.toLowerCase().includes("rajuk")
      );
    }
    if (activeFilter === "soil") {
      return e.specialties.some(
        (s) =>
          s.toLowerCase().includes("soil") ||
          s.toLowerCase().includes("pile") ||
          s.toLowerCase().includes("geotech")
      );
    }
    return true;
  });

  // Handle consultation initiation
  const handleConsult = async (expert) => {
    try {
      // Build greeting from engineer
      let contextNote = "";
      if (activeContext) {
        const parts = [];
        if (activeContext.floors) parts.push(`${activeContext.floors} stories`);
        if (activeContext.katha) parts.push(`${activeContext.katha} Katha`);
        if (activeContext.authority) parts.push(activeContext.authority);
        if (parts.length > 0) {
          contextNote = ` regarding your ${parts.join(", ")} project`;
        }
      }

      const engineerGreeting = {
        senderRole: "human_expert",
        senderName: expert.name,
        text: `Hello! I am ${expert.name} (${expert.iebNumber}). I have received your consultation request${contextNote}. How can I assist with your structural drawings, soil test review, or RAJUK approvals?`,
        attachedContext: activeContext || null,
        isEscalationPrompt: false,
      };

      const saved = await appendChatMessage(engineerGreeting);

      if (onSelectExpert) {
        onSelectExpert(saved);
      }

      onClose();
    } catch (err) {
      Alert.alert("Error", err.message || "Could not initiate consultation.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Verified Engineers & Architects</Text>
            <Text style={styles.headerSubtitle}>
              IEB registered consultants in Bangladesh
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Active Context Banner */}
        {activeContext && (
          <View style={styles.contextPillBar}>
            <MaterialCommunityIcons name="link-variant" size={14} color="#2563eb" />
            <Text style={styles.contextPillText}>
              Attaching: {activeContext.floors ? `${activeContext.floors} Fl • ` : ""}
              {activeContext.katha ? `${activeContext.katha} Katha • ` : ""}
              {activeContext.authority || "BNBC 2020"}
            </Text>
          </View>
        )}

        {/* Specialty Filter Chips */}
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsContainer}
          >
            {SPECIALTY_FILTERS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filterChip,
                  activeFilter === item.id && styles.activeFilterChip,
                ]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === item.id && styles.activeFilterChipText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Engineers List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredExperts.map((expert) => (
            <View key={expert.id} style={styles.card}>
              {/* Profile Top Row */}
              <View style={styles.profileRow}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={{ uri: expert.avatarUrl }}
                    style={styles.avatarImage}
                  />
                  <View
                    style={[
                      styles.statusDot,
                      expert.isAvailable ? styles.onlineDot : styles.offlineDot,
                    ]}
                  />
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.expertName}>{expert.name}</Text>
                  <Text style={styles.expertTitle}>{expert.title}</Text>
                  <Text style={styles.expertOrg}>{expert.organization}</Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.iebBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#15803d" />
                      <Text style={styles.iebBadgeText}>{expert.iebNumber}</Text>
                    </View>

                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#eab308" />
                      <Text style={styles.ratingText}>{expert.rating}</Text>
                      <Text style={styles.consultCount}>
                        ({expert.consultationsCount})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bio & Experience */}
              <Text style={styles.bioText}>{expert.shortBio}</Text>

              {/* Specialties Tag Cloud */}
              <View style={styles.tagsContainer}>
                {expert.specialties.map((tag, idx) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.consultButton,
                  !expert.isAvailable && styles.consultButtonUnavailable,
                ]}
                activeOpacity={0.85}
                onPress={() => handleConsult(expert)}
              >
                <Ionicons
                  name={expert.isAvailable ? "chatbubbles" : "mail"}
                  size={16}
                  color="#ffffff"
                />
                <Text style={styles.consultButtonText}>
                  {expert.isAvailable
                    ? `Consult ${expert.name.split(" ")[1] || "Engineer"}`
                    : "Leave Consultation Message"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
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
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  contextPillBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
  },
  contextPillText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "600",
  },
  filterRow: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  filterChipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  activeFilterChip: {
    backgroundColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  activeFilterChipText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#e2e8f0",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  onlineDot: {
    backgroundColor: "#10b981",
  },
  offlineDot: {
    backgroundColor: "#94a3b8",
  },
  profileInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  expertTitle: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 1,
  },
  expertOrg: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  iebBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  iebBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  consultCount: {
    fontSize: 10,
    color: "#94a3b8",
  },
  bioText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginTop: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tagBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
  },
  consultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  consultButtonUnavailable: {
    backgroundColor: "#475569",
  },
  consultButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
