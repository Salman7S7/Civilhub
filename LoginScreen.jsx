// src/screens/LoginScreen.jsx
// -----------------------------------------------------------------------------
// Login screen shown before the main app (bottom tabs). Matches CivilHub's
// visual language: slate hero banner, blue accent CTA, emerald highlights,
// rounded 12-16px cards.
//
// This screen calls the `onLoginSuccess` prop once local validation passes.
// It does NOT talk to a real backend yet — see the TODO in handleLogin()
// for where to wire up actual authentication (Firebase Auth, your own
// backend's /api/login, etc.).
// -----------------------------------------------------------------------------
import React, { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with a real auth call, e.g.:
      //   const res = await fetch(`${BACKEND_BASE_URL}/api/login`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ email, password }),
      //   });
      //   if (!res.ok) throw new Error("Invalid credentials");
      //   const { token, user } = await res.json();
      //   // persist token (e.g. SecureStore) and pass user up.
      //
      // Simulated network delay so the loading state is visible in this demo:
      await new Promise((resolve) => setTimeout(resolve, 700));
      onLoginSuccess?.({ email: email.trim() });
    } catch (error) {
      setErrorMsg(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <ImageBackground
            source={{ uri: HERO_IMAGE_URL }}
            style={styles.hero}
            imageStyle={styles.heroImageRadius}
          >
            <LinearGradient
              colors={["rgba(15,23,42,0.35)", "rgba(15,23,42,0.85)", "#1e293b"]}
              style={styles.heroGradient}
            >
              <View style={styles.logoWrap}>
                <Ionicons name="business" size={30} color="#ffffff" />
              </View>
              <Text style={styles.brandName}>CivilHub</Text>
              <Text style={styles.brandTagline}>
                Feasibility checks & building codes, made simple.
              </Text>
            </LinearGradient>
          </ImageBackground>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>
              Log in to continue checking feasibility and asking the AI assistant.
            </Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#94a3b8" />
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

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>

            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#b91c1c" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Log In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons (visual only — wire up real providers later) */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={18} color="#1e293b" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign up */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(37, 99, 235, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  brandName: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  brandTagline: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#ffffff",
    marginTop: -24,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 4,
    backgroundColor: "#f8fafc",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    marginLeft: 10,
    marginRight: 10,
    paddingVertical: 8,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  forgotLinkText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    color: "#94a3b8",
    fontSize: 12,
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: "#ffffff",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 10,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 13,
    color: "#64748b",
  },
  signupLink: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "700",
  },
});
