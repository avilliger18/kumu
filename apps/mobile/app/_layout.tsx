import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ios26ModalOptions } from "@/constants/ios26-navigation";
import { AuthProvider } from "@/providers/auth-context";
import { ConvexClientProvider } from "@/providers/convex-provider";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={ios26ModalOptions} />
            <Stack.Screen
              name="product"
              options={{
                ...ios26ModalOptions,
                headerShown: false,
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </ConvexClientProvider>
  );
}
