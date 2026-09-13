import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { formatBDT } from "../../services/costEstimator";


function rowLabel(item) {
  if (item.label) {
    return item.label;
  }

  if (item.floor === 0) {
    return "Basement";
  }

  return `Floor ${item.floor}`;
}


export default function PerFloorBreakdown({
  perFloor,
}) {

  if (!perFloor || perFloor.length === 0) {
    return null;
  }

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Per-Floor Breakdown
      </Text>


      {perFloor.map((item, index) => (

        <View
          key={`${rowLabel(item)}-${index}`}
          style={styles.row}
        >

          <View>

            <Text style={styles.name}>
              {rowLabel(item)}
            </Text>

            <Text style={styles.area}>
              {Math.round(item.areaSqft || 0).toLocaleString()} sqft
            </Text>

          </View>

          <Text style={styles.value}>
            {formatBDT(item.cost)}
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
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172B4D",
  },

  area: {
    fontSize: 12,
    color: "#7B8999",
    marginTop: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172B4D",
  },

});
