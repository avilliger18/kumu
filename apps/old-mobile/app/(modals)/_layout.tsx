import { Stack } from "expo-router";
import { PlatformColor } from "react-native";
import { ios26Colors, ios26StackScreenOptions } from "@/constants/ios26";
import ModalCloseButton from "@/components/common/modal-close-button";

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
            <ModalCloseButton backgroundColor={iosProfileColors.button} />
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
          presentation: "modal",
          headerShown: true,
          title: "",
          headerShadowVisible: false,
          headerLeft: () => (
            <ModalCloseButton backgroundColor={ios26Colors.surface} />
          ),
          headerStyle: {
            backgroundColor: ios26Colors.sheet,
          },
          headerTintColor: iosProfileColors.label,
          contentStyle: { backgroundColor: ios26Colors.sheet },
        }}
      />
    </Stack>
  );
}
