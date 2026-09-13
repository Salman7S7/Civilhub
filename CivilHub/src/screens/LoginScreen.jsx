// src/screens/LoginScreen.jsx
// -----------------------------------------------------------------------------
// Login screen component for user authentication matching CivilHub's visual design.
// -----------------------------------------------------------------------------

// Import core React library and the useState hook for managing form input and state
import React, { useState } from "react";

// Import core UI components from React Native
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";

// Import SafeAreaView to prevent content from hiding behind system bars/notches
import { SafeAreaView } from "react-native-safe-area-context";

// Import Ionicons package for rendering vector UI icons
import { Ionicons } from "@expo/vector-icons";

// Import LinearGradient component to apply color fading effects over the header image
import { LinearGradient } from "expo-linear-gradient";

// Define a constant string holding the Unsplash CDN URL for the header image
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

// Helper function that takes an email string and validates its format using a Regular Expression
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Export the main LoginScreen functional component, accepting an `onLoginSuccess` callback function prop
export default function LoginScreen({ onLoginSuccess }) {
  // Define local state hooks for email, password, password visibility toggle, loading status, and error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Asynchronous function that handles local validation and login submission
  const handleLogin = async () => {
    // Clear any previous error messages before validating
    setErrorMsg("");

    // Check if email or password fields are empty
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    // Check if the email format is invalid
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    // Check if password length is less than 6 characters
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    // Set loading state to true while processing request
    setLoading(true);
    try {
      // Simulate network connection delay for demo purposes (replace with actual backend fetch/auth)
      await new Promise((resolve) => setTimeout(resolve, 700));
      // Trigger the success callback function, passing the trimmed user email object up
      onLoginSuccess?.({ email: email.trim() });
    } catch (error) {
      // Catch any errors and display the message or a default failure text
      setErrorMsg(error.message || "Login failed. Please try again.");
    } finally {
      // Reset loading state back to false once complete
      setLoading(false);
    }
  };

  // Return the main JSX structure for the login interface
  return (
    // SafeAreaView confines content within safe device boundaries at top and bottom
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* KeyboardAvoidingView adjusts layout dynamically when the software keyboard opens on iOS */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ScrollView allows the content card and banner to be scrollable vertically */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ImageBackground renders the header photograph */}
          <ImageBackground
            source={{ uri: HERO_IMAGE_URL }}
            style={styles.hero}
            imageStyle={styles.heroImageRadius}
          >
            {/* LinearGradient overlays a dark shading over the hero background image */}
            <LinearGradient
              colors={["rgba(15,23,42,0.35)", "rgba(15,23,42,0.85)", "#1e293b"]}
              style={styles.heroGradient}
            >
              {/* Container box for the brand logo icon */}
              <View style={styles.logoWrap}>
                <Ionicons name="business" size={30} color="#ffffff" />
              </View>
              {/* Brand name title text */}
              <Text style={styles.brandName}>CivilHub</Text>
              {/* Subtitle tag line text */}
              <Text style={styles.brandTagline}>
                Feasibility checks & building codes, made simple.
              </Text>
            </LinearGradient>
          </ImageBackground>

          {/* Main card container holding the input fields and action buttons */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>
              Log in to continue checking feasibility and asking the AI assistant.
            </Text>

            {/* Field group wrapper for the email input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#94a3b8" />
                {/* TextInput for capturing user email entry */}
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Field group wrapper for the password input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
                {/* TextInput for capturing password text entry securely */}
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                {/* Clickable icon button to toggle password visibility */}
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password text action button */}
            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Conditionally render validation error message box if errorMsg exists */}
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#b91c1c" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Main login submission button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {/* Show loading spinner if loading is true, otherwise show button label text and arrow icon */}
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Log In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider row separating standard login from social options */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Alternative social sign-in button for Google */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={18} color="#1e293b" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Footer row linking to the sign up screen */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity hitSlop={8}>
                <Text style={styles.signupLink}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// StyleSheet defining layout designs, colors, and typography rules
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    width: "100%",
    height: 240,
  },
  heroImageRadius: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(37, 99, 235, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginBottom: 12,
  },
  brandName: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  brandTagline: {
    color: "#dbeafe",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: -34,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  welcomeTitle: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "800",
  },
  welcomeSubtitle: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: "#0f172a",
    fontSize: 15,
    paddingVertical: 2,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 18,
  },
  forgotLinkText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 12,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 12,
    marginHorizontal: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingVertical: 14,
  },
  socialButtonText: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "700",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  signupText: {
    color: "#64748b",
    fontSize: 13,
  },
  signupLink: {
    color: "#2563eb",
    fontWeight: "800",
    fontSize: 13,
  },
});