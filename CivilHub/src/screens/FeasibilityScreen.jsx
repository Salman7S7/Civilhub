// src/screens/FeasibilityScreen.jsx
// -----------------------------------------------------------------------------
// Main screen for Feature 1: "Feasibility Checker & Building Code AI Assistant".
// -----------------------------------------------------------------------------

// Import core React library and the useState hook for managing component state
import React, { useState } from "react";

// Import core UI components from React Native for layout and styling
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";

// Import SafeAreaView to prevent content from hiding behind device notches/status bars
import { SafeAreaView } from "react-native-safe-area-context";

// Import vector icons package for rendering UI icons (e.g., business, chat)
import { Ionicons } from "@expo/vector-icons";

// Import LinearGradient component to create gradient overlays on backgrounds
import { LinearGradient } from "expo-linear-gradient";

// Import custom child components used inside this screen
import FeasibilityForm from "../components/FeasibilityForm";
import AIChatbotModal from "../components/AIChatbotModal";

// Define a constant string holding a public Unsplash CDN URL for the hero banner image
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

// Define an array of regional building authority names to display as tags
const REGION_BADGES = ["RAJUK", "CDA", "RDA", "KDA"];

// Export the main functional component for this screen
export default function FeasibilityScreen() {
  // Initialize a state variable 'chatVisible' (default: false) and setter 'setChatVisible' to control the AI modal
  const [chatVisible, setChatVisible] = useState(false);

  // Return the JSX UI structure for the screen
  return (
    // SafeAreaView ensures content respects top device boundaries, restricted to the top edge
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Configure the mobile status bar with light text content and a dark background */}
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {/* ScrollView allows the entire screen content to be vertically scrollable */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ImageBackground sets a background photo and applies image-specific styles like rounded corners */}
        <ImageBackground
          source={{ uri: HERO_IMAGE_URL }}
          style={styles.heroImage}
          imageStyle={styles.heroImageRadius}
        >
          {/* LinearGradient overlays a dark fading color gradient over the image for text readability */}
          <LinearGradient
            colors={["rgba(15,23,42,0.55)", "rgba(15,23,42,0.85)", "#1e293b"]}
            style={styles.heroGradient}
          >
            {/* Top row layout container using flexbox for title and icon */}
            <View style={styles.heroTopRow}>
              <View>
                {/* Small category text banner */}
                <Text style={styles.heroEyebrow}>CIVILHUB</Text>
                {/* Main title text */}
                <Text style={styles.heroTitle}>Feasibility Checker</Text>
              </View>
              {/* Container wrapping the business building icon */}
              <View style={styles.heroIconWrap}>
                <Ionicons name="business" size={24} color="#ffffff" />
              </View>
            </View>

            {/* Subtitle description text */}
            <Text style={styles.heroSubtitle}>
              Instantly check what you can build under RAJUK, CDA, RDA, KDA, or
              municipal rules — then ask our AI assistant follow-up questions.
            </Text>

            {/* Container for the array of municipal authority badges */}
            <View style={styles.badgeRow}>
              {/* Loop through REGION_BADGES array and render a styled view for each */}
              {REGION_BADGES.map((r) => (
                <View key={r} style={styles.badge}>
                  <Text style={styles.badgeText}>{r}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Render the core input form component */}
        <FeasibilityForm />

        {/* Add an empty bottom view spacing element so content clears the floating action button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* TouchableOpacity acts as a clickable Floating Action Button (FAB) anchored at the bottom center */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => setChatVisible(true)} // Set chatVisible to true when pressed to open modal
      >
        <Ionicons name="chatbubble-ellipses" size={18} color="#ffffff" />
        <Text style={styles.fabText}>Ask AI Assistant 💬</Text>
      </TouchableOpacity>

      {/* Render the AI Chatbot Modal component, controlling its visibility with state variables */}
      <AIChatbotModal visible={chatVisible} onClose={() => setChatVisible(false)} />
    </SafeAreaView>
  );
}

// StyleSheet object containing all modular UI component styles
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