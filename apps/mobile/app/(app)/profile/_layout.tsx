import { Stack } from "expo-router";
import { ios26Colors, ios26StackScreenOptions } from "@/constants/ios26";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={ios26StackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerLargeTitleEnabled: true,
          headerLargeStyle: {
            backgroundColor: ios26Colors.background,
          },
          headerLargeTitleStyle: {
            color: ios26Colors.textPrimary,
            fontWeight: "700",
          },
        }}
      />
    </Stack>
  );
}
