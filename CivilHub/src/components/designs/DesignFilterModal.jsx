// src/components/designs/DesignFilterModal.jsx
// -----------------------------------------------------------------------------
// Interactive filter modal allowing users to filter architectural designs by:
//   - Number of Floors (5 Story / 10 Story)
//   - Basement (Yes / No)
//   - Car Garage (Yes / No)
//   - Rooftop Type (Garden / Open Terrace / Helipad)
//   - Minimum Land (3 Katha / 4 Katha / 5+ Katha)
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { filterDesignsLocally } from "../../services/designService";
import { MOCK_DESIGNS } from "../../services/mockDesigns";

export const DEFAULT_FILTERS = {
  floors: "all",
  has_basement: "all",
  has_garage: "all",
  rooftop_type: "all",
  min_katha: "all",
};

export default function DesignFilterModal({
  visible,
  onClose,
  initialFilters = DEFAULT_FILTERS,
  onApply,
}) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  // Sync draft filters whenever modal opens with current filters
  useEffect(() => {
    if (visible) {
      setDraftFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  // Calculate live matching count for draft filters
  const matchCount = filterDesignsLocally(MOCK_DESIGNS, draftFilters).length;

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  const isFilterActive = (key, val) => draftFilters[key] === val;

  const setFilterVal = (key, val) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: prev[key] === val && val !== "all" ? "all" : val,
    }));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle Indicator */}
              <View style={styles.handleIndicator} />

              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Filter Designs</Text>
                  <Text style={styles.headerSubtitle}>
                    Customize criteria for your plot & building goals
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.bodyScroll}
                contentContainerStyle={styles.bodyScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Number of Floors */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons
                      name="office-building"
                      size={18}
                      color="#2563eb"
                    />
                    <Text style={styles.sectionTitle}>Number of Floors</Text>
                  </View>
                  <View style={styles.pillGroup}>
                    {[
                      { label: "All Stories", value: "all" },
                      { label: "5 Story Building", value: "5" },
                      { label: "10 Story Building", value: "10" },
                    ].map((opt) => {
                      const active = isFilterActive("floors", opt.value);
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.pill, active && styles.activePill]}
                          onPress={() => setFilterVal("floors", opt.value)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              active && styles.activePillText,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Basement Requirement */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons
                      name="arrow-down-bold-box"
                      size={18}
                      color="#7c3aed"
                    />
                    <Text style={styles.sectionTitle}>Basement</Text>
                  </View>
                  <View style={styles.pillGroup}>
                    {[
                      { label: "Any", value: "all" },
                      { label: "With Basement (Yes)", value: true },
                      { label: "No Basement", value: false },
                    ].map((opt) => {
                      const active = isFilterActive("has_basement", opt.value);
                      return (
                        <TouchableOpacity
                          key={String(opt.value)}
                          style={[styles.pill, active && styles.activePill]}
                          onPress={() => setFilterVal("has_basement", opt.value)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              active && styles.activePillText,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Car Garage */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="car-sport" size={18} color="#059669" />
                    <Text style={styles.sectionTitle}>Car Garage / Parking</Text>
                  </View>
                  <View style={styles.pillGroup}>
                    {[
                      { label: "Any", value: "all" },
                      { label: "With Garage (Yes)", value: true },
                      { label: "No Garage", value: false },
                    ].map((opt) => {
                      const active = isFilterActive("has_garage", opt.value);
                      return (
                        <TouchableOpacity
                          key={String(opt.value)}
                          style={[styles.pill, active && styles.activePill]}
                          onPress={() => setFilterVal("has_garage", opt.value)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              active && styles.activePillText,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Rooftop Type */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="leaf" size={18} color="#16a34a" />
                    <Text style={styles.sectionTitle}>Rooftop Type</Text>
                  </View>
                  <View style={styles.pillGroup}>
                    {[
                      { label: "Any Rooftop", value: "all" },
                      { label: "🌱 Rooftop Garden", value: "Garden" },
                      { label: "⛅ Open Terrace", value: "Open Terrace" },
                      { label: "🚁 Helipad", value: "Helipad" },
                    ].map((opt) => {
                      const active = isFilterActive("rooftop_type", opt.value);
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.pill, active && styles.activePill]}
                          onPress={() => setFilterVal("rooftop_type", opt.value)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              active && styles.activePillText,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 5. Minimum Land Amount (Katha) */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="resize" size={18} color="#d97706" />
                    <Text style={styles.sectionTitle}>Land Area Threshold</Text>
                  </View>
                  <View style={styles.pillGroup}>
                    {[
                      { label: "Any Katha", value: "all" },
                      { label: "3.0 - 3.5 Katha", value: "3.5" },
                      { label: "4.0 - 4.5 Katha", value: "4.5" },
                      { label: "5.0+ Katha", value: "7.5" },
                    ].map((opt) => {
                      const active = isFilterActive("min_katha", opt.value);
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.pill, active && styles.activePill]}
                          onPress={() => setFilterVal("min_katha", opt.value)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              active && styles.activePillText,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  activeOpacity={0.8}
                  onPress={handleReset}
                >
                  <Ionicons name="refresh-outline" size={16} color="#64748b" />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  activeOpacity={0.88}
                  onPress={handleApply}
                >
                  <Text style={styles.applyButtonText}>
                    Show {matchCount} {matchCount === 1 ? "Design" : "Designs"}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleIndicator: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  bodyScroll: {
    paddingHorizontal: 20,
  },
  bodyScrollContent: {
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 6,
  },
  pillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activePill: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  activePillText: {
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  applyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
