import { Stack } from "expo-router";
import { ios26Colors, ios26StackScreenOptions } from "@/constants/ios26";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        ...ios26StackScreenOptions,
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen
        name="verify"
        options={{
          headerShown: true,
          title: "Enter Code",
          headerBackButtonDisplayMode: "minimal",
          headerStyle: { backgroundColor: ios26Colors.background },
        }}
      />
    </Stack>
  );
}
