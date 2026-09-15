import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";

export default function App() {
<<<<<<< HEAD
  const [session, setSession] = useState(null);
=======
  const [isLoggedIn, setIsLoggedIn] = useState(true);
>>>>>>> 1d77ade9f4136ab751bba05246639194e714c5cd

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        {session ? (
          <BottomTabNavigator onLogout={() => setSession(null)} />
        ) : (
          <LoginScreen onLoginSuccess={setSession} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
