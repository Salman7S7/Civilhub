import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorageModule from "@react-native-async-storage/async-storage";

import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";

const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
const SESSION_STORAGE_KEY = "@civilhub_user_session";

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Restore session from AsyncStorage on app launch/refresh
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.user) {
            setSession(parsed);
          }
        }
      } catch (err) {
        console.warn("Failed to restore session from AsyncStorage:", err);
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = async (newSession) => {
    setSession(newSession);
    try {
      if (newSession) {
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      }
    } catch (err) {
      console.warn("Failed to persist session to AsyncStorage:", err);
    }
  };

  const handleLogout = async () => {
    setSession(null);
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to clear session from AsyncStorage:", err);
    }
  };

  if (loadingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        {session ? (
          <BottomTabNavigator session={session} onLogout={handleLogout} />
        ) : (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
});
