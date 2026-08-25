// src/components/designs/DesignFilterForm.jsx
// -----------------------------------------------------------------------------
// Interactive on-screen Filter Form collecting all 5 user parameters specified in
// civilhub_mobile_overview.md:
//   1. Number of Floors: 5 Story / 10 Story
//   2. Basement: Yes / No
//   3. Car Garage: Yes / No
//   4. Rooftop Type: Garden / Open Terrace
//   5. Land Amount (Min Katha): 3 katha / 4 katha / 5+ katha
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

  // Toggle or set filter value
  const handleSelect = (key, val) => {
    onChangeFilters({
      ...filters,
      [key]: filters[key] === val ? "all" : val,
    });
  };

  // Handle custom katha text
  const handleCustomKatha = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    onChangeFilters({
      ...filters,
      custom_katha: cleaned,
      min_katha: cleaned ? "all" : filters.min_katha,
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
              Select your plot criteria to filter 5 & 10-story models
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
          {/* 1. Number of Floors (5 Story / 10 Story) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelRow}>
              <MaterialCommunityIcons
                name="office-building"
                size={16}
                color="#2563eb"
              />
              <Text style={styles.fieldLabel}>Number of Floors</Text>
            </View>
            <View style={styles.segmentGroup}>
              {[
                { label: "All", value: "all" },
                { label: "5 Story", value: "5" },
                { label: "10 Story", value: "10" },
              ].map((opt) => {
                const active = isSelected("floors", opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    onPress={() => handleSelect("floors", opt.value)}
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

          {/* 2. Basement (Yes / No) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelRow}>
              <MaterialCommunityIcons
                name="arrow-down-bold-box"
                size={16}
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

          {/* 3. Car Garage (Yes / No) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="car-sport" size={16} color="#059669" />
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

          {/* 4. Rooftop Type (Garden / Open Terrace) */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="leaf" size={16} color="#16a34a" />
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

          {/* 5. Land Amount (Min Katha): 3 katha / 4 katha / 5+ katha */}
          <View style={[styles.fieldRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="resize" size={16} color="#d97706" />
              <Text style={styles.fieldLabel}>Land Amount (Katha)</Text>
            </View>
            <View style={styles.segmentGroup}>
              {[
                { label: "Any", value: "all" },
                { label: "3 Katha", value: "3.5" },
                { label: "4 Katha", value: "4.5" },
                { label: "5+ Katha", value: "7.5" },
              ].map((opt) => {
                const active =
                  !filters.custom_katha && isSelected("min_katha", opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    onPress={() => {
                      onChangeFilters({
                        ...filters,
                        custom_katha: "",
                        min_katha: filters.min_katha === opt.value ? "all" : opt.value,
                      });
                    }}
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

            {/* Optional Custom Exact Katha Input */}
            <View style={styles.exactInputContainer}>
              <Text style={styles.exactInputLabel}>Or exact plot size:</Text>
              <View style={styles.exactInputBox}>
                <TextInput
                  style={styles.exactTextInput}
                  placeholder="e.g. 3.75"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  value={filters.custom_katha || ""}
                  onChangeText={handleCustomKatha}
                />
                <Text style={styles.exactInputUnit}>Katha</Text>
              </View>
            </View>
          </View>

          {/* Footer Reset & Result Summary */}
          <View style={styles.formFooter}>
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.8}
              onPress={onResetFilters}
            >
              <Ionicons name="refresh" size={14} color="#64748b" />
              <Text style={styles.resetBtnText}>Reset All</Text>
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
    paddingTop: 12,
  },
  fieldRow: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
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
    marginLeft: 6,
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
  exactInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  exactInputLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  exactInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 30,
    width: 100,
  },
  exactTextInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    padding: 0,
  },
  exactInputUnit: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    marginLeft: 4,
  },
  formFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
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
