import { api } from "@kumu/backend/convex/_generated/api";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef } from "react";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

// ── Design helpers ────────────────────────────────────────────────────────────

const NUTRI: Record<string, { bg: string; fg: string }> = {
  A: { bg: "#1A9E5A", fg: "#fff" },
  B: { bg: "#7AC547", fg: "#fff" },
  C: { bg: "#E6AE00", fg: "#000" },
  D: { bg: "#EF7D1A", fg: "#fff" },
  E: { bg: "#E03520", fg: "#fff" },
};

const NOVA_COLOR: Record<number, string> = {
  1: "#1A9E5A",
  2: "#7AC547",
  3: "#EF7D1A",
  4: "#E03520",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function NutrientRow({
  label,
  value,
  unit = "g",
  sub = false,
  bold = false,
  last = false,
}: {
  label: string;
  value?: number;
  unit?: string;
  sub?: boolean;
  bold?: boolean;
  last?: boolean;
}) {
  if (value === undefined || value === null) return null;
  return (
    <View style={[s.nutriRow, !last && s.nutriRowBorder, sub && s.nutriRowSub]}>
      <Text style={[s.nutriLabel, bold && s.nutriBold, sub && s.nutriMuted]}>
        {label}
      </Text>
      <Text style={[s.nutriValue, bold && s.nutriBold, sub && s.nutriMuted]}>
        {Number.isInteger(value) ? value : value.toFixed(1)} {unit}
      </Text>
    </View>
  );
}

function ScorePill({
  letter,
  label,
  note,
  bg,
  fg = "#fff",
}: {
  letter: string;
  label: string;
  note?: string;
  bg: string;
  fg?: string;
}) {
  return (
    <View style={[s.scorePill, { backgroundColor: bg }]}>
      <Text style={[s.scoreLetter, { color: fg }]}>{letter}</Text>
      <Text style={[s.scoreLabel, { color: fg === "#fff" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)" }]}>
        {label}
      </Text>
      {note ? (
        <Text style={[s.scoreNote, { color: fg === "#fff" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" }]}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProductSheet() {
  const params = useLocalSearchParams<{ barcode: string; source?: string }>();
  const barcode = params.barcode ? decodeURIComponent(String(params.barcode)) : "";
  const source = params.source;
  const insets = useSafeAreaInsets();
  const recordScan = useMutation(api.products.recordScan);
  const recorded = useRef<string | null>(null);

  const result = useQuery(
    api.products.resolveProductByScan,
    barcode.length > 0 ? { barcode } : "skip",
  ) as any;

  // Record scan once
  useEffect(() => {
    if (!barcode || !result || source !== "scan" || recorded.current === barcode) return;
    const payload = result.resolutionStatus === "not_found"
      ? { sessionId: "mobile", barcodeRaw: barcode, resolutionStatus: "not_found" as const, clientPlatform: Platform.OS }
      : {
          sessionId: "mobile",
          barcodeRaw: barcode,
          batchCodeRaw: result.batch?.batchCodeRaw,
          resolutionStatus: result.batch ? ("found" as const) : ("found_no_batch" as const),
          productTitle: result.product?.title,
          productSubtitle: result.product?.subtitle,
          productImageUrl: result.product?.thumbnailUrl,
          producerDisplayName: result.producer?.displayName,
          clientPlatform: Platform.OS,
        };
    recordScan(payload).catch(() => {});
    recorded.current = barcode;
  }, [barcode, result, source, recordScan]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (result === undefined) {
    return (
      <View style={[s.root, s.center]}>
        <ActivityIndicator color={ios26Colors.textPrimary} size="large" />
        <Text style={s.loadingText}>Looking up product…</Text>
      </View>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (result.resolutionStatus === "not_found") {
    return (
      <View style={[s.root, s.center]}>
        <SymbolView name="barcode" style={s.nfIcon} tintColor={ios26Colors.textMuted} type="hierarchical" />
        <Text style={s.nfTitle}>Product not found</Text>
        <Text style={s.nfSub}>{barcode}</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.nfBtn, pressed && { opacity: 0.72 }]}>
          <Text style={s.nfBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const { product, producer, batch } = result;
  const nutrition = product.nutrition?.per100 ?? {};
  const qs = product.qualityScores ?? {};

  // Random CO₂ distance for now (20 000 – 60 000 km)
  const co2Distance = Math.floor(20000 + Math.random() * 40000)
    .toLocaleString("de-CH")
    .replace(",", "'");

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={s.heroCard}>
          {/* Image area */}
          <View style={s.heroImageArea}>
            {product.thumbnailUrl ? (
              <Image
                source={{ uri: product.thumbnailUrl }}
                style={s.heroImage}
                contentFit="contain"
              />
            ) : (
              <SymbolView
                name="photo"
                style={s.heroPlaceholderIcon}
                tintColor={ios26Colors.surfaceHigh}
              />
            )}

            {/* Close button floats over image */}
            <Pressable
              onPress={() => router.back()}
              style={s.closeBtn}
              hitSlop={12}>
              <SymbolView name="xmark" style={s.closeIcon} tintColor={ios26Colors.textMuted} />
            </Pressable>

            {/* NutriScore badge floats bottom-right of image */}
            {qs.nutriScore ? (
              <View style={[s.nutriBadge, { backgroundColor: NUTRI[qs.nutriScore]?.bg ?? ios26Colors.surfaceElevated }]}>
                <Text style={[s.nutriBadgeLetter, { color: NUTRI[qs.nutriScore]?.fg ?? "#fff" }]}>
                  {qs.nutriScore}
                </Text>
                <Text style={[s.nutriBadgeLabel, { color: NUTRI[qs.nutriScore]?.fg === "#000" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)" }]}>
                  {"Nutri\nScore"}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Text area */}
          <View style={s.heroText}>
            <Text style={s.heroTitle} numberOfLines={2}>{product.title}</Text>
            {product.subtitle ? (
              <Text style={s.heroSubtitle}>{product.subtitle}</Text>
            ) : null}
            <View style={s.heroBrandRow}>
              <Text style={s.heroBrand}>{producer?.displayName ?? "Unknown"}</Text>
              {product.category ? (
                <>
                  <Text style={s.heroDot}>·</Text>
                  <Text style={s.heroCategory}>{product.category}</Text>
                </>
              ) : null}
            </View>
            <Text style={s.heroBarcode}>{barcode}</Text>
          </View>

          {/* Quality score strip */}
          {(qs.novaGroup || qs.overallFoodScore !== undefined) ? (
            <View style={s.scoreStrip}>
              {qs.novaGroup ? (
                <ScorePill
                  letter={String(qs.novaGroup)}
                  label="NOVA"
                  note={qs.processingLevel}
                  bg={NOVA_COLOR[qs.novaGroup] ?? ios26Colors.surfaceElevated}
                />
              ) : null}
              {qs.overallFoodScore !== undefined ? (
                <ScorePill
                  letter={String(qs.overallFoodScore)}
                  label="Food score"
                  bg={ios26Colors.surfaceElevated}
                />
              ) : null}
            </View>
          ) : null}
        </View>

        {/* ── Ingredients ───────────────────────────────────────────────── */}
        {product.ingredientsText ? (
          <View style={s.section}>
            <SectionHeader title="Ingredients" />
            <Card>
              <Text style={s.ingredientsText}>{product.ingredientsText}</Text>
            </Card>
          </View>
        ) : null}

        {/* ── Nutrition ─────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title={`Nutritional values · per ${product.nutrition?.referenceBasis ?? "100g"}`} />
          <Card style={s.cardNoPad}>
            <NutrientRow label="Energy" value={nutrition.energyKcal} unit="kcal" bold />
            <NutrientRow label="Fat" value={nutrition.fat} bold />
            <NutrientRow label="of which saturates" value={nutrition.saturatedFat} sub />
            <NutrientRow label="Carbohydrates" value={nutrition.carbs} bold />
            <NutrientRow label="of which sugars" value={nutrition.sugars} sub />
            <NutrientRow label="Fibre" value={nutrition.fiber} />
            <NutrientRow label="Protein" value={nutrition.protein} bold />
            <NutrientRow label="Salt" value={nutrition.salt} />
            {nutrition.calcium !== undefined && <NutrientRow label="Calcium" value={nutrition.calcium} unit="mg" />}
            {nutrition.iron !== undefined && <NutrientRow label="Iron" value={nutrition.iron} unit="mg" />}
            {nutrition.magnesium !== undefined && <NutrientRow label="Magnesium" value={nutrition.magnesium} unit="mg" last />}
            {!nutrition.magnesium && !nutrition.iron && !nutrition.calcium && (
              <NutrientRow label="Salt" value={nutrition.salt} last />
            )}
          </Card>
        </View>

        {/* ── Additives ─────────────────────────────────────────────────── */}
        {product.additives?.length > 0 ? (
          <View style={s.section}>
            <SectionHeader title="Additives" />
            <Card style={s.cardNoPad}>
              {product.additives.map((a: any, i: number) => (
                <View
                  key={a.code}
                  style={[s.additiveRow, i < product.additives.length - 1 && s.additiveBorder]}>
                  <Text style={s.additiveCode}>{a.code}</Text>
                  <Text style={s.additiveName} numberOfLines={1}>{a.name ?? a.code}</Text>
                  <View style={[s.riskChip,
                    a.riskLevel === "low" && s.riskLow,
                    a.riskLevel === "moderate" && s.riskMid,
                    a.riskLevel === "high" && s.riskHigh,
                  ]}>
                    <Text style={s.riskChipText}>{a.riskLevel}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* ── Production (placeholder) ──────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Production" />
          <Card>
            <View style={s.productionPlaceholder}>
              <SymbolView name="globe.europe.africa.fill" style={s.productionIcon} tintColor={ios26Colors.surfaceHigh} />
              <Text style={s.productionPlaceholderText}>Supply chain data coming soon</Text>
            </View>
          </Card>
        </View>

        {/* ── Ecological footprint ──────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Ecological Footprint" />
          <Card>
            <Text style={s.co2Label}>Distance traveled</Text>
            <Text style={s.co2Value}>{co2Distance} <Text style={s.co2Unit}>km</Text></Text>
            <View style={s.co2Bar}>
              <View style={s.co2BarFill} />
            </View>
          </Card>
        </View>

        {/* ── Producer ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Producer" />
          <Card style={s.producerCard}>
            <View style={s.producerLeft}>
              <Text style={s.producerName}>{producer?.displayName}</Text>
              {producer?.name && producer.name !== producer.displayName ? (
                <Text style={s.producerLegal}>{producer.name}</Text>
              ) : null}
              {producer?.countryCode ? (
                <Text style={s.producerCountry}>{producer.countryCode}</Text>
              ) : null}
            </View>
            {producer?.verificationStatus === "verified" ? (
              <SymbolView
                name="checkmark.seal.fill"
                style={s.verifiedIcon}
                tintColor={ios26Colors.success}
                type="hierarchical"
              />
            ) : null}
          </Card>
        </View>

        {/* ── Batch ─────────────────────────────────────────────────────── */}
        {batch ? (
          <View style={s.section}>
            <SectionHeader title="Batch traceability" />
            <View style={s.batchGrid}>
              <View style={s.batchCell}>
                <Text style={s.batchKey}>Lot code</Text>
                <Text style={s.batchVal}>{batch.batchCodeRaw}</Text>
              </View>
              {batch.originCountry ? (
                <View style={s.batchCell}>
                  <Text style={s.batchKey}>Origin</Text>
                  <Text style={s.batchVal}>{batch.originCountry}</Text>
                </View>
              ) : null}
              {batch.manufacturedAt ? (
                <View style={s.batchCell}>
                  <Text style={s.batchKey}>Manufactured</Text>
                  <Text style={s.batchVal}>{new Date(batch.manufacturedAt).toLocaleDateString()}</Text>
                </View>
              ) : null}
              {batch.bestBeforeAt ? (
                <View style={s.batchCell}>
                  <Text style={s.batchKey}>Best before</Text>
                  <Text style={s.batchVal}>{new Date(batch.bestBeforeAt).toLocaleDateString()}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ios26Colors.surface,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },

  // ── Close button ────────────────────────────────────────────────────────
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { width: 14, height: 14 },

  // ── Loading / not-found ─────────────────────────────────────────────────
  loadingText: {
    color: ios26Colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
  nfIcon: { width: 56, height: 56 },
  nfTitle: { color: ios26Colors.textPrimary, fontSize: 20, fontWeight: "700" },
  nfSub: { color: ios26Colors.textMuted, fontSize: 13 },
  nfBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: ios26Radii.pill,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  nfBtnText: { color: ios26Colors.textPrimary, fontSize: 15, fontWeight: "600" },

  // ── Hero ────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: ios26Colors.surface,
    marginBottom: 8,
    overflow: "hidden",
  },
  heroImageArea: {
    width: "100%",
    height: 220,
    backgroundColor: ios26Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholderIcon: { width: 64, height: 64 },
  nutriBadge: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: ios26Radii.md,
  },
  nutriBadgeLetter: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
  },
  nutriBadgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    lineHeight: 12,
  },
  heroText: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 3,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: ios26Colors.textMuted,
  },
  heroBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  heroBrand: {
    fontSize: 14,
    color: ios26Colors.textMuted,
  },
  heroDot: {
    fontSize: 14,
    color: ios26Colors.surfaceHigh,
  },
  heroCategory: {
    fontSize: 14,
    color: ios26Colors.textMuted,
  },
  heroBarcode: {
    fontSize: 12,
    color: ios26Colors.surfaceHigh,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  scoreStrip: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexWrap: "wrap",
  },

  // ── Sections ────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: ios26Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 16,
  },

  // ── Card ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: ios26Colors.surfaceElevated,
    borderRadius: ios26Radii.card,
    padding: 16,
  },
  cardNoPad: {
    padding: 0,
    overflow: "hidden",
  },

  // ── Scores ──────────────────────────────────────────────────────────────
  scorePill: {
    minWidth: 80,
    borderRadius: ios26Radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 2,
  },
  scoreLetter: { fontSize: 28, fontWeight: "800", lineHeight: 32 },
  scoreLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  scoreNote: { fontSize: 10, textAlign: "center" },

  // ── Ingredients ─────────────────────────────────────────────────────────
  ingredientsText: {
    color: ios26Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Nutrition rows ──────────────────────────────────────────────────────
  nutriRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  nutriRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  nutriRowSub: { paddingLeft: 32 },
  nutriLabel: { fontSize: 15, color: ios26Colors.textMuted },
  nutriValue: { fontSize: 15, color: ios26Colors.textMuted, fontVariant: ["tabular-nums"] },
  nutriBold: { color: ios26Colors.textPrimary, fontWeight: "600" },
  nutriMuted: { fontSize: 14, color: ios26Colors.surfaceHigh },

  // ── Additives ───────────────────────────────────────────────────────────
  additiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  additiveBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  additiveCode: { width: 42, color: ios26Colors.accent, fontSize: 13, fontWeight: "700" },
  additiveName: { flex: 1, color: ios26Colors.textMuted, fontSize: 14 },
  riskChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  riskLow: { backgroundColor: "rgba(48,209,88,0.14)" },
  riskMid: { backgroundColor: "rgba(255,159,10,0.14)" },
  riskHigh: { backgroundColor: "rgba(255,69,58,0.14)" },
  riskChipText: { fontSize: 11, fontWeight: "600", color: ios26Colors.textMuted, textTransform: "capitalize" },

  // ── Production placeholder ──────────────────────────────────────────────
  productionPlaceholder: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  productionIcon: { width: 44, height: 44 },
  productionPlaceholderText: { color: ios26Colors.textMuted, fontSize: 14 },

  // ── CO₂ ─────────────────────────────────────────────────────────────────
  co2Label: { fontSize: 13, color: ios26Colors.textMuted, marginBottom: 4 },
  co2Value: { fontSize: 40, fontWeight: "700", color: ios26Colors.textPrimary, letterSpacing: -1 },
  co2Unit: { fontSize: 22, fontWeight: "500", letterSpacing: 0 },
  co2Bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: ios26Colors.surfaceElevated,
    marginTop: 14,
    overflow: "hidden",
  },
  co2BarFill: {
    width: "62%",
    height: "100%",
    borderRadius: 2,
    backgroundColor: ios26Colors.warning,
  },

  // ── Producer ────────────────────────────────────────────────────────────
  producerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  producerLeft: { flex: 1, gap: 2 },
  producerName: { fontSize: 16, fontWeight: "700", color: ios26Colors.textPrimary },
  producerLegal: { fontSize: 12, color: ios26Colors.textMuted },
  producerCountry: { fontSize: 13, color: ios26Colors.textMuted },
  verifiedIcon: { width: 26, height: 26 },

  // ── Batch ────────────────────────────────────────────────────────────────
  batchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  batchCell: {
    flex: 1,
    minWidth: "44%",
    padding: 14,
    borderRadius: ios26Radii.md,
    backgroundColor: ios26Colors.surfaceElevated,
    gap: 4,
  },
  batchKey: {
    fontSize: 11,
    fontWeight: "700",
    color: ios26Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  batchVal: { fontSize: 14, fontWeight: "600", color: ios26Colors.textPrimary },
});
