import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";


export default function LivePriceBadge({
  quality,
  rateSource = "mysql",
}) {

  const qualityText = {
    standard: "Standard",
    premium: "Premium",
    luxury: "Luxury",
  };

  const isMySQL = rateSource === "mysql";

  return (

    <View style={[styles.container, isMySQL && styles.mysqlContainer]}>

      <View style={[styles.dot, isMySQL && styles.mysqlDot]} />

      <View style={styles.textContainer}>

        <Text style={styles.title}>
          {isMySQL ? "Live Database Rates" : "Current Material Prices"}
        </Text>

        <Text style={styles.subtitle}>
          Using {qualityText[quality]} grade • {isMySQL ? "MySQL civilhub_db" : "Baseline formulas"}
        </Text>

      </View>

      <View style={[styles.badge, isMySQL && styles.mysqlBadge]}>

        <Text style={[styles.badgeText, isMySQL && styles.mysqlBadgeText]}>
          {isMySQL ? "MYSQL LIVE" : "ESTIMATE"}
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

  mysqlContainer: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1264D8",
    marginRight: 12,
  },

  mysqlDot: {
    backgroundColor: "#059669",
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
    color: "#6B778C",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C9DFFF",
  },

  mysqlBadge: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1264D8",
  },

  mysqlBadgeText: {
    color: "#059669",
  },

});