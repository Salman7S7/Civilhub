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

const COLORS = {
  slate: "#1e293b",
  accent: "#2563eb",
  inactive: "#94a3b8",
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
            backgroundColor: "rgba(56, 189, 248, 0.18)",
            borderWidth: 1,
            borderColor: "rgba(56, 189, 248, 0.35)",
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 8,
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#38bdf8", fontSize: 11, fontWeight: "800" }}>
            {getRoleLabel()}
          </Text>
        </View>
      )}
      <Pressable
        onPress={onLogout}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 7,
          borderRadius: 9,
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      >
        <Ionicons name="log-out-outline" size={17} color="#ffffff" />
        <Text style={{ color: "#ffffff", fontWeight: "700", marginLeft: 5, fontSize: 13 }}>
          Logout
        </Text>
      </Pressable>
    </View>
  );

  // ---------------------------------------------------------------------------
  // 1. ENGINEER PORTAL: Dedicated navbar for chatting with Client only
  // ---------------------------------------------------------------------------
  if (isEngineer) {
    return (
      <Tab.Navigator
        initialRouteName="Client Chat"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.slate,
            shadowColor: "transparent",
          },
          headerTintColor: "#ffffff",
          headerTitle: `CivilHub - ${getRoleLabel()}`,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "700",
          },
          headerRight: renderHeaderRight,
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
          name="Client Chat"
          options={{
            title: "Client Consultation",
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
        headerRight: renderHeaderRight,
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
      <Tab.Screen
        name="Land Tax"
        component={LandTaxScreen}
        options={{
          tabBarLabel: "Land Tax",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ask Expert"
        options={{
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
