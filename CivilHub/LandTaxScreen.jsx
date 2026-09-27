// src/screens/LandTaxScreen.jsx
// -----------------------------------------------------------------------------
// Land Tax & Khajna Calculator & ldtax.gov.bd Online Portal Integration
// Styled exactly to match CivilHub standard specifications
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Linking,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

import {
  UNITS,
  USAGE_TYPES,
  REGIONS,
  YEAR_OPTIONS,
  computeLandTax,
} from "../services/landTaxService";

export default function LandTaxScreen() {
  const [areaValue, setAreaValue] = useState("5");
  const [selectedUnit, setSelectedUnit] = useState("katha");
  const [selectedUsage, setSelectedUsage] = useState("residential");
  const [selectedRegion, setSelectedRegion] = useState("dhaka_ctg");
  const [taxYears, setTaxYears] = useState("1");
  const [includeHoldingTax, setIncludeHoldingTax] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const currentUnitObj = UNITS.find((u) => u.key === selectedUnit) || UNITS[0];

  const handleCalculate = () => {
    setErrorMsg("");
    if (!areaValue || isNaN(parseFloat(areaValue)) || parseFloat(areaValue) <= 0) {
      setErrorMsg("Please enter a valid land area.");
      return;
    }

    try {
      const res = computeLandTax({
        areaValue,
        unitKey: selectedUnit,
        usageKey: selectedUsage,
        regionKey: selectedRegion,
        years: taxYears,
        includeHoldingTax,
      });
      setResult(res);
      setHasCalculated(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to calculate tax.");
    }
  };

  // Once calculated for the first time, automatically re-calculate on any option change
  useEffect(() => {
    if (!hasCalculated) return;

    setErrorMsg("");
    if (!areaValue || isNaN(parseFloat(areaValue)) || parseFloat(areaValue) <= 0) {
      setResult(null);
      return;
    }

    try {
      const res = computeLandTax({
        areaValue,
        unitKey: selectedUnit,
        usageKey: selectedUsage,
        regionKey: selectedRegion,
        years: taxYears,
        includeHoldingTax,
      });
      setResult(res);
    } catch (err) {
      setResult(null);
      setErrorMsg(err.message || "Failed to calculate tax.");
    }
  }, [hasCalculated, areaValue, selectedUnit, selectedUsage, selectedRegion, taxYears, includeHoldingTax]);

  const handleReset = () => {
    setAreaValue("5");
    setSelectedUnit("katha");
    setSelectedUsage("residential");
    setSelectedRegion("dhaka_ctg");
    setTaxYears("1");
    setIncludeHoldingTax(true);
    setHasCalculated(false);
    setResult(null);
    setErrorMsg("");
  };

  const openUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", `Could not open ${url}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Header Banner */}
        <View style={styles.headerContainer}>
          <Text style={styles.brandTitle}>CivilHub</Text>
          <Text style={styles.pageTitle}>Land Tax & Khajna</Text>
          <Text style={styles.pageSubtitle}>
            Calculate Land Development Tax (ভূমি উন্নয়ন কর), holding tax, and pay online directly via
            official government portal.
          </Text>
        </View>

        {/* Card 1: Land Area */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Land Area (জমির পরিমাণ)</Text>

          {/* Area Input with Unit Badge */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 5"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={areaValue}
              onChangeText={setAreaValue}
            />
            <Text style={styles.inputBadge}>{currentUnitObj.badge}</Text>
          </View>

          {/* Unit Selector Segmented Buttons */}
          <View style={styles.segmentedRow}>
            {UNITS.map((u) => {
              const isActive = selectedUnit === u.key;
              return (
                <TouchableOpacity
                  key={u.key}
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => setSelectedUnit(u.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, isActive && styles.segmentBtnTextActive]}>
                    {u.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card 2: Land Usage Type */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Land Usage Type (জমির ব্যবহার)</Text>
          <View style={styles.optionsList}>
            {USAGE_TYPES.map((u) => {
              const isSelected = selectedUsage === u.key;
              return (
                <TouchableOpacity
                  key={u.key}
                  style={[styles.radioCard, isSelected && styles.radioCardActive]}
                  onPress={() => setSelectedUsage(u.key)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                    {u.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card 3: Location / Region */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Location / Region (এলাকার শ্রেণি)</Text>
          <View style={styles.optionsList}>
            {REGIONS.map((r) => {
              const isSelected = selectedRegion === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.regionCard, isSelected && styles.regionCardActive]}
                  onPress={() => setSelectedRegion(r.key)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.regionTitle, isSelected && styles.regionTitleActive]}>
                      {r.title}
                    </Text>
                    <Text style={styles.regionSubtitle}>{r.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card 4: Tax Years */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tax Years (কত বছরের কর / বকেয়া)</Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="1"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={String(taxYears)}
              onChangeText={setTaxYears}
            />
            <Text style={styles.inputBadgeMuted}>Year(s)</Text>
          </View>

          <View style={styles.segmentedRow}>
            {YEAR_OPTIONS.map((yr) => {
              const isActive = parseInt(taxYears, 10) === yr;
              return (
                <TouchableOpacity
                  key={yr}
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => setTaxYears(String(yr))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, isActive && styles.segmentBtnTextActive]}>
                    {yr} {yr > 1 ? "Years" : "Year"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card 5: Include Municipal Holding Tax */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.cardLabel}>Include Municipal Holding Tax</Text>
              <Text style={styles.switchSubtitle}>
                Add estimated municipal / pourashava holding tax
              </Text>
            </View>
            <Switch
              value={includeHoldingTax}
              onValueChange={setIncludeHoldingTax}
              trackColor={{ false: "#cbd5e1", true: "#1d68e8" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Error message */}
        {!!errorMsg && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsWrap}>
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
            activeOpacity={0.88}
          >
            <Text style={styles.calculateBtnText}>Calculate Land Tax (খাজনা)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
        {result && (
          <View style={styles.resultContainer}>
            {/* Dark Navy Banner Header */}
            <View style={styles.resultHeaderBanner}>
              <View style={styles.resultBannerTopRow}>
                <Text style={styles.resultBannerLabel}>ESTIMATED PAYABLE TAX</Text>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearBadgeText}>{result.years} Year(s)</Text>
                </View>
              </View>

              <Text style={styles.resultBigPrice}>৳ {result.totalAmount.toLocaleString("en-BD")}</Text>

              <Text style={styles.resultSubtextRow}>
                Plot Area: {result.rawArea} {result.unitName} (≈ {result.decimalArea} Decimals)
              </Text>
              <Text style={styles.resultSubtextRow}>
                Category: {result.usageTitle} | Rate: ৳{result.ratePerDecimal}/decimal/yr
              </Text>
            </View>

            {/* White Breakdown Content */}
            <View style={styles.breakdownBody}>
              <Text style={styles.breakdownTitle}>Tax Calculation Breakdown</Text>

              <View style={styles.breakdownRow}>
                <View style={styles.rowLabelWrap}>
                  <Ionicons name="document-text-outline" size={18} color="#1d68e8" />
                  <Text style={styles.breakdownLabelText}>Base Land Tax (ভূমি উন্নয়ন কর)</Text>
                </View>
                <Text style={styles.breakdownValueText}>
                  ৳ {result.totalBaseTax.toLocaleString("en-BD")}
                </Text>
              </View>

              {result.includeHoldingTax && (
                <View style={styles.breakdownRow}>
                  <View style={styles.rowLabelWrap}>
                    <Ionicons name="home-outline" size={18} color="#10b981" />
                    <Text style={styles.breakdownLabelText}>Municipal Holding Tax (হোল্ডিং ট্যাক্স)</Text>
                  </View>
                  <Text style={styles.breakdownValueText}>
                    ৳ {result.totalHoldingTax.toLocaleString("en-BD")}
                  </Text>
                </View>
              )}

              {result.surcharge > 0 && (
                <View style={styles.breakdownRow}>
                  <View style={styles.rowLabelWrap}>
                    <Ionicons name="time-outline" size={18} color="#f59e0b" />
                    <Text style={styles.breakdownLabelText}>Arrears Surcharge (বকেয়া সুদ - ৬.২৫%)</Text>
                  </View>
                  <Text style={[styles.breakdownValueText, { color: "#dc2626" }]}>
                    + ৳ {result.surcharge.toLocaleString("en-BD")}
                  </Text>
                </View>
              )}

              <View style={styles.breakdownDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>Total Amount (মোট প্রদেয়)</Text>
                <Text style={styles.totalRowValue}>
                  ৳ {result.totalAmount.toLocaleString("en-BD")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Online Land Tax Payment Official Portal Green Card */}
        <View style={styles.govPortalCard}>
          <View style={styles.govHeaderRow}>
            <View style={styles.govIconBox}>
              <Ionicons name="shield-checkmark" size={24} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.govTitle}>Online Land Tax Payment (অনলাইন খাজনা পরিশোধ)</Text>
              <Text style={styles.govSubtitle}>Official Portal: ldtax.gov.bd (ভূমি মন্ত্রণালয়)</Text>
            </View>
          </View>

          <Text style={styles.govDesc}>
            আপনার খতিয়ান/হোল্ডিং নম্বর দিয়ে সরকারি পোর্টালে সরাসরি বিকাশ, নগদ, রকেট বা কার্ডের
            মাধ্যমে খাজনা পরিশোধ করুন ও ডিজিটাল দাখিলা সংগ্রহ করুন।
          </Text>

          {/* Pay on ldtax.gov.bd Button */}
          <TouchableOpacity
            style={styles.payPortalBtn}
            onPress={() => openUrl("https://ldtax.gov.bd")}
            activeOpacity={0.88}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={20} color="#ffffff" />
            <Text style={styles.payPortalBtnText}>Pay Land Tax on ldtax.gov.bd</Text>
            <Ionicons name="open-outline" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Secondary Quick Links */}
          <View style={styles.quickLinksRow}>
            <TouchableOpacity
              style={styles.quickLinkBtn}
              onPress={() => openUrl("https://ldtax.gov.bd/citizen/register")}
              activeOpacity={0.85}
            >
              <FontAwesome5 name="user-plus" size={13} color="#1d68e8" />
              <Text style={styles.quickLinkText}>Citizen Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkBtn}
              onPress={() => openUrl("https://mutation.land.gov.bd")}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="file-document-edit-outline" size={16} color="#1d68e8" />
              <Text style={styles.quickLinkText}>e-Namjari (নামজারি)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 20,
  },

  // Header Banner
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1d68e8",
    letterSpacing: -0.5,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginTop: 6,
  },

  // Form Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
  },

  // Input & Unit badge
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
    padding: 0,
  },
  inputBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1d68e8",
    letterSpacing: 0.5,
  },
  inputBadgeMuted: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },

  // Segmented Buttons
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#1d68e8",
    borderColor: "#1d68e8",
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  segmentBtnTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Radio lists
  optionsList: {
    gap: 8,
  },
  radioCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  radioCardActive: {
    borderColor: "#1d68e8",
    backgroundColor: "#ffffff",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: "#1d68e8",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1d68e8",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginLeft: 12,
  },
  radioTextActive: {
    fontWeight: "700",
    color: "#1d68e8",
  },

  // Region card
  regionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  regionCardActive: {
    borderColor: "#1d68e8",
    backgroundColor: "#ffffff",
  },
  regionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  regionTitleActive: {
    color: "#1d68e8",
  },
  regionSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 16,
  },

  // Switch row
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  // Error box
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },

  // Action Buttons
  actionButtonsWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  calculateBtn: {
    backgroundColor: "#1d68e8",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  calculateBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  resetBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#1d68e8",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    color: "#1d68e8",
    fontSize: 14,
    fontWeight: "700",
  },

  // Result Section
  resultContainer: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  resultHeaderBanner: {
    backgroundColor: "#0b1e3b",
    padding: 18,
  },
  resultBannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultBannerLabel: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  yearBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  yearBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  resultBigPrice: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 8,
  },
  resultSubtextRow: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
  },

  // Breakdown body
  breakdownBody: {
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rowLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownLabelText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  breakdownValueText: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalRowLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  totalRowValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1d68e8",
  },

  // Official Gov Portal Card
  govPortalCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 18,
  },
  govHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  govIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  govTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#065f46",
  },
  govSubtitle: {
    fontSize: 11,
    color: "#059669",
    marginTop: 1,
  },
  govDesc: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 14,
  },
  payPortalBtn: {
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  payPortalBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  quickLinksRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  quickLinkBtn: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d68e8",
  },
});
