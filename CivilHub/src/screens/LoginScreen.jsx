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

          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>
              Log in to continue checking feasibility and asking the AI assistant.
            </Text>

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

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={18} color="#1e293b" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

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
