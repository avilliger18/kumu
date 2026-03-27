import { api } from "@kumu/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "expo-router";
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScanHistoryItem from "@/components/home/scan-history-item";

const ios = {
  background: PlatformColor("systemGroupedBackground"),
  card: PlatformColor("secondarySystemGroupedBackground"),
  label: PlatformColor("label"),
  secondaryLabel: PlatformColor("secondaryLabel"),
  tertiaryLabel: PlatformColor("tertiaryLabel"),
  separator: PlatformColor("separator"),
  systemBlue: PlatformColor("systemBlue"),
};

export default function HomeScreen() {
  const recentScans = useQuery(api.products.recentUserScans) ?? [];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Recent</Text>
        <Text style={styles.title}>Scan history</Text>
        <Text style={styles.subtitle}>
          Your latest scanned products show up here.
        </Text>
      </View>

      {recentScans.length > 0 ? (
        <View style={styles.list}>
          {recentScans.map((scan) => (
            <ScanHistoryItem
              key={scan._id}
              barcode={scan.barcodeRaw}
              title={scan.productTitle}
              subtitle={scan.productSubtitle || scan.producerDisplayName}
              imageUrl={scan.productImageUrl}
              scannedAt={scan.scannedAt}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyText}>
            Scan a product and it will appear here.
          </Text>
        </View>
      )}

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
  list: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: ios.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios.separator,
    gap: 6,
  },
  emptyTitle: {
    color: ios.label,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: ios.secondaryLabel,
    fontSize: 15,
    lineHeight: 21,
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
