import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";


export default function InputCard({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  suffix,
}) {

  return (

    <View style={styles.card}>

      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9AA8B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />

        {suffix && (

          <View style={styles.suffixBox}>

            <Text style={styles.suffix}>
              {suffix}
            </Text>

          </View>

        )}

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

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#43566F",
    marginBottom: 9,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCD8E6",
    borderRadius: 9,
    height: 50,
  },

  input: {
    flex: 1,
    paddingHorizontal: 13,
    fontSize: 15,
    color: "#172B4D",
  },

  suffixBox: {
    paddingHorizontal: 13,
    borderLeftWidth: 1,
    borderLeftColor: "#CCD8E6",
  },

  suffix: {
    color: "#1264D8",
    fontWeight: "700",
    fontSize: 12,
  },

});