import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";


export default function LivePriceBadge({
  quality,
}) {

  const qualityText = {
    economy: "Economy",
    standard: "Standard",
    premium: "Premium",
  };


  return (

    <View style={styles.container}>

      <View style={styles.dot} />

      <View style={styles.textContainer}>

        <Text style={styles.title}>
          Current Material Prices
        </Text>

        <Text style={styles.subtitle}>
          Using {qualityText[quality]} price level
        </Text>

      </View>

      <View style={styles.badge}>

        <Text style={styles.badgeText}>
          ESTIMATE
        </Text>

      </View>

    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    borderWidth: 1,
    borderColor: "#C9DFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#1264D8",
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172B4D",
  },

  subtitle: {
    fontSize: 11,
    color: "#60748D",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#1264D8",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

});