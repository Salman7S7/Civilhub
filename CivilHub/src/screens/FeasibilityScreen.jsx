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
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"; // URL for the background image

const REGION_BADGES = ["RAJUK", "CDA", "RDA", "KDA"]; // List of region names to show as badges

export default function FeasibilityScreen({ navigation, route }) { // The main screen component, receives navigation and route props
  const [chatVisible, setChatVisible] = useState(false); // State to control if the chatbot modal is visible

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
          source={{ uri: HERO_IMAGE_URL }} // The image source
          style={styles.heroImage} // Style for the image background container
          imageStyle={styles.heroImageRadius} // Style applied only to the image itself (for rounded corners)
        >
          <LinearGradient
            colors={["rgba(15,23,42,0.55)", "rgba(15,23,42,0.85)", "#1e293b"]} // Dark gradient colors for better text visibility
            style={styles.heroGradient} // Style for the gradient
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
        <FeasibilityForm initialParams={route?.params} />

        {/* Bottom spacing so content clears the FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Expert Consultation Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
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
        <Ionicons name="chatbubbles" size={18} color="#ffffff" />
        <Text style={styles.fabText}>Ask Expert</Text>
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
