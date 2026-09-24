// src/components/FeasibilityForm.jsx
// -----------------------------------------------------------------------------
// Form for collecting land area, road width, region, and target height, then
// triggering feasibility verification. Renders a status result card once
// checked. Region + unit selection use simple pill-style dropdown modals
// rather than a native <Picker> for full styling control.
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { evaluateFeasibility } from "../services/feasibilityRules";

const LAND_UNITS = [
  { label: "Katha", value: "katha" },
  { label: "Decimal", value: "decimal" },
];

const REGIONS = [
  { label: "RAJUK - Dhaka", value: "RAJUK" },
  { label: "CDA - Chittagong", value: "CDA" },
  { label: "RDA - Rajshahi", value: "RDA" },
  { label: "KDA - Khulna", value: "KDA" },
  { label: "General Municipal", value: "General" },
];

// Simple reusable dropdown built on a bottom-sheet-style Modal + FlatList.
function DropdownField({ label, value, options, onSelect, placeholder }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setVisible(true)}>
        <Text style={selected ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      item.value === value && styles.modalOptionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Visual result card shown after "Verify Feasibility" is pressed.
function ResultCard({ result }) {
  const colorMap = {
    success: { bg: "#ecfdf5", border: "#10b981", text: "#047857", icon: "checkmark-circle" },
    warning: { bg: "#fffbeb", border: "#f59e0b", text: "#b45309", icon: "alert-circle" },
    danger: { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c", icon: "close-circle" },
  };
  const c = colorMap[result.statusColor];

  return (
    <View style={[styles.resultCard, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={styles.resultHeaderRow}>
        <Ionicons name={c.icon} size={22} color={c.text} />
        <Text style={[styles.resultStatus, { color: c.text }]}>{result.status}</Text>
      </View>

      {result.authority && (
        <View style={styles.authorityBadgeRow}>
          <Ionicons name="business" size={13} color="#1d4ed8" />
          <Text style={styles.authorityBadgeText}>
            {result.authority.authorityName}
          </Text>
        </View>
      )}

      <Text style={styles.resultMessage}>{result.message}</Text>

      <View style={styles.resultDivider} />

      <View style={styles.resultRow}>
        <Text style={styles.resultRowLabel}>Max Recommended Height</Text>
        <Text style={styles.resultRowValue}>{result.maxRecommendedHeight}</Text>
      </View>

      {result.authority && (
        <View style={styles.resultRow}>
          <Text style={styles.resultRowLabel}>Governing Bylaw</Text>
          <Text style={[styles.resultRowValue, { flex: 1, textAlign: "right" }]}>
            {result.authority.governingBylaw}
          </Text>
        </View>
      )}

      <View style={styles.resultRow}>
        <Text style={styles.resultRowLabel}>National Baseline</Text>
        <Text style={[styles.resultRowValue, { flex: 1, textAlign: "right" }]}>
          {result.authority?.baselineCode || "BNBC 2020"}
        </Text>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultRowLabel}>Setback Notes</Text>
        <Text style={[styles.resultRowValue, { flex: 1, textAlign: "right" }]}>
          {result.setbackNotes}
        </Text>
      </View>

      {!!result.landNote && <Text style={styles.landNote}>{result.landNote}</Text>}

      {result.complianceFlags?.length > 0 && (
        <View style={styles.flagsBox}>
          {result.complianceFlags.map((flag, idx) => (
            <View key={idx} style={styles.flagRow}>
              <Ionicons name="warning-outline" size={14} color="#b45309" />
              <Text style={styles.flagText}>{flag}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.disclaimer}>
        Planning estimate only — confirm with {result.authority?.shortName || "RAJUK/CDA/RDA/KDA"} Land Use
        Clearance (LUC) and a licensed structural engineer before construction.
      </Text>
      {result.authority?.officialPortal && (
        <Text style={styles.portalLink}>
          Official Portal: {result.authority.officialPortal}
        </Text>
      )}
    </View>
  );
}

export default function FeasibilityForm({ initialParams }) {
  const [landArea, setLandArea] = useState(initialParams?.katha ? String(initialParams.katha) : "");
  const [landUnit, setLandUnit] = useState("katha");
  const [roadWidth, setRoadWidth] = useState(initialParams?.roadWidth ? String(initialParams.roadWidth) : "20");
  const [region, setRegion] = useState(initialParams?.authority || "RAJUK");
  const [targetStories, setTargetStories] = useState(initialParams?.floors ? String(initialParams.floors) : "");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [designBanner, setDesignBanner] = useState(initialParams?.designTitle || null);

  // Sync with incoming params whenever user selects "Check Feasibility for this Model"
  useEffect(() => {
    if (initialParams) {
      if (initialParams.katha) setLandArea(String(initialParams.katha));
      if (initialParams.floors) setTargetStories(String(initialParams.floors));
      if (initialParams.authority) setRegion(initialParams.authority);
      if (initialParams.roadWidth) setRoadWidth(String(initialParams.roadWidth));
      else if (!roadWidth) setRoadWidth("20");

      if (initialParams.designTitle) {
        setDesignBanner(initialParams.designTitle);
      }

      const kathaVal = initialParams.katha || landArea;
      const floorsVal = initialParams.floors || targetStories;
      const roadVal = initialParams.roadWidth || roadWidth || "20";
      const regionVal = initialParams.authority || region || "RAJUK";

      if (kathaVal && floorsVal) {
        setChecking(true);
        setErrorMsg("");
        const timer = setTimeout(() => {
          const evaluation = evaluateFeasibility({
            landArea: String(kathaVal),
            landUnit: "katha",
            roadWidth: String(roadVal),
            region: regionVal,
            targetStories: String(floorsVal),
          });
          setResult(evaluation);
          setChecking(false);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [initialParams]);

  const handleVerify = () => {
    setErrorMsg("");

    if (!landArea || !roadWidth || !targetStories) {
      setErrorMsg("Please fill in land area, road width, and target height.");
      return;
    }

    setChecking(true);
    setResult(null);

    // Simulated brief delay for perceived "checking" feedback — the actual
    // computation is synchronous/local (see feasibilityRules.js).
    setTimeout(() => {
      const evaluation = evaluateFeasibility({
        landArea,
        landUnit,
        roadWidth,
        region,
        targetStories,
      });
      setResult(evaluation);
      setChecking(false);
    }, 500);
  };

  return (
    <View style={styles.card}>
      {designBanner && (
        <View style={styles.designBanner}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="sparkles" size={18} color="#2563eb" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.designBannerTitle}>
                Evaluating Model: {designBanner}
              </Text>
              <Text style={styles.designBannerSubtitle}>
                {targetStories ? `${targetStories} Stories` : ""} {landArea ? `• ${landArea} Katha Plot` : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setDesignBanner(null)}>
            <Ionicons name="close" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.cardTitle}>Direct Feasibility Check</Text>
      <Text style={styles.cardSubtitle}>
        Enter your plot details to get an instant permissibility estimate.
      </Text>

      {/* Land Area + Unit */}
      <View style={styles.rowGroup}>
        <View style={{ flex: 1.4 }}>
          <Text style={styles.fieldLabel}>Land Area</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={landArea}
            onChangeText={setLandArea}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <DropdownField
            label="Unit"
            value={landUnit}
            options={LAND_UNITS}
            onSelect={setLandUnit}
            placeholder="Select unit"
          />
        </View>
      </View>

      {/* Road Width */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Frontage Road Width (ft)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 20"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={roadWidth}
          onChangeText={setRoadWidth}
        />
      </View>

      {/* Region */}
      <DropdownField
        label="Selected Region"
        value={region}
        options={REGIONS}
        onSelect={setRegion}
        placeholder="Select region"
      />

      {/* Target Stories */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Target Building Height (stories)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 7"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={targetStories}
          onChangeText={setTargetStories}
        />
      </View>

      {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      <TouchableOpacity
        style={styles.verifyButton}
        onPress={handleVerify}
        disabled={checking}
        activeOpacity={0.85}
      >
        {checking ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
            <Text style={styles.verifyButtonText}>Verify Feasibility</Text>
          </>
        )}
      </TouchableOpacity>

      {result && <ResultCard result={result} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 16,
  },
  rowGroup: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
  },
  dropdownValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#334155",
  },
  modalOptionTextActive: {
    color: "#2563eb",
    fontWeight: "700",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 12,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
  resultMessage: {
    fontSize: 13,
    color: "#334155",
    marginTop: 8,
    lineHeight: 19,
  },
  resultDivider: {
    height: 1,
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    marginVertical: 12,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultRowLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  resultRowValue: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: "700",
  },
  landNote: {
    fontSize: 11,
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 4,
  },
  flagsBox: {
    marginTop: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    padding: 10,
  },
  flagRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  flagText: {
    fontSize: 11,
    color: "#92400e",
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  disclaimer: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 14,
  },
  authorityBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 6,
    gap: 5,
  },
  authorityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  portalLink: {
    fontSize: 10,
    color: "#2563eb",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  designBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  designBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  designBannerSubtitle: {
    fontSize: 11,
    color: "#3b82f6",
    marginTop: 2,
    fontWeight: "500",
  },
});
