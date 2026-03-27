import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

function ScanTabIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.scanIcon, focused && styles.scanIconActive]}>
      <Ionicons name="barcode-outline" size={22} color={focused ? "#fff" : "#636366"} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1C1C1E",
          borderTopColor: "#38383A",
          borderTopWidth: 0.5,
          height: 84,
          paddingBottom: 28,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "#636366",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Globe",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "globe" : "globe-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <ScanTabIcon color={color} focused={focused} />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
            color: "#636366",
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanIcon: {
    width: 44,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  scanIconActive: {
    backgroundColor: "#0A84FF",
  },
});
