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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { loginUser, registerUser } from "../services/authService";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState("client"); // "client" | "engineer"
  const [engineerType, setEngineerType] = useState("structural"); // "architect" | "structural" | "soil"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (isRegistering && !name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter email and password.");
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
      const activeEngineerType = role === "engineer" ? engineerType : null;
      const result = isRegistering
        ? await registerUser(
            name.trim(),
            email.trim(),
            password,
            role,
            activeEngineerType
          )
        : await loginUser(
            email.trim(),
            password,
            role,
            activeEngineerType
          );
      onLoginSuccess?.(result);
    } catch (error) {
      setErrorMsg(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProfileTitle = () => {
    if (role === "client") return "Client";
    if (engineerType === "architect") return "Architect (Arc)";
    if (engineerType === "soil") return "Soil Engineer";
    return "Structure Engineer";
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
          {/* Hero Banner with Previous Architectural Image */}
          <ImageBackground
            source={{ uri: HERO_IMAGE_URL }}
            style={styles.hero}
            imageStyle={styles.heroImageRadius}
          >
            <LinearGradient
              colors={["rgba(15,23,42,0.40)", "rgba(15,23,42,0.86)", "#0f172a"]}
              style={styles.heroGradient}
            >
              <View style={styles.logoWrap}>
                <Ionicons name="business" size={32} color="#ffffff" />
              </View>
              <Text style={styles.brandName}>CivilHub</Text>
              <Text style={styles.brandTagline}>
                Bangalore & Bangladesh Building Codes, Feasibility & Engineering Consultation
              </Text>

              {/* Profile Selection Badge */}
              <View style={styles.heroRoleBadge}>
                <Text style={styles.heroRoleBadgeLabel}>Signing in as:</Text>
                <Text style={styles.heroRoleBadgeValue}>{getProfileTitle()}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>
              {isRegistering ? "Create account" : "Welcome back"}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {isRegistering
                ? "Select your profile type and register to get started."
                : "Select your profile type and enter your login credentials."}
            </Text>

            {/* 1. Profile Selection Tabs: Client vs Engineer */}
            <View style={styles.profileSection}>
              <Text style={styles.fieldLabel}>Choose Profile</Text>
              <View style={styles.roleTabsRow}>
                {/* Client Profile Tab */}
                <TouchableOpacity
                  style={[
                    styles.roleTab,
                    role === "client" && styles.roleTabActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setRole("client");
                    setErrorMsg("");
                  }}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={role === "client" ? "#2563eb" : "#64748b"}
                  />
                  <View style={styles.roleTabTextWrap}>
                    <Text
                      style={[
                        styles.roleTabTitle,
                        role === "client" && styles.roleTabTitleActive,
                      ]}
                    >
                      Client
                    </Text>
                    <Text style={styles.roleTabDesc}>Landowner / Owner</Text>
                  </View>
                  {role === "client" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2563eb"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>

                {/* Engineer Profile Tab */}
                <TouchableOpacity
                  style={[
                    styles.roleTab,
                    role === "engineer" && styles.roleTabActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setRole("engineer");
                    setErrorMsg("");
                  }}
                >
                  <MaterialCommunityIcons
                    name="hard-hat"
                    size={22}
                    color={role === "engineer" ? "#2563eb" : "#64748b"}
                  />
                  <View style={styles.roleTabTextWrap}>
                    <Text
                      style={[
                        styles.roleTabTitle,
                        role === "engineer" && styles.roleTabTitleActive,
                      ]}
                    >
                      Engineer
                    </Text>
                    <Text style={styles.roleTabDesc}>Consultant</Text>
                  </View>
                  {role === "engineer" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2563eb"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Sub-discipline Selection if Engineer (Arc, Structure Eng, Soil Eng) */}
            {role === "engineer" && (
              <View style={styles.engineerDisciplineSection}>
                <Text style={styles.subFieldLabel}>
                  Select Engineering Discipline (3 Types)
                </Text>
                <View style={styles.disciplineRow}>
                  {/* Architect (Arc) */}
                  <TouchableOpacity
                    style={[
                      styles.disciplineCard,
                      engineerType === "architect" && styles.disciplineCardActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setEngineerType("architect")}
                  >
                    <MaterialCommunityIcons
                      name="drawing"
                      size={20}
                      color={
                        engineerType === "architect" ? "#2563eb" : "#64748b"
                      }
                    />
                    <Text
                      style={[
                        styles.disciplineTitle,
                        engineerType === "architect" &&
                          styles.disciplineTitleActive,
                      ]}
                    >
                      Arc
                    </Text>
                    <Text style={styles.disciplineSubtitle}>Architect</Text>
                  </TouchableOpacity>

                  {/* Structure Eng */}
                  <TouchableOpacity
                    style={[
                      styles.disciplineCard,
                      engineerType === "structural" && styles.disciplineCardActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setEngineerType("structural")}
                  >
                    <MaterialCommunityIcons
                      name="pillar"
                      size={20}
                      color={
                        engineerType === "structural" ? "#2563eb" : "#64748b"
                      }
                    />
                    <Text
                      style={[
                        styles.disciplineTitle,
                        engineerType === "structural" &&
                          styles.disciplineTitleActive,
                      ]}
                    >
                      Structure Eng
                    </Text>
                    <Text style={styles.disciplineSubtitle}>RCC & Seismic</Text>
                  </TouchableOpacity>

                  {/* Soil Eng */}
                  <TouchableOpacity
                    style={[
                      styles.disciplineCard,
                      engineerType === "soil" && styles.disciplineCardActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setEngineerType("soil")}
                  >
                    <MaterialCommunityIcons
                      name="shovel"
                      size={20}
                      color={engineerType === "soil" ? "#2563eb" : "#64748b"}
                    />
                    <Text
                      style={[
                        styles.disciplineTitle,
                        engineerType === "soil" && styles.disciplineTitleActive,
                      ]}
                    >
                      Soil Eng
                    </Text>
                    <Text style={styles.disciplineSubtitle}>Geotech & Pile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Input Form Fields */}
            {isRegistering && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color="#94a3b8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
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
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#b91c1c" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Login / Register Action Button */}
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
                  <Text style={styles.loginButtonText}>
                    {isRegistering
                      ? `Sign Up as ${getProfileTitle()}`
                      : `Log In as ${getProfileTitle()}`}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Toggle Sign Up / Login */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>
                {isRegistering
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => {
                  setIsRegistering((value) => !value);
                  setErrorMsg("");
                }}
              >
                <Text style={styles.signupLink}>
                  {isRegistering ? " Log in" : " Sign up"}
                </Text>
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
    paddingBottom: 36,
  },
  hero: {
    width: "100%",
    height: 250,
  },
  heroImageRadius: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    marginBottom: 12,
  },
  brandName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  brandTagline: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 18,
  },
  heroRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    gap: 6,
  },
  heroRoleBadgeLabel: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  heroRoleBadgeValue: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: -28,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "800",
  },
  welcomeSubtitle: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 18,
  },
  profileSection: {
    marginBottom: 16,
  },
  roleTabsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  roleTabActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  roleTabTextWrap: {
    flex: 1,
  },
  roleTabTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  roleTabTitleActive: {
    color: "#1d4ed8",
  },
  roleTabDesc: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 1,
  },
  checkIcon: {
    marginLeft: "auto",
  },
  engineerDisciplineSection: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  subFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  disciplineRow: {
    flexDirection: "row",
    gap: 8,
  },
  disciplineCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  disciplineCardActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  disciplineTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginTop: 4,
    textAlign: "center",
  },
  disciplineTitleActive: {
    color: "#1d4ed8",
  },
  disciplineSubtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
    textAlign: "center",
  },
  engineerNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
  },
  engineerNoticeText: {
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "600",
    flex: 1,
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
    fontSize: 14,
    paddingVertical: 2,
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
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 6,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
