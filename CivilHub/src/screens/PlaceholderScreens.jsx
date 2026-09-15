
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

function PlaceholderContent({ iconName, IconComponent, title, subtitle }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerBox}>
        <IconComponent name={iconName} size={56} color="#2563eb" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}


export function CostEstimatorScreen() {
  return (
    <PlaceholderContent
      IconComponent={Ionicons}
      iconName="calculator-outline"
      title="Cost Estimator"
      subtitle="Construction cost estimation tools are coming soon."
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
