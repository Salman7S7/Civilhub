// App.js

import React, { useState } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      <NavigationContainer>
        {isLoggedIn ? (
          <BottomTabNavigator
            onLogout={() => setIsLoggedIn(false)}
          />
        ) : (
          <LoginScreen
            onLoginSuccess={() => setIsLoggedIn(true)}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
