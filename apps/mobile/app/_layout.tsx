import "../global.css";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ThemeProvider } from "@react-navigation/native";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SystemUI from "expo-system-ui";
import { type ReactNode, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import {
  ios26Colors,
  ios26NavigationTheme,
  ios26StackScreenOptions,
} from "@/constants/ios26";
import { api } from "@kumu/backend/convex/_generated/api";

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

function RootNavigator() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const syncCurrentProfile = useMutation(api.users.syncCurrentProfile);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      syncCurrentProfile().catch(() => {});
    }
  }, [isAuthenticated, syncCurrentProfile]);

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
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
    </Stack>
  );
}

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <ThemeProvider value={ios26NavigationTheme}>{children}</ThemeProvider>
    </ConvexAuthProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(ios26Colors.background).catch(() => {});
  }, []);

  return (
    <AppProviders>
      <StatusBar style="light" backgroundColor={ios26Colors.background} />
      <RootNavigator />
    </AppProviders>
  );
}
