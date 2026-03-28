import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/providers/auth-context";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="email" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
