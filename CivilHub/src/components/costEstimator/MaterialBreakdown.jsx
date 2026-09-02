import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";


const money = (value) =>
  `৳ ${Math.round(value).toLocaleString()}`;


export default function MaterialBreakdown({
  cementCost,
  rodCost,
  brickCost,
  sandCost,
  aggregateCost,
}) {

  const materials = [
    {
      name: "Cement",
      value: cementCost,
    },

    {
      name: "Rod / Steel",
      value: rodCost,
    },

    {
      name: "Bricks",
      value: brickCost,
    },

    {
      name: "Sand",
      value: sandCost,
    },

    {
      name: "Aggregate",
      value: aggregateCost,
    },
  ];


  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Material Breakdown
      </Text>


      {materials.map((item) => (

        <View
          key={item.name}
          style={styles.row}
        >

          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.value}>
            {money(item.value)}
          </Text>

        </View>

      ))}

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
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
  },

  name: {
    fontSize: 14,
    color: "#52657D",
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172B4D",
  },

});