import { api } from "@kumu/backend/convex/_generated/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useQuery } from "convex/react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

// ── Helpers ───────────────────────────────────────────────────────────────────

const NUTRI_COLOR: Record<string, string> = {
  A: "#1A9E5A",
  B: "#7AC547",
  C: "#E6AE00",
  D: "#EF7D1A",
  E: "#E03520",
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScanRow({
  item,
  last,
}: {
  item: any;
  last: boolean;
}) {
  const canOpen = item.resolutionStatus !== "not_found" && item.barcodeRaw;

  return (
    <Pressable
      onPress={() =>
        canOpen
          ? router.push(`/product/${encodeURIComponent(item.barcodeRaw)}`)
          : undefined
      }
      style={({ pressed }) => [
        styles.scanItem,
        !last && styles.scanItemBorder,
        pressed && canOpen && styles.scanItemPressed,
      ]}>

      {/* Thumbnail */}
      <View style={styles.thumb}>
        {item.productImageUrl ? (
          <Image
            source={{ uri: item.productImageUrl }}
            style={styles.thumbImg}
            contentFit="contain"
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbPlaceholderText}>
              {item.productTitle?.[0] ?? "?"}
            </Text>
          </View>
        )}
      </View>

      {/* Text */}
      <View style={styles.scanBody}>
        <Text style={styles.scanName} numberOfLines={1}>
          {item.productTitle ?? item.barcodeRaw}
        </Text>
        <Text style={styles.scanSub} numberOfLines={1}>
          {item.producerDisplayName
            ? `${item.producerDisplayName} · ${timeAgo(item.scannedAt)}`
            : timeAgo(item.scannedAt)}
        </Text>
      </View>

      {/* Status chip */}
      {item.resolutionStatus === "not_found" ? (
        <View style={styles.chipUnknown}>
          <Text style={styles.chipUnknownText}>Unknown</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const scans = useQuery(api.products.recentUserScans) ?? [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Derive stats from live data
  const totalScans = scans.length;
  const uniqueProducts = new Set(scans.map((s: any) => s.barcodeNormalized)).size;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Overview</Text>
            <Text style={styles.dateText}>{today}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile")}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.7 }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{totalScans}</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={[styles.statCell, styles.statCellMid]}>
            <Text style={styles.statNumber}>{uniqueProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statNumber, { color: ios26Colors.success }]}>A</Text>
            <Text style={styles.statLabel}>Avg score</Text>
          </View>
        </View>

        {/* ── Scan history ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan history</Text>

          {scans.length === 0 ? (
            <View style={styles.emptyCard}>
              <SymbolView
                name="barcode.viewfinder"
                style={styles.emptyIcon}
                tintColor={ios26Colors.surfaceHigh}
                type="hierarchical"
              />
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptySub}>
                Tap Scan and point at any product barcode to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.scanList}>
              {scans.map((item: any, i: number) => (
                <ScanRow key={item._id} item={item} last={i === scans.length - 1} />
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerLeft: { gap: 4 },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 15,
    color: ios26Colors.textMuted,
  },
  avatarBtn: { marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5E5CE6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    overflow: "hidden",
  },
  statCell: {
    flex: 1,
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
  },
  statCellMid: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.surfaceHigh,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: ios26Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: { marginHorizontal: 20 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  // ── Scan list ─────────────────────────────────────────────────────────────
  scanList: {
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    overflow: "hidden",
  },
  scanItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  scanItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  scanItemPressed: {
    backgroundColor: ios26Colors.surfaceElevated,
  },

  // Thumbnail
  thumb: {
    width: 48,
    height: 48,
    borderRadius: ios26Radii.sm,
    backgroundColor: ios26Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: { width: 48, height: 48 },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: ios26Colors.textMuted,
  },

  // Row text
  scanBody: { flex: 1, gap: 3 },
  scanName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  scanSub: {
    fontSize: 13,
    color: ios26Colors.textMuted,
  },
  chevron: {
    fontSize: 20,
    color: ios26Colors.textMuted,
    fontWeight: "300",
  },

  // Unknown chip
  chipUnknown: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  chipUnknownText: {
    fontSize: 11,
    fontWeight: "600",
    color: ios26Colors.textMuted,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  emptySub: {
    fontSize: 14,
    color: ios26Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
