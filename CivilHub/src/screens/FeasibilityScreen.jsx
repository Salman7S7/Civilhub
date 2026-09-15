// src/screens/FeasibilityScreen.jsx
// -----------------------------------------------------------------------------
// Main screen for Feature 1: "Feasibility Checker & Building Code AI Assistant".
// Composes: gradient hero banner with a background image, the direct
// feasibility form, and a floating action button that opens the Gemini
// chatbot modal.
//
// Requires: npx expo install expo-linear-gradient
// -----------------------------------------------------------------------------
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import FeasibilityForm from "../components/FeasibilityForm";
import AIChatbotModal from "../components/AIChatbotModal";

// Real hero photo (Unsplash CDN, no key required). Swap for your own asset
// via require("../../assets/hero-buildings.jpg") if you'd rather bundle it.
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

const REGION_BADGES = ["RAJUK", "CDA", "RDA", "KDA"];

export default function FeasibilityScreen() {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner: real background image + gradient overlay for text contrast */}
        <ImageBackground
          source={{ uri: HERO_IMAGE_URL }}
          style={styles.heroImage}
          imageStyle={styles.heroImageRadius}
        >
          <LinearGradient
            colors={["rgba(15,23,42,0.55)", "rgba(15,23,42,0.85)", "#1e293b"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroEyebrow}>CIVILHUB</Text>
                <Text style={styles.heroTitle}>Feasibility Checker</Text>
              </View>
              <View style={styles.heroIconWrap}>
                <Ionicons name="business" size={24} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.heroSubtitle}>
              Instantly check what you can build under RAJUK, CDA, RDA, KDA, or
              municipal rules — then ask our AI assistant follow-up questions.
            </Text>

            <View style={styles.badgeRow}>
              {REGION_BADGES.map((r) => (
                <View key={r} style={styles.badge}>
                  <Text style={styles.badgeText}>{r}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Feasibility Form + Result Card */}
        <FeasibilityForm />

        {/* Bottom spacing so content clears the FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating AI Assistant Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => setChatVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={18} color="#ffffff" />
        <Text style={styles.fabText}>Ask AI Assistant 💬</Text>
      </TouchableOpacity>

      <AIChatbotModal visible={chatVisible} onClose={() => setChatVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: 260,
  },
  heroImageRadius: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(37, 99, 235, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  heroSubtitle: {
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    maxWidth: "95%",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  badge: {
    backgroundColor: "rgba(16, 185, 129, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.5)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
});
