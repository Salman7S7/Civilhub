import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";

// ---------------------------------------------------------------------------
// Cross-platform persistent session store
//   • On web  → window.localStorage (survives tab close & reload reliably)
//   • On native → @react-native-async-storage/async-storage
// ---------------------------------------------------------------------------
const SESSION_KEY = "@civilhub_user_session";

const SessionStore = {
  async get() {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const raw = window.localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      }
      // Native path
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("[SessionStore] get error:", e);
      return null;
    }
  },

  async set(value) {
    try {
      const str = JSON.stringify(value);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_KEY, str);
        return;
      }
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(SESSION_KEY, str);
    } catch (e) {
      console.warn("[SessionStore] set error:", e);
    }
  },

  async remove() {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.removeItem(SESSION_KEY);
        return;
      }
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn("[SessionStore] remove error:", e);
    }
  },
};

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Restore persisted session on launch / tab reload
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      const saved = await SessionStore.get();
      if (isMounted && saved?.user) {
        setSession(saved);
      }
      if (isMounted) setLoadingSession(false);
    }
    restoreSession();
    return () => { isMounted = false; };
  }, []);

  const handleLoginSuccess = async (newSession) => {
    setSession(newSession);
    await SessionStore.set(newSession);
  };

  const handleLogout = async () => {
    setSession(null);
    await SessionStore.remove();
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
    backgroundColor: "#0f1f2e",
    justifyContent: "center",
    alignItems: "center",
  },
});
