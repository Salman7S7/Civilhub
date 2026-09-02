import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";


const units = [
  {
    key: "sqft",
    label: "Sq Ft",
  },
  {
    key: "katha",
    label: "Katha",
  },
  {
    key: "decimal",
    label: "Decimal",
  },
  {
    key: "bigha",
    label: "Bigha",
  },
];


export default function LandUnitSelector({
  value,
  onChange,
}) {

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Land Unit
      </Text>

      <View style={styles.row}>

        {units.map((unit) => {

          const active =
            value === unit.key;

          return (

            <TouchableOpacity
              key={unit.key}
              onPress={() =>
                onChange(unit.key)
              }
              style={[
                styles.button,
                active && styles.activeButton,
              ]}
            >

              <Text
                style={[
                  styles.text,
                  active && styles.activeText,
                ]}
              >
                {unit.label}
              </Text>

            </TouchableOpacity>

          );

        })}

      </View>

    </View>

  );
}


const styles = StyleSheet.create({

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE7F4",
    marginBottom: 16,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172B4D",
    marginBottom: 13,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  button: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCD8E6",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  activeButton: {
    backgroundColor: "#1264D8",
    borderColor: "#1264D8",
  },

  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#52657D",
  },

  activeText: {
    color: "#FFFFFF",
  },

});