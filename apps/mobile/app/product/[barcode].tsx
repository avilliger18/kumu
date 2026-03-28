import { api } from "@kumu/backend/convex/_generated/api";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef } from "react";
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

import { createSession } from "@/stores/chats";
import {
  createNativeCloseButtonOptions,
  ios26ScrollEdgeEffects,
} from "@/constants/ios26-navigation";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

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
  const subColor = fg === "#fff" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)";
  const noteColor = fg === "#fff" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";

  return (
    <View style={[s.scorePill, { backgroundColor: bg }]}>
      <Text style={[s.scoreLetter, { color: fg }]}>{letter}</Text>
      <Text style={[s.scoreLabel, { color: subColor }]}>{label}</Text>
      {note ? <Text style={[s.scoreNote, { color: noteColor }]}>{note}</Text> : null}
    </View>
  );
}

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

  const isResolvedProduct = result && result.resolutionStatus !== "not_found";
  const productTitle = isResolvedProduct ? result.product?.title ?? "Product" : "Product";

  useEffect(() => {
    if (!barcode || !result || source !== "scan" || recorded.current === barcode) {
      return;
    }

    const payload =
      result.resolutionStatus === "not_found"
        ? {
            sessionId: "mobile",
            barcodeRaw: barcode,
            resolutionStatus: "not_found" as const,
            clientPlatform: Platform.OS,
          }
        : {
            sessionId: "mobile",
            barcodeRaw: barcode,
            batchCodeRaw: result.batch?.batchCodeRaw,
            resolutionStatus: result.batch
              ? ("found" as const)
              : ("found_no_batch" as const),
            productTitle: result.product?.title,
            productSubtitle: result.product?.subtitle,
            productImageUrl: result.product?.thumbnailUrl,
            producerDisplayName: result.producer?.displayName,
            clientPlatform: Platform.OS,
          };

    recordScan(payload).catch(() => {});
    recorded.current = barcode;
  }, [barcode, result, source, recordScan]);

  const screenOptions = {
    title: productTitle,
    scrollEdgeEffects: ios26ScrollEdgeEffects,
    ...(Platform.OS === "ios"
      ? createNativeCloseButtonOptions(() => router.back())
      : {
          headerLeft: ({ tintColor }: { tintColor?: string }) => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [pressed && s.headerActionPressed]}>
              <Text style={[s.headerAction, tintColor ? { color: tintColor } : null]}>
                Close
              </Text>
            </Pressable>
          ),
        }),
  };

  if (result === undefined) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <View style={[s.root, s.center]}>
          <ActivityIndicator color={ios26Colors.textPrimary} size="large" />
          <Text style={s.loadingText}>Looking up product...</Text>
        </View>
      </>
    );
  }

  if (result.resolutionStatus === "not_found") {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <View style={[s.root, s.center]}>
          <SymbolView
            name="barcode"
            style={s.nfIcon}
            tintColor={ios26Colors.textMuted}
            type="hierarchical"
          />
          <Text style={s.nfTitle}>Product not found</Text>
          <Text style={s.nfSub}>{barcode}</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.nfBtn, pressed && { opacity: 0.72 }]}>
            <Text style={s.nfBtnText}>Go back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const { product, producer, batch } = result;
  const nutrition = product.nutrition?.per100 ?? {};
  const qs = product.qualityScores ?? {};

  const co2Distance = Math.floor(20000 + Math.random() * 40000)
    .toLocaleString("de-CH")
    .replace(",", "'");

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <View style={s.wrapper}>
      <ScrollView
        style={s.root}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        <View style={s.heroCard}>
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

            {qs.nutriScore ? (
              <View
                style={[
                  s.nutriBadge,
                  {
                    backgroundColor:
                      NUTRI[qs.nutriScore]?.bg ?? ios26Colors.surfaceElevated,
                  },
                ]}>
                <Text
                  style={[
                    s.nutriBadgeLetter,
                    { color: NUTRI[qs.nutriScore]?.fg ?? "#fff" },
                  ]}>
                  {qs.nutriScore}
                </Text>
                <Text
                  style={[
                    s.nutriBadgeLabel,
                    {
                      color:
                        NUTRI[qs.nutriScore]?.fg === "#000"
                          ? "rgba(0,0,0,0.55)"
                          : "rgba(255,255,255,0.7)",
                    },
                  ]}>
                  {"Nutri\nScore"}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.heroText}>
            <Text style={s.heroTitle} numberOfLines={2}>
              {product.title}
            </Text>
            {product.subtitle ? (
              <Text style={s.heroSubtitle}>{product.subtitle}</Text>
            ) : null}
            <View style={s.heroBrandRow}>
              <Text style={s.heroBrand}>{producer?.displayName ?? "Unknown"}</Text>
              {product.category ? (
                <>
                  <Text style={s.heroDot}>/</Text>
                  <Text style={s.heroCategory}>{product.category}</Text>
                </>
              ) : null}
            </View>
            <Text style={s.heroBarcode}>{barcode}</Text>
          </View>

          {qs.novaGroup || qs.overallFoodScore !== undefined ? (
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

        {product.ingredientsText ? (
          <View style={s.section}>
            <SectionHeader title="Ingredients" />
            <Card>
              <Text style={s.ingredientsText}>{product.ingredientsText}</Text>
            </Card>
          </View>
        ) : null}

        <View style={s.section}>
          <SectionHeader
            title={`Nutritional values - per ${product.nutrition?.referenceBasis ?? "100g"}`}
          />
          <Card style={s.cardNoPad}>
            <NutrientRow label="Energy" value={nutrition.energyKcal} unit="kcal" bold />
            <NutrientRow label="Fat" value={nutrition.fat} bold />
            <NutrientRow label="of which saturates" value={nutrition.saturatedFat} sub />
            <NutrientRow label="Carbohydrates" value={nutrition.carbs} bold />
            <NutrientRow label="of which sugars" value={nutrition.sugars} sub />
            <NutrientRow label="Fibre" value={nutrition.fiber} />
            <NutrientRow label="Protein" value={nutrition.protein} bold />
            <NutrientRow label="Salt" value={nutrition.salt} />
            {nutrition.calcium !== undefined ? (
              <NutrientRow label="Calcium" value={nutrition.calcium} unit="mg" />
            ) : null}
            {nutrition.iron !== undefined ? (
              <NutrientRow label="Iron" value={nutrition.iron} unit="mg" />
            ) : null}
            {nutrition.magnesium !== undefined ? (
              <NutrientRow
                label="Magnesium"
                value={nutrition.magnesium}
                unit="mg"
                last
              />
            ) : !nutrition.iron && !nutrition.calcium ? (
              <NutrientRow label="Salt" value={nutrition.salt} last />
            ) : null}
          </Card>
        </View>

        {product.additives?.length > 0 ? (
          <View style={s.section}>
            <SectionHeader title="Additives" />
            <Card style={s.cardNoPad}>
              {product.additives.map((additive: any, index: number) => (
                <View
                  key={additive.code}
                  style={[
                    s.additiveRow,
                    index < product.additives.length - 1 && s.additiveBorder,
                  ]}>
                  <Text style={s.additiveCode}>{additive.code}</Text>
                  <Text style={s.additiveName} numberOfLines={1}>
                    {additive.name ?? additive.code}
                  </Text>
                  <View
                    style={[
                      s.riskChip,
                      additive.riskLevel === "low" && s.riskLow,
                      additive.riskLevel === "moderate" && s.riskMid,
                      additive.riskLevel === "high" && s.riskHigh,
                    ]}>
                    <Text style={s.riskChipText}>{additive.riskLevel}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <View style={s.section}>
          <SectionHeader title="Production" />
          <Pressable
            onPress={() => router.push("/product/production")}
            style={({ pressed }) => [s.card, s.productionRow, pressed && s.productionRowPressed]}>
            <SymbolView
              name="globe.europe.africa.fill"
              style={s.productionIcon}
              tintColor={ios26Colors.textMuted}
              type="hierarchical"
            />
            <View style={s.productionText}>
              <Text style={s.productionTitle}>Supply chain</Text>
              <Text style={s.productionSub}>Origin, manufacturing & logistics</Text>
            </View>
            <Text style={s.productionChevron}>{">"}</Text>
          </Pressable>
        </View>

        <View style={s.section}>
          <SectionHeader title="Ecological Footprint" />
          <Card>
            <Text style={s.co2Label}>Distance traveled</Text>
            <Text style={s.co2Value}>
              {co2Distance} <Text style={s.co2Unit}>km</Text>
            </Text>
            <View style={s.co2Bar}>
              <View style={s.co2BarFill} />
            </View>
          </Card>
        </View>

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
                  <Text style={s.batchVal}>
                    {new Date(batch.manufacturedAt).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}
              {batch.bestBeforeAt ? (
                <View style={s.batchCell}>
                  <Text style={s.batchKey}>Best before</Text>
                  <Text style={s.batchVal}>
                    {new Date(batch.bestBeforeAt).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating AI button — bottom right */}
      <Pressable
        onPress={() => {
          const id = createSession(product.title ?? barcode, barcode);
          router.push(`/chat?id=${id}`);
        }}
        style={({ pressed }) => [s.aiFab, pressed && s.aiFabPressed]}>
        <SymbolView
          name="sparkle"
          style={s.aiFabIcon}
          tintColor="#fff"
          type="hierarchical"
        />
      </Pressable>

      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: ios26Colors.surface,
  },
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
  headerAction: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerActionPressed: {
    opacity: 0.72,
  },
  loadingText: {
    color: ios26Colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
  nfIcon: {
    width: 56,
    height: 56,
  },
  nfTitle: {
    color: ios26Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  nfSub: {
    color: ios26Colors.textMuted,
    fontSize: 13,
  },
  nfBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: ios26Radii.pill,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  nfBtnText: {
    color: ios26Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
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
  heroPlaceholderIcon: {
    width: 64,
    height: 64,
  },
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
  card: {
    backgroundColor: ios26Colors.surfaceElevated,
    borderRadius: ios26Radii.card,
    padding: 16,
  },
  cardNoPad: {
    padding: 0,
    overflow: "hidden",
  },
  scorePill: {
    minWidth: 80,
    borderRadius: ios26Radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 2,
  },
  scoreLetter: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreNote: {
    fontSize: 10,
    textAlign: "center",
  },
  ingredientsText: {
    color: ios26Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
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
  nutriRowSub: {
    paddingLeft: 32,
  },
  nutriLabel: {
    fontSize: 15,
    color: ios26Colors.textMuted,
  },
  nutriValue: {
    fontSize: 15,
    color: ios26Colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  nutriBold: {
    color: ios26Colors.textPrimary,
    fontWeight: "600",
  },
  nutriMuted: {
    fontSize: 14,
    color: ios26Colors.surfaceHigh,
  },
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
  additiveCode: {
    width: 42,
    color: ios26Colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  additiveName: {
    flex: 1,
    color: ios26Colors.textMuted,
    fontSize: 14,
  },
  riskChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  riskLow: {
    backgroundColor: "rgba(48,209,88,0.14)",
  },
  riskMid: {
    backgroundColor: "rgba(255,159,10,0.14)",
  },
  riskHigh: {
    backgroundColor: "rgba(255,69,58,0.14)",
  },
  riskChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: ios26Colors.textMuted,
    textTransform: "capitalize",
  },
  productionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  productionRowPressed: {
    backgroundColor: ios26Colors.surfaceHigh,
  },
  productionIcon: {
    width: 32,
    height: 32,
  },
  productionText: {
    flex: 1,
    gap: 3,
  },
  productionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  productionSub: {
    fontSize: 13,
    color: ios26Colors.textMuted,
  },
  productionChevron: {
    fontSize: 20,
    color: ios26Colors.textMuted,
    fontWeight: "300",
  },
  co2Label: {
    fontSize: 13,
    color: ios26Colors.textMuted,
    marginBottom: 4,
  },
  co2Value: {
    fontSize: 40,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -1,
  },
  co2Unit: {
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: 0,
  },
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
  producerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  producerLeft: {
    flex: 1,
    gap: 2,
  },
  producerName: {
    fontSize: 16,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
  },
  producerLegal: {
    fontSize: 12,
    color: ios26Colors.textMuted,
  },
  producerCountry: {
    fontSize: 13,
    color: ios26Colors.textMuted,
  },
  verifiedIcon: {
    width: 26,
    height: 26,
  },
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
  batchVal: {
    fontSize: 14,
    fontWeight: "600",
    color: ios26Colors.textPrimary,
  },

  // ── Floating AI button ────────────────────────────────────────────────────
  aiFab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A84FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  aiFabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  aiFabIcon: {
    width: 22,
    height: 22,
  },
});
