// src/components/designs/QuickFilterBar.jsx
// -----------------------------------------------------------------------------
// Horizontal scrollable chip bar for 1-tap quick filtering presets.
// -----------------------------------------------------------------------------

import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export const QUICK_PRESETS = [
  { id: "all", label: "All Designs", icon: "grid-outline", iconType: "ion" },
  { id: "5-story", label: "5 Story", icon: "office-building", iconType: "mc" },
  { id: "10-story", label: "10 Story", icon: "office-building", iconType: "mc" },
  { id: "garden", label: "Rooftop Garden", icon: "leaf-outline", iconType: "ion" },
  { id: "garage", label: "With Garage", icon: "car-outline", iconType: "ion" },
  { id: "basement", label: "With Basement", icon: "arrow-down-bold-box-outline", iconType: "mc" },
  { id: "terrace", label: "Open Terrace", icon: "sunny-outline", iconType: "ion" },
  { id: "helipad", label: "Helipad", icon: "airplane-outline", iconType: "ion" },
  { id: "small-plot", label: "≤ 3.5 Katha", icon: "resize-outline", iconType: "ion" },
];

export default function QuickFilterBar({ activePreset, onSelectPreset }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_PRESETS.map((item) => {
          const isActive = activePreset === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, isActive && styles.activeChip]}
              activeOpacity={0.75}
              onPress={() => onSelectPreset(item.id)}
            >
              {item.iconType === "mc" ? (
                <MaterialCommunityIcons
                  name={item.icon}
                  size={14}
                  color={isActive ? "#ffffff" : "#475569"}
                />
              ) : (
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isActive ? "#ffffff" : "#475569"}
                />
              )}
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activeChip: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 5,
  },
  activeChipText: {
    color: "#ffffff",
  },
});
