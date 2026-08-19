// App.js
// -----------------------------------------------------------------------------
// App entry point. Wraps the bottom-tab navigator in the required navigation
// and safe-area providers.
// -----------------------------------------------------------------------------
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BottomTabNavigator from "./src/navigation/BottomTabNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
