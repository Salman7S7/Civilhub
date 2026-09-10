import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";


export default function CostDistributionChart({
  structure,
  finishing,
  electrical,
  plumbing,
}) {

  const total =
    (structure || 0) +
    (finishing || 0) +
    (electrical || 0) +
    (plumbing || 0);


  const getPercentage = (value) => {

    if (!total) {
      return 0;
    }

    return (value / total) * 100;

  };


  const structurePct =
    getPercentage(structure);

  const finishingPct =
    getPercentage(finishing);

  const electricalPct =
    getPercentage(electrical);

  const plumbingPct =
    getPercentage(plumbing);


  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Cost Distribution
      </Text>


      <View style={styles.bar}>

        <View
          style={[
            styles.materialBar,
            { flex: structurePct || 0.001 },
          ]}
        />

        <View
          style={[
            styles.laborBar,
            { flex: finishingPct || 0.001 },
          ]}
        />

        <View
          style={[
            styles.additionalBar,
            { flex: electricalPct || 0.001 },
          ]}
        />

        <View
          style={[
            styles.plumbingBar,
            { flex: plumbingPct || 0.001 },
          ]}
        />

      </View>


      <View style={styles.legend}>

        <View style={styles.legendItem}>

          <View style={[
            styles.dot,
            styles.materialDot
          ]} />

          <Text style={styles.legendText}>
            Structure {Math.round(structurePct)}%
          </Text>

        </View>


        <View style={styles.legendItem}>

          <View style={[
            styles.dot,
            styles.laborDot
          ]} />

          <Text style={styles.legendText}>
            Finishing {Math.round(finishingPct)}%
          </Text>

        </View>


        <View style={styles.legendItem}>

          <View style={[
            styles.dot,
            styles.additionalDot
          ]} />

          <Text style={styles.legendText}>
            Electrical {Math.round(electricalPct)}%
          </Text>

        </View>


        <View style={styles.legendItem}>

          <View style={[
            styles.dot,
            styles.plumbingDot
          ]} />

          <Text style={styles.legendText}>
            Plumbing {Math.round(plumbingPct)}%
          </Text>

        </View>

      </View>

    </View>

  );
}


const styles = StyleSheet.create({

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE7F4",
    marginTop: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172B4D",
    marginBottom: 18,
  },

  bar: {
    height: 18,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E9EEF5",
  },

  materialBar: {
    backgroundColor: "#1264D8",
  },

  laborBar: {
    backgroundColor: "#5B8DEF",
  },

  additionalBar: {
    backgroundColor: "#A9C7F8",
  },

  plumbingBar: {
    backgroundColor: "#7DD3FC",
  },

  legend: {
    marginTop: 16,
    gap: 9,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },

  materialDot: {
    backgroundColor: "#1264D8",
  },

  laborDot: {
    backgroundColor: "#5B8DEF",
  },

  additionalDot: {
    backgroundColor: "#A9C7F8",
  },

  plumbingDot: {
    backgroundColor: "#7DD3FC",
  },

  legendText: {
    fontSize: 12,
    color: "#60748D",
  },

});