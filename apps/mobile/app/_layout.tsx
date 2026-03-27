import "../global.css";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { useConvexAuth } from "convex/react";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

// expo-secure-store adapter for ConvexAuthProvider session persistence
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

function NavigationGuard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <View className="flex-1 bg-apple-bg">
        <StatusBar style="light" />
        <NavigationGuard />
      </View>
    </ConvexAuthProvider>
  );
}
