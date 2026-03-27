import { Link, Stack } from "expo-router";
import { PlatformColor } from "react-native";
import { Pressable } from "react-native";
import { SymbolView } from "expo-symbols";
import { ios26Colors, ios26StackScreenOptions } from "@/constants/ios26";

const iosProfileColors = {
  background: "#1C1C1E",
  button: "#2C2C2E",
  label: PlatformColor("label") as unknown as string,
};

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        ...ios26StackScreenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Profile",
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerLeft: () => (
            <Link href=".." asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close profile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: iosProfileColors.button,
                }}
              >
                <SymbolView
                  name="xmark"
                  style={{ width: 18, height: 18 }}
                  tintColor={iosProfileColors.label}
                  type="hierarchical"
                />
              </Pressable>
            </Link>
          ),
          headerStyle: {
            backgroundColor: iosProfileColors.background,
          },
          headerTintColor: iosProfileColors.label,
          headerTitleStyle: {
            color: iosProfileColors.label,
            fontWeight: "600",
          },
          headerLargeTitleStyle: {
            color: iosProfileColors.label,
          },
          contentStyle: {
            backgroundColor: iosProfileColors.background,
          },
        }}
      />
      <Stack.Screen
        name="product/[barcode]"
        options={{
          contentStyle: { backgroundColor: ios26Colors.sheet },
        }}
      />
    </Stack>
  );
}
