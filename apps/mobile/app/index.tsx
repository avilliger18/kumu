import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ios26Colors } from "@/constants/ios26";

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={ios26Colors.textPrimary} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(app)" : "/sign-in"} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios26Colors.background,
  },
});
