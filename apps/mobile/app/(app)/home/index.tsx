import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ios26Colors } from "@/constants/ios26";

const cards = [
  {
    title: "Products tracked",
    value: "2,184",
    detail: "Across 38 active batches",
  },
  { title: "Scans today", value: "146", detail: "12 pending verification" },
  { title: "Alerts", value: "4", detail: "2 high-priority issues" },
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Operations</Text>
        <Text style={styles.title}>Supply chain at a glance</Text>
        <Text style={styles.subtitle}>
          Track key activity and jump straight into scanning.
        </Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.title} style={styles.card}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardDetail}>{card.detail}</Text>
          </View>
        ))}
      </View>

      <Link href="/scan" asChild>
        <Pressable style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Open Scanner</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: ios26Colors.background,
    minHeight: "100%",
  },
  hero: {
    gap: 6,
  },
  eyebrow: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: ios26Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: ios26Colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: ios26Colors.chromeSoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.separator,
    gap: 4,
  },
  cardTitle: {
    color: ios26Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  cardValue: {
    color: ios26Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  cardDetail: {
    color: ios26Colors.textSecondary,
    fontSize: 13,
  },
  scanButton: {
    marginTop: 4,
    backgroundColor: ios26Colors.accentStrong,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  scanButtonText: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
