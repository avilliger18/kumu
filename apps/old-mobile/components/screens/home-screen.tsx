import { api } from "@kumu/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScanHistoryItem from "@/components/home/scan-history-item";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

export default function HomeScreen() {
  const recentScans = useQuery(api.products.recentUserScans) ?? [];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
    >
      {recentScans.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Recent scans</Text>
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
        <Pressable
          style={({ pressed }) => [
            styles.scanButton,
            pressed && styles.scanButtonPressed,
          ]}
        >
          <Text style={styles.scanButtonText}>Scan a product</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: ios26Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 20,
    minHeight: "100%",
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    color: ios26Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  list: {
    gap: 8,
  },
  emptyCard: {
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.separator,
    gap: 6,
  },
  emptyTitle: {
    color: ios26Colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  emptyText: {
    color: ios26Colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  scanButton: {
    backgroundColor: ios26Colors.accentStrong,
    borderRadius: ios26Radii.pill,
    paddingVertical: 15,
    alignItems: "center",
  },
  scanButtonPressed: {
    opacity: 0.8,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
