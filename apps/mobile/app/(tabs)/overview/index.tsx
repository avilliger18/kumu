import { api } from "@kumu/backend/convex/_generated/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useQuery } from "convex/react";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function ScanRow({ item, last }: { item: any; last: boolean }) {
  const canOpen = item.resolutionStatus !== "not_found" && item.barcodeRaw;

  return (
    <Pressable
      onPress={() =>
        canOpen
          ? router.push(`/product/${encodeURIComponent(item.barcodeRaw)}`)
          : undefined
      }
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && canOpen && styles.rowPressed,
      ]}>

      <View style={styles.thumb}>
        {item.productImageUrl ? (
          <Image
            source={{ uri: item.productImageUrl }}
            style={styles.thumbImg}
            contentFit="contain"
          />
        ) : (
          <View style={styles.thumbFallback}>
            <Text style={styles.thumbLetter}>
              {item.productTitle?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.productTitle ?? item.barcodeRaw}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {[item.producerDisplayName, timeAgo(item.scannedAt)]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>

      {item.resolutionStatus === "not_found" ? (
        <View style={styles.unknownChip}>
          <Text style={styles.unknownChipText}>Unknown</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OverviewScreen() {
  const [query, setQuery] = useState("");
  const scans = useQuery(api.products.recentUserScans) ?? [];

  const filtered = query.trim()
    ? scans.filter(
        (s: any) =>
          s.productTitle?.toLowerCase().includes(query.toLowerCase()) ||
          s.producerDisplayName?.toLowerCase().includes(query.toLowerCase()) ||
          s.barcodeRaw?.includes(query),
      )
    : scans;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Title bar ──────────────────────────────────────────────── */}
        <View style={styles.titleBar}>
          <Text style={styles.title}>Overview</Text>
          <Pressable
            onPress={() => router.push("/profile")}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <SymbolView
            name="magnifyingglass"
            style={styles.searchIcon}
            tintColor={ios26Colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history"
            placeholderTextColor={ios26Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* ── List ───────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <SymbolView
              name="barcode.viewfinder"
              style={styles.emptyIcon}
              tintColor={ios26Colors.surfaceHigh}
              type="hierarchical"
            />
            <Text style={styles.emptyTitle}>
              {query ? "No results" : "No scans yet"}
            </Text>
            <Text style={styles.emptySub}>
              {query
                ? "Try a different search term."
                : "Tap Scan and point at any product barcode to get started."}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((item: any, i: number) => (
              <ScanRow key={item._id} item={item} last={i === filtered.length - 1} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  scrollContent: { paddingBottom: 48 },

  // Title bar
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5E5CE6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.4,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: ios26Colors.surfaceElevated,
    gap: 6,
  },
  searchIcon: { width: 16, height: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#fff",
    paddingVertical: 0,
  },

  // List
  list: {
    marginHorizontal: 16,
    backgroundColor: ios26Colors.surface,
    borderRadius: ios26Radii.card,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  rowPressed: { backgroundColor: ios26Colors.surfaceElevated },

  // Thumbnail
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: ios26Colors.surfaceElevated,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImg: { width: 44, height: 44 },
  thumbFallback: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  thumbLetter: { fontSize: 18, fontWeight: "700", color: ios26Colors.textMuted },

  // Row text
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: "500", color: "#fff" },
  rowSub: { fontSize: 13, color: ios26Colors.textMuted },
  chevron: { fontSize: 20, color: ios26Colors.textMuted, fontWeight: "300" },

  // Unknown chip
  unknownChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  unknownChipText: { fontSize: 11, fontWeight: "600", color: ios26Colors.textMuted },

  // Empty state
  empty: {
    marginTop: 80,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyIcon: { width: 52, height: 52, marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#fff" },
  emptySub: {
    fontSize: 14,
    color: ios26Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
