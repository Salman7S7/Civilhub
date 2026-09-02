import React, { useMemo, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import LandUnitSelector from "../components/costEstimator/LandUnitSelector";
import InputCard from "../components/costEstimator/InputCard";
import QualitySelector from "../components/costEstimator/QualitySelector";
import AddonSwitch from "../components/costEstimator/AddonSwitch";
import LivePriceBadge from "../components/costEstimator/LivePriceBadge";
import CostSummary from "../components/costEstimator/CostSummary";
import CostDistributionChart from "../components/costEstimator/CostDistributionChart";
import MaterialBreakdown from "../components/costEstimator/MaterialBreakdown";


const PRICES = {
  standard: {
    cement: 520,
    rod: 92,
    brick: 14,
    sand: 55,
    aggregate: 75,
  },

  premium: {
    cement: 620,
    rod: 105,
    brick: 18,
    sand: 65,
    aggregate: 85,
  },

  economy: {
    cement: 470,
    rod: 84,
    brick: 11,
    sand: 48,
    aggregate: 65,
  },
};


export default function CostEstimatorScreen() {

  const [land, setLand] = useState("");

  const [landUnit, setLandUnit] =
    useState("sqft");

  const [floors, setFloors] =
    useState("1");

  const [quality, setQuality] =
    useState("standard");

  const [includeLabor, setIncludeLabor] =
    useState(true);

  const [includeElectrical, setIncludeElectrical] =
    useState(false);

  const [includePlumbing, setIncludePlumbing] =
    useState(false);

  const [includePaint, setIncludePaint] =
    useState(false);

  const [showResult, setShowResult] =
    useState(false);


  /*
   * Convert land into square feet.
   */

  const landInSqFt = useMemo(() => {

    const value = Number(land) || 0;

    if (landUnit === "katha") {
      return value * 720;
    }

    if (landUnit === "decimal") {
      return value * 435.6;
    }

    if (landUnit === "bigha") {
      return value * 14400;
    }

    return value;

  }, [land, landUnit]);


  /*
   * Estimated built-up area.
   */

  const builtUpArea =
    landInSqFt * 0.75 * (Number(floors) || 1);


  /*
   * Material calculation.
   */

  const prices = PRICES[quality];

  const cementCost =
    builtUpArea * 0.55 * prices.cement;

  const rodCost =
    builtUpArea * 0.004 * prices.rod;

  const brickCost =
    builtUpArea * 13 * prices.brick;

  const sandCost =
    builtUpArea * 0.045 * prices.sand;

  const aggregateCost =
    builtUpArea * 0.035 * prices.aggregate;


  const materialCost =
    cementCost +
    rodCost +
    brickCost +
    sandCost +
    aggregateCost;


  /*
   * Labor.
   */

  const laborCost =
    includeLabor
      ? materialCost * 0.25
      : 0;


  /*
   * Additional services.
   */

  const electricalCost =
    includeElectrical
      ? builtUpArea * 180
      : 0;

  const plumbingCost =
    includePlumbing
      ? builtUpArea * 120
      : 0;

  const paintCost =
    includePaint
      ? builtUpArea * 90
      : 0;


  const additionalCost =
    electricalCost +
    plumbingCost +
    paintCost;


  const totalCost =
    materialCost +
    laborCost +
    additionalCost;


  const calculate = () => {

    setShowResult(true);

  };


  const reset = () => {

    setLand("");
    setLandUnit("sqft");
    setFloors("1");
    setQuality("standard");

    setIncludeLabor(true);
    setIncludeElectrical(false);
    setIncludePlumbing(false);
    setIncludePaint(false);

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
            Estimate your construction cost quickly
            and easily.
          </Text>

        </View>


        {/* LAND UNIT */}

        <LandUnitSelector
          value={landUnit}
          onChange={setLandUnit}
        />


        {/* LAND AREA */}

        <InputCard
          label="Land Area"
          placeholder="Enter land area"
          value={land}
          onChangeText={setLand}
          keyboardType="numeric"
          suffix={landUnit}
        />


        {/* NUMBER OF FLOORS */}

        <InputCard
          label="Number of Floors"
          placeholder="e.g. 2"
          value={floors}
          onChangeText={setFloors}
          keyboardType="numeric"
          suffix="floor"
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


        {/* ADDONS */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Additional Services
          </Text>

          <AddonSwitch
            title="Labor Cost"
            subtitle="Include construction labor"
            value={includeLabor}
            onChange={setIncludeLabor}
          />

          <AddonSwitch
            title="Electrical Work"
            subtitle="Electrical installation"
            value={includeElectrical}
            onChange={setIncludeElectrical}
          />

          <AddonSwitch
            title="Plumbing Work"
            subtitle="Plumbing installation"
            value={includePlumbing}
            onChange={setIncludePlumbing}
          />

          <AddonSwitch
            title="Painting"
            subtitle="Interior and exterior painting"
            value={includePaint}
            onChange={setIncludePaint}
          />

        </View>


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

            <CostSummary
              materialCost={materialCost}
              laborCost={laborCost}
              additionalCost={additionalCost}
              totalCost={totalCost}
            />


            <CostDistributionChart
              materialCost={materialCost}
              laborCost={laborCost}
              additionalCost={additionalCost}
            />


            <MaterialBreakdown
              cementCost={cementCost}
              rodCost={rodCost}
              brickCost={brickCost}
              sandCost={sandCost}
              aggregateCost={aggregateCost}
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