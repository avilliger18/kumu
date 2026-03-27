import { Stack } from "expo-router";
import { PlatformColor } from "react-native";
import {
  ios26BlurEffect,
  ios26Colors,
  ios26StackScreenOptions,
} from "@/constants/ios26";

const iosProfileColors = {
  background: PlatformColor("systemGroupedBackground") as unknown as string,
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
          headerShown: true,
          title: "Profile",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: ios26BlurEffect,
          headerShadowVisible: false,
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
