import { Stack } from "expo-router";

import {
  ios26LargeTitleScreenOptions,
  ios26ScrollEdgeEffects,
} from "@/constants/ios26-navigation";

export default function ProductLayout() {
  return (
    <Stack
      screenOptions={{
        scrollEdgeEffects: ios26ScrollEdgeEffects,
      }}>
      <Stack.Screen name="[barcode]" />
      <Stack.Screen
        name="production"
        options={{
          title: "Production",
          ...ios26LargeTitleScreenOptions,
        }}
      />
    </Stack>
  );
}
