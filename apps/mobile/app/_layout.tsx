import "../global.css";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ThemeProvider } from "@react-navigation/native";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import {
  ios26Colors,
  ios26NavigationTheme,
  ios26SheetOptions,
  ios26StackScreenOptions,
} from "@/constants/ios26";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const unstable_settings = {
  anchor: "(app)",
};

function NavigationGuard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const topSegment = segments[0];

    if (!topSegment) return;

    const inAuth = topSegment === "(auth)";
    const inProtectedTree = topSegment === "(app)" || topSegment === "(modals)";

    if (!isAuthenticated && inProtectedTree) {
      router.replace("/sign-in");
      return;
    }

    if (isAuthenticated && inAuth) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isLoading, router, segments]);

  return (
    <Stack
      screenOptions={{
        ...ios26StackScreenOptions,
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen
        name="(modals)/product/[barcode]"
        options={ios26SheetOptions}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(ios26Colors.background).catch(() => {});
  }, []);

  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <ThemeProvider value={ios26NavigationTheme}>
        <StatusBar style="light" backgroundColor={ios26Colors.background} />
        <NavigationGuard />
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}
