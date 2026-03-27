import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONFIG = [
  { name: "index",   symbol: "globe",                label: "Globe"   },
  { name: "scan",    symbol: "barcode.viewfinder",   label: "Scan"    },
  { name: "profile", symbol: "person.crop.circle",   label: "Profile" },
] as const;

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.barWrapper, { paddingBottom: insets.bottom + 8 }]}>
      <View style={s.barOuter}>
        <BlurView
          intensity={Platform.OS === "ios" ? 70 : 100}
          tint="systemChromeMaterialDark"
          style={s.blurFill}
        />
        <View style={s.barInner}>
          {state.routes.map((route, idx) => {
            const cfg = TAB_CONFIG[idx];
            const focused = state.index === idx;
            const { options } = descriptors[route.key];
            const onPress = () => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={s.tabItem}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              >
                {focused && <View style={s.activePill} />}
                <SymbolView
                  name={cfg.symbol}
                  style={s.symbol}
                  type="hierarchical"
                  tintColor={focused ? "#FFFFFF" : "#636366"}
                />
                <Text style={[s.label, focused && s.labelActive]}>
                  {cfg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"   />
      <Tabs.Screen name="scan"    />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  barOuter: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
  },
  barInner: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: Platform.OS === "android" ? "rgba(28,28,30,0.92)" : "rgba(28,28,30,0.4)",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
    borderRadius: 20,
    position: "relative",
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
  },
  symbol: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#636366",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
