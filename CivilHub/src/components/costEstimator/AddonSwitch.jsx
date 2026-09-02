import React from "react";

import {
  View,
  Text,
  Switch,
  StyleSheet,
} from "react-native";


export default function AddonSwitch({
  title,
  subtitle,
  value,
  onChange,
}) {

  return (

    <View style={styles.container}>

      <View style={styles.textContainer}>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>

      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: "#D5DDE7",
          true: "#AFCFFF",
        }}
        thumbColor={
          value ? "#1264D8" : "#FFFFFF"
        }
      />

    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172B4D",
  },

  subtitle: {
    fontSize: 12,
    color: "#7B8999",
    marginTop: 3,
  },

});