import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { calculateBuildingCost } from "../../backend/costEstimator";
import { BD_CONSTRUCTION_RATES } from "../../backend/costEstimatorData";

export default function CostEstimatorScreen() {
  const [landKatha, setLandKatha] = useState("3");
  const [numberOfFloors, setNumberOfFloors] = useState("5");
  const [qualityTier, setQualityTier] = useState("standard");

  const [useDetailedRooms, setUseDetailedRooms] = useState(false);
  const [roomDetails, setRoomDetails] = useState({
    bedrooms: "2",
    masterBedrooms: "1",
    bathrooms: "2",
    kitchens: "1",
    livingRooms: "1",
    diningRooms: "1",
    balconies: "2",
  });

  const [customFloorSqFt, setCustomFloorSqFt] = useState("");
  const [result, setResult] = useState(null);

  const handleRoomChange = (key, value) => {
    setRoomDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCalculate = () => {
    const kathaVal = parseFloat(landKatha);
    if (isNaN(kathaVal) || kathaVal <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid land area in Katha.");
      return;
    }

    const floorsVal = parseInt(numberOfFloors);
    if (isNaN(floorsVal) || floorsVal <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of floors.");
      return;
    }

    const formattedRoomDetails = {
      useRoomDetails: useDetailedRooms,
      bedrooms: parseInt(roomDetails.bedrooms) || 0,
      masterBedrooms: parseInt(roomDetails.masterBedrooms) || 0,
      bathrooms: parseInt(roomDetails.bathrooms) || 0,
      kitchens: parseInt(roomDetails.kitchens) || 0,
      livingRooms: parseInt(roomDetails.livingRooms) || 0,
      diningRooms: parseInt(roomDetails.diningRooms) || 0,
      balconies: parseInt(roomDetails.balconies) || 0,
    };

    const calcResult = calculateBuildingCost({
      landAreaKatha: kathaVal,
      numberOfFloors: floorsVal,
      qualityTier,
      customSqFtPerFloor: customFloorSqFt,
      roomDetails: formattedRoomDetails,
    });

    setResult(calcResult);
  };

  const handleReset = () => {
    setLandKatha("3");
    setNumberOfFloors("5");
    setQualityTier("standard");
    setUseDetailedRooms(false);
    setCustomFloorSqFt("");
    setRoomDetails({
      bedrooms: "2",
      masterBedrooms: "1",
      bathrooms: "2",
      kitchens: "1",
      livingRooms: "1",
      diningRooms: "1",
      balconies: "2",
    });
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Building Cost Estimator (Bangladesh)</Text>
      <Text style={styles.subtitle}>
        RAJUK Ground Coverage Rules & Room-based Cost Calculation
      </Text>

      {/* SECTION 1: Land & Basic Inputs */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. Land & Basic Information</Text>

        <Text style={styles.label}>Total Land Area (in Katha):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={landKatha}
          onChangeText={setLandKatha}
          placeholder="e.g. 3.5"
        />
        <Text style={styles.hint}>1 Katha = 720 Sq Ft</Text>

        <Text style={styles.label}>Number of Floors (Stories):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={numberOfFloors}
          onChangeText={setNumberOfFloors}
          placeholder="e.g. 5"
        />

        <Text style={styles.label}>Construction Quality Grade:</Text>
        <View style={styles.tierContainer}>
          {Object.keys(BD_CONSTRUCTION_RATES).map((tierKey) => {
            const tier = BD_CONSTRUCTION_RATES[tierKey];
            const isSelected = qualityTier === tierKey;
            return (
              <TouchableOpacity
                key={tierKey}
                style={[
                  styles.tierButton,
                  isSelected && styles.tierButtonActive,
                ]}
                onPress={() => setQualityTier(tierKey)}
              >
                <Text
                  style={[
                    styles.tierButtonText,
                    isSelected && styles.tierButtonTextActive,
                  ]}
                >
                  {tier.label}
                </Text>
                <Text
                  style={[
                    styles.tierSubtext,
                    isSelected && styles.tierSubtextActive,
                  ]}
                >
                  ৳{tier.ratePerSqFt}/sqft
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 2: Detailed Room Input Option */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeader}>2. Detailed Room Calculation</Text>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              useDetailedRooms ? styles.toggleActive : styles.toggleInactive,
            ]}
            onPress={() => setUseDetailedRooms(!useDetailedRooms)}
          >
            <Text style={styles.toggleBtnText}>
              {useDetailedRooms ? "Enabled" : "Disabled"}
            </Text>
          </TouchableOpacity>
        </View>

        {useDetailedRooms ? (
          <View style={styles.roomFormContainer}>
            <Text style={styles.infoText}>
              Enter number of rooms per floor to calculate precise floor area:
            </Text>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Standard Bedrooms:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.bedrooms}
                  onChangeText={(v) => handleRoomChange("bedrooms", v)}
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Master Bedrooms:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.masterBedrooms}
                  onChangeText={(v) => handleRoomChange("masterBedrooms", v)}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Bathrooms:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.bathrooms}
                  onChangeText={(v) => handleRoomChange("bathrooms", v)}
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Kitchens:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.kitchens}
                  onChangeText={(v) => handleRoomChange("kitchens", v)}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Living Rooms:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.livingRooms}
                  onChangeText={(v) => handleRoomChange("livingRooms", v)}
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Dining Rooms:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.diningRooms}
                  onChangeText={(v) => handleRoomChange("diningRooms", v)}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Balconies:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roomDetails.balconies}
                  onChangeText={(v) => handleRoomChange("balconies", v)}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.infoText}>
            When disabled, the system automatically uses maximum allowable RAJUK ground coverage footprint area.
          </Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.calcButton} onPress={handleCalculate}>
          <Text style={styles.calcButtonText}>Calculate Total Cost</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 3: Results Display */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Estimation Summary</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Land Area:</Text>
            <Text style={styles.resultValue}>
              {result.landAreaKatha} Katha ({result.rajukCoverage.totalLandSqFt} Sq Ft)
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>RAJUK Max Ground Coverage (MGC):</Text>
            <Text style={styles.resultValue}>
              {result.rajukCoverage.maxMGCPercent}% ({result.rajukCoverage.ruleDescription})
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Max Allowable Footprint per Floor:</Text>
            <Text style={styles.resultValue}>
              {Math.round(result.rajukCoverage.maxGroundFootprintSqFt)} Sq Ft
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Calculated Floor Area:</Text>
            <Text style={styles.resultValue}>
              {result.areaPerFloorSqFt} Sq Ft ({result.areaSource})
            </Text>
          </View>

          {result.isExceedingRajukMGC && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Warning: Your selected room layout area ({result.areaPerFloorSqFt} Sq Ft) exceeds RAJUK Maximum Ground Coverage allowance ({Math.round(result.rajukCoverage.maxGroundFootprintSqFt)} Sq Ft).
              </Text>
            </View>
          )}

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Built-Up Area ({result.numberOfFloors} Floors):</Text>
            <Text style={styles.resultValue}>{result.totalBuiltUpAreaSqFt} Sq Ft</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Rate per Sq Ft:</Text>
            <Text style={styles.resultValue}>৳{result.ratePerSqFt} ({result.qualityLabel})</Text>
          </View>

          <View style={styles.totalCostBox}>
            <Text style={styles.totalCostLabel}>Estimated Total Construction Cost:</Text>
            <Text style={styles.totalCostValue}>
              ৳ {result.totalEstimatedCostBDT.toLocaleString("en-BD")} BDT
            </Text>
          </View>

          {/* Explanation of Cost Percentage Allocation */}
          <Text style={styles.breakdownHeader}>
            Cost Breakdown Basis (Bangladesh / RAJUK Rules)
          </Text>
          <Text style={styles.breakdownSub}>
            Percentages are allocated according to Bangladesh National Building Code (BNBC) and RAJUK standard structural engineering guidelines:
          </Text>

          {result.costBreakdown.map((item, idx) => (
            <View key={idx} style={styles.breakdownItem}>
              <View style={styles.rowBetween}>
                <Text style={styles.breakdownCategory}>
                  {item.category} ({item.percentage}%)
                </Text>
                <Text style={styles.breakdownAmount}>
                  ৳ {item.amountBDT.toLocaleString("en-BD")}
                </Text>
              </View>
              <Text style={styles.breakdownDesc}>{item.description}</Text>
              <Text style={styles.breakdownRajukNote}>• {item.rajukNote}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E293B", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#64748B", textAlign: "center", marginBottom: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { fontSize: 16, fontWeight: "bold", color: "#0F172A", marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 8, marginBottom: 4 },
  hint: { fontSize: 11, color: "#94A3B8", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  tierContainer: { flexDirection: "column", gap: 8, marginTop: 6 },
  tierButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F8FAFC",
  },
  tierButtonActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  tierButtonText: { fontSize: 14, fontWeight: "bold", color: "#334155" },
  tierButtonTextActive: { color: "#2563EB" },
  tierSubtext: { fontSize: 12, color: "#64748B", marginTop: 2 },
  tierSubtextActive: { color: "#1D4ED8" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  toggleActive: { backgroundColor: "#16A34A" },
  toggleInactive: { backgroundColor: "#94A3B8" },
  toggleBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  infoText: { fontSize: 12, color: "#64748B", marginTop: 4 },
  roomFormContainer: { marginTop: 10 },
  gridRow: { flexDirection: "row", gap: 12 },
  gridCol: { flex: 1 },
  buttonRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  calcButton: {
    flex: 2,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  calcButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  resetButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: { color: "#475569", fontSize: 16, fontWeight: "bold" },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 12 },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  resultLabel: { fontSize: 13, color: "#475569" },
  resultValue: { fontSize: 13, fontWeight: "bold", color: "#0F172A", flexShrink: 1, textAlign: "right" },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  warningText: { color: "#991B1B", fontSize: 12 },
  totalCostBox: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginVertical: 14,
  },
  totalCostLabel: { fontSize: 14, color: "#166534", fontWeight: "600" },
  totalCostValue: { fontSize: 22, fontWeight: "bold", color: "#15803D", marginTop: 4 },
  breakdownHeader: { fontSize: 15, fontWeight: "bold", color: "#0F172A", marginTop: 8 },
  breakdownSub: { fontSize: 11, color: "#64748B", marginBottom: 12 },
  breakdownItem: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },
  breakdownCategory: { fontSize: 13, fontWeight: "bold", color: "#1E293B" },
  breakdownAmount: { fontSize: 13, fontWeight: "bold", color: "#2563EB" },
  breakdownDesc: { fontSize: 12, color: "#475569", marginTop: 2 },
  breakdownRajukNote: { fontSize: 11, color: "#16A34A", fontStyle: "italic", marginTop: 2 },
});