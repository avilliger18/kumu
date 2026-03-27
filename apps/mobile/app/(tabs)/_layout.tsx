import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useAuth } from "@/providers/auth-context";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/email" />;
  }

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger
        name="index"
        options={{
          title: "Overview",
          icon: { sf: "house.fill", drawable: "home" },
        }}
      />
      <NativeTabs.Trigger
        name="scan"
        options={{
          title: "Scan",
          icon: { sf: "barcode.viewfinder", drawable: "qr_code_scanner" },
        }}
      />
    </NativeTabs>
  );
}
