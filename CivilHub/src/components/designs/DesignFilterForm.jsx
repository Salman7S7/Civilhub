// src/components/designs/DesignFilterForm.jsx
// -----------------------------------------------------------------------------
// Interactive on-screen Filter Form where:
//   1. Number of Floors: Direct User Input (e.g. 5, 8, 10 stories)
//   2. Land Amount (Katha): Direct User Input (e.g. 3.5, 4.25, 6.0 Katha)
//   3. Basement: Yes / No / Any Toggle
//   4. Car Garage: Yes / No / Any Toggle
//   5. Rooftop Type: Garden / Open Terrace / Any Toggle
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function DesignFilterForm({
  filters,
  onChangeFilters,
  onResetFilters,
  resultCount,
}) {
  const [expanded, setExpanded] = useState(true);

  // Helper to check if a specific filter value is selected
  const isSelected = (key, val) => filters[key] === val;

  // Toggle or set filter value for options
  const handleSelect = (key, val) => {
    onChangeFilters({
      ...filters,
      [key]: filters[key] === val ? "all" : val,
    });
  };

  // Handle direct user input for Number of Floors
  const handleFloorsChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    onChangeFilters({
      ...filters,
      custom_floors: cleaned,
      floors: cleaned || "all",
    });
  };

  // Handle direct user input for Land Amount in Katha
  const handleKathaChange = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    onChangeFilters({
      ...filters,
      custom_katha: cleaned,
      min_katha: cleaned || "all",
    });
  };

  return (
    <View style={styles.card}>
      {/* Header with Accordion Toggle */}
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="options" size={18} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Architectural Design Filters</Text>
            <Text style={styles.headerSubtitle}>
              Enter your plot specs & amenities to filter models
            </Text>
          </View>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748b"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.formBody}>
          {/* User Input 1 & 2: Number of Floors & Land Amount side-by-side */}
          <View style={styles.inputsRow}>
            {/* 1. Number of Floors (Entered by user) */}
            <View style={styles.inputFieldBlock}>
              <View style={styles.fieldLabelRow}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={15}
                  color="#2563eb"
                />
                <Text style={styles.fieldLabel}>Stories / Floors</Text>
              </View>
              <View style={styles.textInputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 5 or 10"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  value={filters.custom_floors || (filters.floors !== "all" ? String(filters.floors) : "")}
                  onChangeText={handleFloorsChange}
                />
                <Text style={styles.inputUnitBadge}>Stories</Text>
                {(filters.custom_floors || filters.floors !== "all") && (
                  <TouchableOpacity
                    onPress={() => handleFloorsChange("")}
                    style={styles.clearBtn}
                  >
                    <Ionicons name="close-circle" size={15} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 2. Land Amount in Katha (Entered by user) */}
            <View style={styles.inputFieldBlock}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="resize" size={15} color="#d97706" />
                <Text style={styles.fieldLabel}>Land Size (Katha)</Text>
              </View>
              <View style={styles.textInputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 3.5, 5.0"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  value={filters.custom_katha || (filters.min_katha !== "all" ? String(filters.min_katha) : "")}
                  onChangeText={handleKathaChange}
                />
                <Text style={styles.inputUnitBadge}>Katha</Text>
                {(filters.custom_katha || filters.min_katha !== "all") && (
                  <TouchableOpacity
                    onPress={() => handleKathaChange("")}
                    style={styles.clearBtn}
                  >
                    <Ionicons name="close-circle" size={15} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* 3. Basement (Yes / No / Any) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelRow}>
              <MaterialCommunityIcons
                name="arrow-down-bold-box"
                size={15}
                color="#7c3aed"
              />
              <Text style={styles.fieldLabel}>Basement</Text>
            </View>
            <View style={styles.segmentGroup}>
              {[
                { label: "Any", value: "all" },
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((opt) => {
                const active = isSelected("has_basement", opt.value);
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    onPress={() => handleSelect("has_basement", opt.value)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        active && styles.segmentTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Car Garage (Yes / No / Any) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="car-sport" size={15} color="#059669" />
              <Text style={styles.fieldLabel}>Car Garage</Text>
            </View>
            <View style={styles.segmentGroup}>
              {[
                { label: "Any", value: "all" },
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((opt) => {
                const active = isSelected("has_garage", opt.value);
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    onPress={() => handleSelect("has_garage", opt.value)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        active && styles.segmentTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Rooftop Type (Garden / Open Terrace / Any) */}
          <View style={[styles.fieldRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="leaf" size={15} color="#16a34a" />
              <Text style={styles.fieldLabel}>Rooftop Type</Text>
            </View>
            <View style={styles.segmentGroup}>
              {[
                { label: "Any", value: "all" },
                { label: "🌱 Garden", value: "Garden" },
                { label: "⛅ Open Terrace", value: "Open Terrace" },
              ].map((opt) => {
                const active = isSelected("rooftop_type", opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    onPress={() => handleSelect("rooftop_type", opt.value)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        active && styles.segmentTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Footer Reset & Match Result Summary */}
          <View style={styles.formFooter}>
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.8}
              onPress={onResetFilters}
            >
              <Ionicons name="refresh" size={14} color="#64748b" />
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>

            <View style={styles.resultBadge}>
              <Text style={styles.resultBadgeText}>
                {resultCount} {resultCount === 1 ? "Design Match" : "Designs Matching"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  formBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 14,
  },
  inputsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  inputFieldBlock: {
    flex: 1,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginLeft: 5,
  },
  textInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    padding: 0,
  },
  inputUnitBadge: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginLeft: 4,
  },
  clearBtn: {
    marginLeft: 4,
    padding: 2,
  },
  fieldRow: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  segmentGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  segmentBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  segmentTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  formFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    gap: 4,
  },
  resetBtnText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  resultBadge: {
    backgroundColor: "#eff6ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  resultBadgeText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "700",
  },
});
