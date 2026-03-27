import { Link } from "expo-router";
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ios = {
  background: PlatformColor("systemGroupedBackground"),
  card: PlatformColor("secondarySystemGroupedBackground"),
  label: PlatformColor("label"),
  secondaryLabel: PlatformColor("secondaryLabel"),
  tertiaryLabel: PlatformColor("tertiaryLabel"),
  separator: PlatformColor("separator"),
  systemBlue: PlatformColor("systemBlue"),
};

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
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
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
    backgroundColor: ios.background,
    minHeight: "100%",
  },
  scrollView: {
    flex: 1,
    backgroundColor: ios.background,
  },
  hero: {
    gap: 6,
  },
  eyebrow: {
    color: ios.systemBlue,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: ios.label,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: ios.secondaryLabel,
    fontSize: 15,
    lineHeight: 21,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: ios.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios.separator,
    gap: 4,
  },
  cardTitle: {
    color: ios.secondaryLabel,
    fontSize: 13,
    fontWeight: "600",
  },
  cardValue: {
    color: ios.label,
    fontSize: 28,
    fontWeight: "700",
  },
  cardDetail: {
    color: ios.tertiaryLabel,
    fontSize: 13,
  },
  scanButton: {
    marginTop: 4,
    backgroundColor: ios.systemBlue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
