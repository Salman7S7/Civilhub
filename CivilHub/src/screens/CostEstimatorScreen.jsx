import React, { useMemo, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import InputCard from "../components/costEstimator/InputCard";
import QualitySelector from "../components/costEstimator/QualitySelector";
import AddonSwitch from "../components/costEstimator/AddonSwitch";
import LivePriceBadge from "../components/costEstimator/LivePriceBadge";
import CostSummary from "../components/costEstimator/CostSummary";
import CostDistributionChart from "../components/costEstimator/CostDistributionChart";
import PerFloorBreakdown from "../components/costEstimator/PerFloorBreakdown";

import {
  estimateConstructionCost,
  formatBDT,
} from "../services/costEstimator";


export default function CostEstimatorScreen() {

  const [floors, setFloors] =
    useState("2");

  const [floorArea, setFloorArea] =
    useState("1000");

  const [quality, setQuality] =
    useState("standard");

  const [hasBasement, setHasBasement] =
    useState(false);

  const [hasGarage, setHasGarage] =
    useState(false);

  const [showResult, setShowResult] =
    useState(false);

  const [error, setError] =
    useState("");


  const result = useMemo(
    () =>
      estimateConstructionCost({
        floors,
        floorAreaSqft: floorArea,
        quality,
        hasBasement,
        hasGarage,
      }),
    [floors, floorArea, quality, hasBasement, hasGarage]
  );


  const calculate = () => {

    if (!floorArea || Number(floorArea) <= 0) {
      setError("Enter a valid floor area in sqft.");
      setShowResult(false);
      return;
    }

    if (!floors || Number(floors) < 1) {
      setError("Enter at least 1 floor.");
      setShowResult(false);
      return;
    }

    setError("");
    setShowResult(true);

  };


  const reset = () => {

    setFloors("2");
    setFloorArea("1000");
    setQuality("standard");

    setHasBasement(false);
    setHasGarage(false);

    setError("");
    setShowResult(false);

  };


  return (

    <SafeAreaView style={styles.safeArea}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.logo}>
            CivilHub
          </Text>

          <Text style={styles.title}>
            Cost Estimator
          </Text>

          <Text style={styles.subtitle}>
            Estimate construction cost by floors, floor
            area, quality, basement and garage.
          </Text>

        </View>


        {/* TOTAL FLOORS */}

        <InputCard
          label="Total Floors"
          placeholder="e.g. 2"
          value={floors}
          onChangeText={setFloors}
          keyboardType="numeric"
          suffix="floors"
        />


        {/* FLOOR AREA */}

        <InputCard
          label="Floor Area (per floor)"
          placeholder="e.g. 1000"
          value={floorArea}
          onChangeText={setFloorArea}
          keyboardType="numeric"
          suffix="sqft"
        />


        {/* QUALITY */}

        <QualitySelector
          value={quality}
          onChange={setQuality}
        />


        {/* LIVE PRICE */}

        <LivePriceBadge
          quality={quality}
        />


        {/* EXTRAS */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Extras
          </Text>

          <AddonSwitch
            title="Basement"
            subtitle="Adds ~90% of one floor at 1.25x rate"
            value={hasBasement}
            onChange={setHasBasement}
          />

          <AddonSwitch
            title="Garage"
            subtitle="Adds 250 sqft at 0.8x rate"
            value={hasGarage}
            onChange={setHasGarage}
          />

        </View>


        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}


        {/* CALCULATE */}

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculate}
        >

          <Text style={styles.calculateText}>
            Calculate Estimated Cost
          </Text>

        </TouchableOpacity>


        {/* RESET */}

        {showResult && (

          <TouchableOpacity
            style={styles.resetButton}
            onPress={reset}
          >

            <Text style={styles.resetText}>
              Reset
            </Text>

          </TouchableOpacity>

        )}


        {/* RESULT */}

        {showResult && (

          <>

            <View style={styles.metaCard}>

              <Text style={styles.metaText}>
                {result.floors} floor(s) ×{" "}
                {Number(result.floorAreaSqft).toLocaleString()} sqft ={" "}
                {Math.round(result.totalBuiltUpArea).toLocaleString()} sqft
                {" "}built-up @ {formatBDT(result.ratePerSqft)}/sqft
              </Text>

              <Text style={styles.metaTotal}>
                {formatBDT(result.total)}
              </Text>

            </View>


            <CostSummary
              structure={result.structure}
              finishing={result.finishing}
              electrical={result.electrical}
              plumbing={result.plumbing}
              totalCost={result.total}
            />


            <CostDistributionChart
              structure={result.structure}
              finishing={result.finishing}
              electrical={result.electrical}
              plumbing={result.plumbing}
            />


            <PerFloorBreakdown
              perFloor={result.perFloor}
            />

          </>

        )}

      </ScrollView>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    marginBottom: 24,
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1264D8",
    marginBottom: 15,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#172B4D",
  },

  subtitle: {
    fontSize: 14,
    color: "#718096",
    marginTop: 7,
    lineHeight: 21,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DCE7F4",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172B4D",
    marginBottom: 10,
  },

  error: {
    color: "#C53030",
    fontWeight: "700",
    marginBottom: 10,
  },

  metaCard: {
    backgroundColor: "#172B4D",
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
  },

  metaText: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 19,
  },

  metaTotal: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 8,
  },

  calculateButton: {
    backgroundColor: "#1264D8",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  calculateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resetButton: {
    borderWidth: 1,
    borderColor: "#1264D8",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  resetText: {
    color: "#1264D8",
    fontWeight: "700",
  },

});
