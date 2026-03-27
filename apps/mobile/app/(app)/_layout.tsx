import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ios26BlurEffect, ios26Colors } from "@/constants/ios26";

export const unstable_settings = {
  anchor: "home",
};

export default function AppLayout() {
  return (
    <NativeTabs
      backgroundColor={ios26Colors.chromeSoft}
      blurEffect={ios26BlurEffect}
      disableTransparentOnScrollEdge
      minimizeBehavior="onScrollDown"
      shadowColor="rgba(0,0,0,0.35)"
      tintColor={ios26Colors.accentStrong}
    >
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          androidSrc={<VectorIcon family={Ionicons} name="home-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
        <Icon
          sf={{ default: "magnifyingglass", selected: "magnifyingglass" }}
          androidSrc={<VectorIcon family={Ionicons} name="search-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="scan">
        <Label>Scan</Label>
        <Icon
          sf={{ default: "barcode.viewfinder", selected: "barcode.viewfinder" }}
          androidSrc={<VectorIcon family={Ionicons} name="barcode-outline" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
