import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import { useAuth } from "@/providers/auth-context";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/email" />;
  }

  const overviewTriggerProps = {
    name: "overview" as const,
    options: {
      title: "Overview",
      icon: { sf: "house.fill", drawable: "home" } as const,
    },
    ...(Platform.OS === "ios" ? { disableAutomaticContentInsets: true } : {}),
  };

  const chatsTriggerProps = {
    name: "chats" as const,
    options: {
      title: "Chats",
      icon: {
        sf: "bubble.left.and.bubble.right.fill",
        drawable: "chat",
      } as const,
    },
    ...(Platform.OS === "ios" ? { disableAutomaticContentInsets: true } : {}),
  };

  return (
    <NativeTabs minimizeBehavior="onScrollDown" iconColor="#1B3A5B">
      <NativeTabs.Trigger {...overviewTriggerProps} />
      <NativeTabs.Trigger
        name="scan"
        options={{
          title: "Scan",
          icon: { sf: "barcode.viewfinder", drawable: "qr_code_scanner" },
        }}
      />
      <NativeTabs.Trigger {...chatsTriggerProps} />
    </NativeTabs>
  );
}
