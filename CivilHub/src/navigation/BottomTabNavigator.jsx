// src/navigation/BottomTabNavigator.jsx
// -----------------------------------------------------------------------------
// Bottom tab bar linking the app's 3 main features. Requires:
//   npm install @react-navigation/native @react-navigation/bottom-tabs
//   npx expo install react-native-screens react-native-safe-area-context
// -----------------------------------------------------------------------------
import React from "react";
import { Pressable, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import FeasibilityScreen from "../screens/FeasibilityScreen";
import DesignSuggestionsScreen from "../screens/DesignSuggestionsScreen";
import { CostEstimatorScreen } from "../screens/PlaceholderScreens";

const Tab = createBottomTabNavigator();

// Centralized palette so the tab bar stays visually consistent with the
// rest of the app (see FeasibilityScreen / FeasibilityForm styles).
const COLORS = {
  slate: "#1e293b",
  accent: "#2563eb",
  inactive: "#94a3b8",
  background: "#ffffff",
};

export default function BottomTabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      initialRouteName="Feasibility"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.slate,
          shadowColor: "transparent",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700",
        },
        headerRight: () => (
          <Pressable
            onPress={onLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontWeight: "700", marginLeft: 6 }}>
              Logout
            </Text>
          </Pressable>
        ),
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Feasibility"
        component={FeasibilityScreen}
        options={{
          tabBarLabel: "Feasibility",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Smart Designs"
        component={DesignSuggestionsScreen}
        options={{
          tabBarLabel: "Smart Designs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="floor-plan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cost Estimator"
        component={CostEstimatorScreen}
        options={{
          tabBarLabel: "Cost Estimator",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
