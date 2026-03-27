import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";
import { ios26Colors, ios26StackScreenOptions } from "@/constants/ios26";

export default function HomeLayout() {
  return (
    <Stack screenOptions={ios26StackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            color: ios26Colors.textPrimary,
            fontWeight: "700",
          },
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                hitSlop={10}
                style={{ padding: 2 }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={ios26Colors.textPrimary}
                />
              </Pressable>
            </Link>
          ),
        }}
      />
    </Stack>
  );
}
