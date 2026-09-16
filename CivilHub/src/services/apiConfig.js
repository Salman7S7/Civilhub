import { Platform } from "react-native";

// Set EXPO_PUBLIC_BACKEND_URL to the computer's LAN address for a physical
// phone, for example: http://192.168.0.10:4000
const configuredBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim();

export const BACKEND_BASE_URL =
	configuredBaseUrl ||
	(Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000");
