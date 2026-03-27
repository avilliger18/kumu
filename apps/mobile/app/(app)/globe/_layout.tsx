import { Stack } from "expo-router";
import { ios26GlassHeaderOptions } from "@/constants/ios26";

export default function GlobeLayout() {
  return (
    <Stack screenOptions={ios26GlassHeaderOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Globe",
        }}
      />
    </Stack>
  );
}
