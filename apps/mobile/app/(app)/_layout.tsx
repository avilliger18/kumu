import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import { ios26BlurEffect, ios26Colors } from "@/constants/ios26";

export default function AppLayout() {
  return (
    <NativeTabs
      backgroundColor={ios26Colors.chromeSoft}
      badgeBackgroundColor={ios26Colors.accentStrong}
      blurEffect={ios26BlurEffect}
      disableTransparentOnScrollEdge
      iconColor={{
        default: ios26Colors.textMuted,
        selected: ios26Colors.textPrimary,
      }}
      labelStyle={{
        default: {
          color: ios26Colors.textMuted,
          fontSize: 10,
          fontWeight: "600",
        },
        selected: {
          color: ios26Colors.textPrimary,
          fontSize: 10,
          fontWeight: "600",
        },
      }}
      minimizeBehavior="onScrollDown"
      shadowColor="rgba(0,0,0,0.35)"
      tintColor={ios26Colors.accentStrong}
    >
      <NativeTabs.Trigger name="globe">
        <Label>Globe</Label>
        <Icon
          sf={{ default: "globe.europe.africa", selected: "globe.europe.africa.fill" }}
          androidSrc={<VectorIcon family={Ionicons} name="earth-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="scan">
        <Label>Scan</Label>
        <Icon
          sf={{ default: "barcode.viewfinder", selected: "barcode.viewfinder" }}
          androidSrc={<VectorIcon family={Ionicons} name="barcode-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
          androidSrc={<VectorIcon family={Ionicons} name="person-circle-outline" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
