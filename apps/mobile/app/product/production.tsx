import { ScrollView, StyleSheet, Text } from "react-native";

import { ios26Colors } from "@/constants/ios26";

export default function ProductionScreen() {
  return (
    <ScrollView
      style={styles.root}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Supply chain</Text>
      <Text style={styles.subtitle}>
        Origin, manufacturing steps, and logistics data will appear here.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ios26Colors.surface,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: ios26Colors.textMuted,
    lineHeight: 22,
  },
});
