import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";


const money = (value) =>
  `৳ ${Math.round(value).toLocaleString()}`;


export default function CostSummary({
  structure,
  finishing,
  electrical,
  plumbing,
  totalCost,
}) {

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Cost Summary
      </Text>


      <View style={styles.row}>

        <Text style={styles.label}>
          Structure (45%)
        </Text>

        <Text style={styles.value}>
          {money(structure)}
        </Text>

      </View>


      <View style={styles.row}>

        <Text style={styles.label}>
          Finishing (30%)
        </Text>

        <Text style={styles.value}>
          {money(finishing)}
        </Text>

      </View>


      <View style={styles.row}>

        <Text style={styles.label}>
          Electrical (12%)
        </Text>

        <Text style={styles.value}>
          {money(electrical)}
        </Text>

      </View>


      <View style={styles.row}>

        <Text style={styles.label}>
          Plumbing (13%)
        </Text>

        <Text style={styles.value}>
          {money(plumbing)}
        </Text>

      </View>


      <View style={styles.line} />


      <View style={styles.totalRow}>

        <Text style={styles.totalLabel}>
          Estimated Total
        </Text>

        <Text style={styles.total}>
          {money(totalCost)}
        </Text>

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
    fontSize: 20,
    fontWeight: "800",
    color: "#172B4D",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
  },

  label: {
    color: "#64748B",
    fontSize: 14,
  },

  value: {
    color: "#172B4D",
    fontWeight: "700",
  },

  line: {
    height: 1,
    backgroundColor: "#E3EAF2",
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172B4D",
  },

  total: {
    fontSize: 23,
    fontWeight: "900",
    color: "#1264D8",
  },

});