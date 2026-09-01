import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";


const options = [
  {
    key: "economy",
    title: "Economy",
    subtitle: "Budget friendly",
  },

  {
    key: "standard",
    title: "Standard",
    subtitle: "Recommended",
  },

  {
    key: "premium",
    title: "Premium",
    subtitle: "High quality",
  },
];


export default function QualitySelector({
  value,
  onChange,
}) {

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Construction Quality
      </Text>

      {options.map((item) => {

        const selected =
          value === item.key;

        return (

          <TouchableOpacity
            key={item.key}
            onPress={() =>
              onChange(item.key)
            }
            style={[
              styles.option,
              selected && styles.selectedOption,
            ]}
          >

            <View style={styles.radioOuter}>

              {selected && (
                <View style={styles.radioInner} />
              )}

            </View>

            <View>

              <Text
                style={[
                  styles.optionTitle,
                  selected && styles.selectedText,
                ]}
              >
                {item.title}
              </Text>

              <Text style={styles.subtitle}>
                {item.subtitle}
              </Text>

            </View>

          </TouchableOpacity>

        );

      })}

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
    marginBottom: 12,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E0E8F2",
    marginBottom: 8,
  },

  selectedOption: {
    backgroundColor: "#F0F6FF",
    borderColor: "#1264D8",
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#AAB8C8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1264D8",
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172B4D",
  },

  selectedText: {
    color: "#1264D8",
  },

  subtitle: {
    fontSize: 12,
    color: "#7B8999",
    marginTop: 2,
  },

});