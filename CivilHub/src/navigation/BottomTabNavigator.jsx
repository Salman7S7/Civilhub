// src/navigation/BottomTabNavigator.jsx
// -----------------------------------------------------------------------------
// Bottom tab navigation:
// 1. Client profile gets the full 5-tab suite (Feasibility, Smart Designs,
//    Cost Estimator, Land Tax, and Ask Expert).
// 2. Engineer profile gets their own dedicated navbar for Client Chat only.
// -----------------------------------------------------------------------------
import React from "react";
import { Pressable, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import FeasibilityScreen from "../screens/FeasibilityScreen";
import DesignSuggestionsScreen from "../screens/DesignSuggestionsScreen";
import CostEstimatorScreen from "../screens/CostEstimatorScreen";
import LandTaxScreen from "../screens/LandTaxScreen";
import ExpertChatScreen from "../screens/ExpertChatScreen";

const Tab = createBottomTabNavigator();

import { THEME } from "../theme/designSystem";

const COLORS = {
  navy: THEME.colors.navy,
  accent: THEME.colors.accent,
  inactive: "#64748b",
  background: "#ffffff",
};

export default function BottomTabNavigator({ onLogout, session }) {
  const isEngineer = session?.user?.role === "engineer";

  const getRoleLabel = () => {
    if (!session?.user) return "";
    if (session.user.role === "engineer") {
      if (session.user.engineerType === "architect") return "Architect";
      if (session.user.engineerType === "soil") return "Soil Eng";
      return "Structure Eng";
    }
    return "Client";
  };

  const renderHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
      {!!getRoleLabel() && (
        <View
          style={{
            backgroundColor: "rgba(56, 189, 248, 0.12)",
            borderWidth: 1,
            borderColor: "rgba(56, 189, 248, 0.35)",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#38bdf8", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 }}>
            {getRoleLabel().toUpperCase()}
          </Text>
        </View>
      )}
      <Pressable
        onPress={onLogout}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
          backgroundColor: pressed ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
        })}
      >
        <Ionicons name="log-out-outline" size={16} color="#ffffff" />
        <Text style={{ color: "#ffffff", fontWeight: "700", marginLeft: 6, fontSize: 12 }}>
          Logout
        </Text>
      </Pressable>
    </View>
  );

  const sharedTabBarOptions = {
    tabBarLabelPosition: "below-icon",
    tabBarStyle: {
      height: 70,
      paddingBottom: 10,
      paddingTop: 8,
      backgroundColor: "#ffffff",
      borderTopWidth: 2,
      borderTopColor: "#cbd5e1",
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 12,
    },
    tabBarItemStyle: {
      paddingVertical: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.2,
      marginTop: 2,
    },
    tabBarActiveTintColor: THEME.colors.accent,
    tabBarInactiveTintColor: "#64748b",
    headerShown: true,
    headerStyle: {
      backgroundColor: THEME.colors.navy,
      shadowColor: "transparent",
      elevation: 0,
      borderBottomWidth: 1.5,
      borderBottomColor: "rgba(255, 255, 255, 0.15)",
    },
    headerTintColor: "#ffffff",
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    headerRight: renderHeaderRight,
  };

  // ---------------------------------------------------------------------------
  // 1. ENGINEER PORTAL: Dedicated navbar for chatting with Client only
  // ---------------------------------------------------------------------------
  if (isEngineer) {
    return (
      <Tab.Navigator
        initialRouteName="Client Chat"
        screenOptions={{
          ...sharedTabBarOptions,
          headerTitle: `CivilHub — ${getRoleLabel()}`,
        }}
      >
        <Tab.Screen
          name="Client Chat"
          options={{
            title: `CivilHub — ${getRoleLabel()}`,
            tabBarLabel: "Client Chat",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="comment-text-multiple"
                size={size}
                color={color}
              />
            ),
          }}
        >
          {(props) => <ExpertChatScreen {...props} session={session} />}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. CLIENT PORTAL: Full 5-feature navbar
  // ---------------------------------------------------------------------------
  return (
    <Tab.Navigator
      initialRouteName="Feasibility"
      screenOptions={sharedTabBarOptions}
    >
      <Tab.Screen
        name="Feasibility"
        component={FeasibilityScreen}
        options={{
          title: "CivilHub",
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
          title: "Smart Designs",
          tabBarLabel: "Designs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="floor-plan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cost Estimator"
        component={CostEstimatorScreen}
        options={{
          title: "Cost Estimator",
          tabBarLabel: "Cost",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Land Tax"
        component={LandTaxScreen}
        options={{
          title: "Land Tax",
          tabBarLabel: "Land Tax",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ask Expert"
        options={{
          title: "Ask Expert",
          tabBarLabel: "Ask Expert",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="comment-text-multiple"
              size={size}
              color={color}
            />
          ),
        }}
      >
        {(props) => <ExpertChatScreen {...props} session={session} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
