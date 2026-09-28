// src/screens/FeasibilityScreen.jsx
// -----------------------------------------------------------------------------
// Main screen for Feature 1: "Feasibility Checker & Building Code AI Assistant".
// Composes: gradient hero banner with a background image, the direct
// feasibility form, and a floating action button that opens the Gemini
// chatbot modal.
//
// Requires: npx expo install expo-linear-gradient
// -----------------------------------------------------------------------------
import React, { useState } from "react"; // Import React and the useState hook for managing state
import {
  View, // Basic container component
  Text, // Component for displaying text
  ScrollView, // Component that allows scrolling of content
  TouchableOpacity, // Component that can be pressed (for buttons)
  StyleSheet, // Tool for creating styles
  StatusBar, // Component to control the device's status bar
  ImageBackground, // Component to display an image as a background
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // A view that respects device notches and safe areas
import { Ionicons } from "@expo/vector-icons"; // Icon library
import { LinearGradient } from "expo-linear-gradient"; // Component for gradient backgrounds

import FeasibilityForm from "../components/FeasibilityForm"; // Import the form component
import AIChatbotModal from "../components/AIChatbotModal"; // Import the chatbot modal component

// Real hero photo (Unsplash CDN, no key required). Swap for your own asset
// via require("../../assets/hero-buildings.jpg") if you'd rather bundle it.
import { THEME } from "../theme/designSystem";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

const REGION_BADGES = ["RAJUK • Dhaka", "CDA • Chattogram", "RDA • Rajshahi", "KDA • Khulna", "Pourashava"];

export default function FeasibilityScreen({ navigation, route }) {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.navy} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-width Architectural Hero Header */}
        <View style={styles.heroOuter}>
          <ImageBackground
            source={{ uri: HERO_IMAGE_URL }}
            style={styles.heroImage}
          >
            <LinearGradient
              colors={["rgba(7,13,24,0.45)", "rgba(15,23,42,0.88)", "#0f172a"]}
              style={styles.heroGradient}
            >
              <View style={styles.heroInnerContent}>
                <View style={styles.heroTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heroEyebrow}>CIVIL ENGINEERING & BNBC 2020</Text>
                    <Text style={styles.heroTitle}>Feasibility Checker</Text>
                  </View>
                  <View style={styles.heroIconWrap}>
                    <Ionicons name="business" size={24} color="#38bdf8" />
                  </View>
                </View>

                <Text style={styles.heroSubtitle}>
                  Instantly evaluate allowable stories, road setbacks, and Floor Area Ratio (FAR) across RAJUK, CDA, RDA, KDA, or municipal bylaws.
                </Text>

                <View style={styles.badgeRow}>
                  {REGION_BADGES.map((r) => (
                    <View key={r} style={styles.badge}>
                      <Text style={styles.badgeText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Content Container (Card overlays the hero section) */}
        <View style={styles.pageContainer}>
          <FeasibilityForm initialParams={route?.params} />
        </View>

        {/* Bottom spacing so content clears the FAB */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Expert Consultation Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.88}
        onPress={() => {
          if (navigation && navigation.navigate) {
            navigation.navigate("Ask Expert", {
              initialContext: {
                authority: "RAJUK",
                floors: 6,
                katha: 4,
              },
            });
          } else {
            setChatVisible(true);
          }
        }}
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubbles" size={18} color="#ffffff" />
          <Text style={styles.fabText}>Consult Expert Engineer</Text>
        </LinearGradient>
      </TouchableOpacity>

      <AIChatbotModal visible={chatVisible} onClose={() => setChatVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroOuter: {
    width: "100%",
    backgroundColor: THEME.colors.navy,
  },
  heroImage: {
    width: "100%",
    minHeight: 250,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 44,
    paddingTop: 24,
  },
  heroInnerContent: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  pageContainer: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    marginTop: -28,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroEyebrow: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: "92%",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    borderRadius: 999,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 99,
  },
  fabGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    gap: 8,
  },
  fabText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
