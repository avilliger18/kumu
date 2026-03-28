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

import {
  createNativeCloseButtonOptions,
  ios26ScrollEdgeEffects,
} from "@/constants/ios26-navigation";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

const herbImage = require("@/assets/images/herb.png") as number;
const appleImage = require("@/assets/images/apple.png") as number;
const footstepImage = require("@/assets/images/footstep.png") as number;
const globeImage = require("@/assets/images/globe.png") as number;

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CO2_FACTOR: Record<string, number> = {
  ship: 0.01,
  plane: 0.602,
  truck: 0.062,
  train: 0.022,
};

function calcFootprint(
  steps: { lat: number; lng: number; transportMode?: string }[],
) {
  let totalKm = 0;
  let co2 = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    const km = haversineKm(
      steps[i].lat,
      steps[i].lng,
      steps[i + 1].lat,
      steps[i + 1].lng,
    );
    totalKm += km;
    co2 +=
      km * (CO2_FACTOR[steps[i].transportMode ?? "truck"] ?? CO2_FACTOR.truck);
  }
  return { totalKm: Math.round(totalKm), co2PerTon: Math.round(co2 * 10) / 10 };
}

export default function ProductSheet() {
  const params = useLocalSearchParams<{ barcode: string; source?: string }>();
  const barcode = params.barcode
    ? decodeURIComponent(String(params.barcode))
    : "";
  const source = params.source;
  const insets = useSafeAreaInsets();
  const recordScan = useMutation(api.products.recordScan);
  const createChatSession = useMutation(api.chats.createSession);
  const recorded = useRef<string | null>(null);

  const result = useQuery(
    api.products.resolveProductByScan,
    barcode.length > 0 ? { barcode } : "skip",
  ) as any;

  const isResolvedProduct = result && result.resolutionStatus !== "not_found";
  const productTitle = isResolvedProduct
    ? (result.product?.title ?? "Product")
    : "Product";

  useEffect(() => {
    if (
      !barcode ||
      !result ||
      source !== "scan" ||
      recorded.current === barcode
    ) {
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
              style={({ pressed }) => [pressed && s.headerActionPressed]}
            >
              <Text
                style={[
                  s.headerAction,
                  tintColor ? { color: tintColor } : null,
                ]}
              >
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
            style={({ pressed }) => [s.nfBtn, pressed && { opacity: 0.72 }]}
          >
            <Text style={s.nfBtnText}>Go back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const { product, producer } = result;
  const nutrition = product.nutrition?.per100 ?? {};
  const qs = product.qualityScores ?? {};

  const footprint = calcFootprint(result.supplyChainSteps ?? []);

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <View style={s.wrapper}>
        <ScrollView
          style={s.root}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        >
          <View style={s.heroCard}>
            {/* Left: product image */}
            <View style={s.heroLeft}>
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
            </View>

            {/* Right: info */}
            <View style={s.heroRight}>
              {/* <Text style={s.heroTitle} numberOfLines={2}>
                {product.title}
              </Text> */}
              <Text style={s.heroBrand}>
                {producer?.displayName ?? "Unknown"}
              </Text>
              <Text style={s.heroBarcode}>Barcode: {barcode}</Text>

              {/* Kumu Score */}
              {qs.overallFoodScore !== undefined ? (
                <View style={s.kumuSection}>
                  <View style={s.kumuHeader}>
                    <Text style={s.kumuLabel}>Kumu Score</Text>
                    <View style={s.kumuInfoBtn}>
                      <Text style={s.kumuInfoText}>?</Text>
                    </View>
                  </View>
                  <View style={s.kumuBar}>
                    <View
                      style={[
                        s.kumuBarFill,
                        { width: `${qs.overallFoodScore}%` as any },
                      ]}
                    />
                    <View
                      style={[
                        s.kumuBarThumb,
                        {
                          left: `${qs.overallFoodScore}%` as any,
                          marginLeft: -14,
                        },
                      ]}
                    />
                    <Text style={s.kumuBarScore}>
                      {qs.overallFoodScore}/100
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Labels */}
              <View style={s.labelsSection}>
                <Text style={s.labelsTitle}>Labels</Text>
                <View style={s.labelsRow}>
                  {(product.labels ?? []).length > 0
                    ? (product.labels as string[]).map((label) => (
                        <View key={label} style={s.labelBadge}>
                          <Text style={s.labelBadgeText}>{label}</Text>
                        </View>
                      ))
                    : null}
                  <Pressable
                    style={({ pressed }) => [
                      s.certBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={s.certBtnText}>View certificates</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {product.ingredientsText ? (
            <View style={s.section}>
              <Card style={s.ingredientsCard}>
                <Text style={s.ingredientsTitle}>Ingredients</Text>
                <View style={s.ingredientsList}>
                  {product.ingredientsText
                    .split(",")
                    .map((item: string) => item.trim())
                    .filter(Boolean)
                    .map((ingredient: string, i: number) => (
                      <View key={i} style={s.ingredientRow}>
                        <Text style={s.ingredientBullet}>{"•"}</Text>
                        <Text style={s.ingredientText}>{ingredient}</Text>
                      </View>
                    ))}
                </View>
                <Image
                  source={herbImage}
                  style={s.herbImage}
                  contentFit="contain"
                  pointerEvents="none"
                />
              </Card>
            </View>
          ) : null}

          <View style={s.section}>
            <Card style={s.nutritionCard}>
              <Text style={s.nutritionTitle}>
                Nutritional values (per{" "}
                {product.nutrition?.referenceBasis ?? "100g"})
              </Text>
              <View style={s.nutritionList}>
                {nutrition.energyKcal !== undefined &&
                nutrition.energyKcal !== null ? (
                  <View style={s.ingredientRow}>
                    <Text style={s.ingredientBullet}>{"•"}</Text>
                    <Text style={s.ingredientText}>
                      Energy:{" "}
                      {Number.isInteger(nutrition.energyKcal)
                        ? nutrition.energyKcal
                        : nutrition.energyKcal.toFixed(1)}{" "}
                      kcal
                    </Text>
                  </View>
                ) : null}
                {nutrition.sugars !== undefined && nutrition.sugars !== null ? (
                  <View style={s.ingredientRow}>
                    <Text style={s.ingredientBullet}>{"•"}</Text>
                    <Text style={s.ingredientText}>
                      Sugar:{" "}
                      {Number.isInteger(nutrition.sugars)
                        ? nutrition.sugars
                        : nutrition.sugars.toFixed(1)}{" "}
                      g
                    </Text>
                  </View>
                ) : null}
                {nutrition.fat !== undefined && nutrition.fat !== null ? (
                  <View style={s.ingredientRow}>
                    <Text style={s.ingredientBullet}>{"•"}</Text>
                    <Text style={s.ingredientText}>
                      Fat:{" "}
                      {Number.isInteger(nutrition.fat)
                        ? nutrition.fat
                        : nutrition.fat.toFixed(1)}{" "}
                      g
                    </Text>
                  </View>
                ) : null}
                {nutrition.carbs !== undefined && nutrition.carbs !== null ? (
                  <View style={s.ingredientRow}>
                    <Text style={s.ingredientBullet}>{"•"}</Text>
                    <Text style={s.ingredientText}>
                      Carbohydrates:{" "}
                      {Number.isInteger(nutrition.carbs)
                        ? nutrition.carbs
                        : nutrition.carbs.toFixed(1)}{" "}
                      g
                    </Text>
                  </View>
                ) : null}
                {nutrition.protein !== undefined &&
                nutrition.protein !== null ? (
                  <View style={s.ingredientRow}>
                    <Text style={s.ingredientBullet}>{"•"}</Text>
                    <Text style={s.ingredientText}>
                      Protein:{" "}
                      {Number.isInteger(nutrition.protein)
                        ? nutrition.protein
                        : nutrition.protein.toFixed(1)}{" "}
                      g
                    </Text>
                  </View>
                ) : null}
                {nutrition.salt !== undefined && nutrition.salt !== null ? (
                  <View style={s.ingredientRow}>
                    <Text style={s.ingredientBullet}>{"•"}</Text>
                    <Text style={s.ingredientText}>
                      Salt:{" "}
                      {Number.isInteger(nutrition.salt)
                        ? nutrition.salt
                        : nutrition.salt.toFixed(3)}{" "}
                      g
                    </Text>
                  </View>
                ) : null}
              </View>
              <Image
                source={appleImage}
                style={s.appleImage}
                contentFit="contain"
                pointerEvents="none"
              />
            </Card>
          </View>

          <View style={s.section}>
            <Card style={s.supplyChainCard}>
              <Text style={s.supplyChainTitle}>Supply Chain</Text>
              <View style={s.supplyChainList}>
                {(result.supplyChainSteps ?? []).map(
                  (step: any, i: number, arr: any[]) => (
                    <View key={i} style={s.supplyChainItem}>
                      <View style={s.supplyChainLeft}>
                        <View style={s.supplyChainDot} />
                        {i < arr.length - 1 ? (
                          <View style={s.supplyChainLine} />
                        ) : null}
                      </View>
                      <Text style={s.supplyChainLabel}>{step.label}</Text>
                    </View>
                  ),
                )}
              </View>
              <Image
                source={globeImage}
                style={s.globeImage}
                contentFit="contain"
                pointerEvents="none"
              />
            </Card>
          </View>

          <View style={s.section}>
            <Card style={s.footprintCard}>
              <Text style={s.footprintTitle}>Ecological footprint</Text>
              <View style={s.footprintRow}>
                <Text style={s.footprintLabel}>Distance traveled</Text>
                {footprint.totalKm > 0 ? (
                  <Text style={s.footprintValue}>
                    {footprint.totalKm.toLocaleString()}{" "}
                    <Text style={s.footprintUnit}>km</Text>
                  </Text>
                ) : (
                  <Text style={s.footprintMuted}>No data</Text>
                )}
              </View>
              {footprint.co2PerTon > 0 ? (
                <View style={s.footprintRow}>
                  <Text style={s.footprintLabel}>CO₂ per ton of product</Text>
                  <Text style={s.footprintValue}>
                    {footprint.co2PerTon.toLocaleString()}{" "}
                    <Text style={s.footprintUnit}>kg</Text>
                  </Text>
                </View>
              ) : null}
              <Image
                source={footstepImage}
                style={s.footstepImage}
                contentFit="contain"
                pointerEvents="none"
              />
            </Card>
          </View>
        </ScrollView>

        {/* Floating AI button — bottom right */}
        <Pressable
          onPress={async () => {
            const id = await createChatSession({
              title: product.title ?? barcode,
              productBarcode: barcode,
            });
            router.push(`/chat?id=${id}`);
          }}
          style={({ pressed }) => [s.aiFab, pressed && s.aiFabPressed]}
        >
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
    flexDirection: "row",
    backgroundColor: ios26Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    gap: 14,
    alignItems: "flex-start",
  },
  heroLeft: {
    width: 120,
    height: 150,
    borderRadius: ios26Radii.card,
    backgroundColor: ios26Colors.surfaceElevated,
    overflow: "hidden",
    flexShrink: 0,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholderIcon: {
    width: 48,
    height: 48,
    alignSelf: "center",
    marginTop: 48,
  },
  nutriBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nutriBadgeLetter: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
  nutriBadgeLabel: {
    fontSize: 7,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.2,
    lineHeight: 9,
  },
  heroRight: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  heroBrand: {
    fontSize: 13,
    color: "#1B3A5B",
    marginTop: 1,
    fontWeight: "700",
  },
  heroBarcode: {
    fontSize: 12,
    color: ios26Colors.textMuted,
    fontVariant: ["tabular-nums"],
    marginTop: 1,
  },
  kumuSection: {
    marginTop: 10,
    gap: 6,
  },
  kumuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  kumuLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: ios26Colors.textPrimary,
  },
  kumuInfoBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF459F",
    alignItems: "center",
    justifyContent: "center",
  },
  kumuInfoText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FF459F",
    lineHeight: 11,
  },
  kumuBar: {
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFD6EA",
    overflow: "visible",
    justifyContent: "center",
    position: "relative",
  },
  kumuBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FF459F",
    borderRadius: 14,
  },
  kumuBarThumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    top: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  kumuBarScore: {
    position: "absolute",
    right: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  labelsSection: {
    marginTop: 10,
    gap: 5,
  },
  labelsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: ios26Colors.textPrimary,
  },
  labelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: ios26Colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.separator,
  },
  labelBadgeText: {
    fontSize: 11,
    color: ios26Colors.textMuted,
    fontWeight: "500",
  },
  certBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: ios26Colors.separator,
  },
  certBtnText: {
    fontSize: 11,
    color: ios26Colors.textPrimary,
    fontWeight: "500",
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
  ingredientsCard: {
    overflow: "hidden",
    backgroundColor: "white",
    borderColor: "#cfe1f1",
    borderWidth: 1,
  },
  nutritionCard: {
    overflow: "hidden",
    backgroundColor: "white",
    borderColor: "#cfe1f1",
    borderWidth: 1,
  },
  nutritionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
    paddingRight: 80,
  },
  nutritionList: {
    gap: 4,
    paddingRight: 80,
  },
  appleImage: {
    position: "absolute",
    bottom: -15,
    right: -15,
    width: 130,
    height: 130,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.9,
    pointerEvents: "none",
  },
  ingredientsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  ingredientsList: {
    gap: 4,
    paddingRight: 80,
  },
  ingredientRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  ingredientBullet: {
    fontSize: 14,
    color: ios26Colors.textMuted,
    lineHeight: 22,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: ios26Colors.textMuted,
    lineHeight: 22,
  },
  herbImage: {
    position: "absolute",
    bottom: -20,
    right: -10,
    width: 120,
    height: 120,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.9,
    pointerEvents: "none",
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
  supplyChainCard: {
    overflow: "hidden",
    backgroundColor: "white",
    borderColor: "#cfe1f1",
    borderWidth: 1,
  },
  supplyChainTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  supplyChainList: {
    gap: 0,
    paddingRight: 100,
  },
  supplyChainItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  supplyChainLeft: {
    alignItems: "center",
    width: 16,
  },
  supplyChainDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#C8DCF0",
    marginTop: 4,
    flexShrink: 0,
  },
  supplyChainLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
    borderLeftWidth: 2,
    borderLeftColor: "#C8DCF0",
    borderStyle: "dashed",
    marginTop: 2,
    marginBottom: 2,
  },
  supplyChainLabel: {
    fontSize: 15,
    color: ios26Colors.textPrimary,
    paddingBottom: 16,
    lineHeight: 22,
  },
  globeImage: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 150,
    height: 150,
    opacity: 0.9,
    pointerEvents: "none",
  },
  footprintCard: {
    overflow: "hidden",
    backgroundColor: "white",
    borderColor: "#cfe1f1",
    borderWidth: 1,
    gap: 10,
  },
  footprintTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  footprintRow: {
    gap: 2,
    paddingRight: 100,
  },
  footprintLabel: {
    fontSize: 13,
    color: ios26Colors.textMuted,
  },
  footprintValue: {
    fontSize: 36,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 42,
  },
  footprintUnit: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0,
  },
  footprintMuted: {
    fontSize: 15,
    color: ios26Colors.textMuted,
  },
  footstepImage: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 130,
    height: 130,
    opacity: 0.9,
    pointerEvents: "none",
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
