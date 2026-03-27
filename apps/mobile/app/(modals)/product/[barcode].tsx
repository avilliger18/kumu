import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductHero from "@/components/product/product-hero";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

const nutriColors: Record<string, { bg: string; fg: string }> = {
  A: { bg: "#1A9E5A", fg: "#fff" },
  B: { bg: "#7AC547", fg: "#fff" },
  C: { bg: "#F9C423", fg: "#000" },
  D: { bg: "#F07A1A", fg: "#fff" },
  E: { bg: "#E63312", fg: "#fff" },
};

const novaColors: Record<number, string> = {
  1: "#1A9E5A",
  2: "#7AC547",
  3: "#F07A1A",
  4: "#E63312",
};

function Row({
  label,
  value,
  unit = "g",
  sub = false,
  bold = false,
}: {
  label: string;
  value?: number;
  unit?: string;
  sub?: boolean;
  bold?: boolean;
}) {
  if (value === undefined) return null;

  return (
    <View style={[rowStyles.row, sub && rowStyles.sub]}>
      <Text
        style={[
          rowStyles.label,
          bold && rowStyles.bold,
          sub && rowStyles.subText,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          rowStyles.value,
          bold && rowStyles.bold,
          sub && rowStyles.subText,
        ]}
      >
        {Number.isInteger(value) ? value : value.toFixed(1)} {unit}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separator,
  },
  sub: {
    paddingLeft: 18,
  },
  label: {
    color: ios26Colors.textSecondary,
    fontSize: 15,
  },
  value: {
    color: ios26Colors.textSecondary,
    fontSize: 15,
  },
  bold: {
    color: ios26Colors.textPrimary,
    fontWeight: "600",
  },
  subText: {
    color: ios26Colors.textMuted,
    fontSize: 14,
  },
});

function ScoreBadge({
  label,
  letter,
  bg,
  fg = "#fff",
  desc,
}: {
  label: string;
  letter: string;
  bg: string;
  fg?: string;
  desc?: string;
}) {
  return (
    <View style={[badgeStyles.pill, { backgroundColor: bg }]}>
      <Text style={[badgeStyles.letter, { color: fg }]}>{letter}</Text>
      <Text
        style={[
          badgeStyles.label,
          {
            color: fg === "#fff" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)",
          },
        ]}
      >
        {label}
      </Text>
      {desc ? (
        <Text
          style={[
            badgeStyles.desc,
            {
              color:
                fg === "#fff" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)",
            },
          ]}
        >
          {desc}
        </Text>
      ) : null}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  pill: {
    minWidth: 86,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  letter: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  desc: {
    fontSize: 10,
    marginTop: 1,
  },
});

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

export default function ProductSheet() {
  const { barcode, source } = useLocalSearchParams<{
    barcode: string;
    source?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordScan = useMutation(api.products.recordScan);
  const recorded = useRef<string | null>(null);

  const result = useQuery(
    api.products.resolveProductByScan,
    barcode ? { barcode } : "skip",
  );

  const resolution = result as any;

  useEffect(() => {
    if (
      !barcode ||
      !resolution ||
      source !== "scan" ||
      recorded.current === barcode
    ) {
      return;
    }

    const payload =
      resolution.resolutionStatus === "not_found"
        ? {
            sessionId: "mobile",
            barcodeRaw: barcode,
            resolutionStatus: "not_found" as const,
            clientPlatform: Platform.OS,
          }
        : {
            sessionId: "mobile",
            barcodeRaw: barcode,
            batchCodeRaw: resolution.batch?.batchCodeRaw,
            resolutionStatus: resolution.batch
              ? ("found" as const)
              : ("found_no_batch" as const),
            productTitle: resolution.product?.title,
            productSubtitle: resolution.product?.subtitle,
            productImageUrl: resolution.product?.thumbnailUrl,
            producerDisplayName: resolution.producer?.displayName,
            clientPlatform: Platform.OS,
          };

    recordScan(payload).catch(() => {});
    recorded.current = barcode;
  }, [barcode, recordScan, resolution, source]);

  if (result === undefined) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={ios26Colors.textPrimary} />
      </View>
    );
  }

  if (resolution.resolutionStatus === "not_found") {
    return (
      <View style={[styles.root, styles.center]}>
        <SymbolView
          name="barcode"
          style={styles.notFoundIcon}
          tintColor={ios26Colors.textMuted}
          type="hierarchical"
        />
        <Text style={styles.notFoundTitle}>Product not found</Text>
        <Text style={styles.notFoundSubtitle}>{barcode}</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.notFoundButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.notFoundButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { product, producer, batch } = resolution;
  const nutrition = product.nutrition?.per100 ?? {};
  const qualityScores = product.qualityScores;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 26,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <ProductHero
          title={product.title}
          subtitle={product.subtitle}
          imageUrl={product.thumbnailUrl}
          batchCode={batch?.batchCodeRaw ?? barcode}
          score={product.qualityScores?.overallFoodScore}
          verified={producer.verificationStatus === "verified"}
        />

        {qualityScores ? (
          <View style={styles.section}>
            <SectionLabel title="Quality scores" />
            <View style={styles.scoreRow}>
              {qualityScores.nutriScore ? (
                <ScoreBadge
                  letter={qualityScores.nutriScore}
                  label="Nutri-Score"
                  bg={nutriColors[qualityScores.nutriScore].bg}
                  fg={nutriColors[qualityScores.nutriScore].fg}
                />
              ) : null}

              {qualityScores.novaGroup ? (
                <ScoreBadge
                  letter={String(qualityScores.novaGroup)}
                  label="NOVA group"
                  desc={qualityScores.processingLevel}
                  bg={novaColors[qualityScores.novaGroup]}
                />
              ) : null}

              {qualityScores.overallFoodScore !== undefined ? (
                <ScoreBadge
                  letter={String(qualityScores.overallFoodScore)}
                  label="Food score"
                  bg={ios26Colors.surfaceElevated}
                />
              ) : null}
            </View>

            {qualityScores.additiveRiskScore !== undefined &&
            qualityScores.additiveRiskScore > 0 ? (
              <View style={styles.riskRow}>
                <SymbolView
                  name="exclamationmark.triangle"
                  style={styles.riskIcon}
                  tintColor={ios26Colors.warning}
                  type="hierarchical"
                />
                <Text style={styles.riskText}>
                  {qualityScores.additiveRiskScore} additive
                  {qualityScores.additiveRiskScore > 1 ? "s" : ""} with risk
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {batch?.recallStatus === "active" ? (
          <View style={styles.recallBanner}>
            <SymbolView
              name="exclamationmark.octagon.fill"
              style={styles.recallIcon}
              tintColor={ios26Colors.danger}
              type="hierarchical"
            />
            <View style={styles.recallCopy}>
              <Text style={styles.recallTitle}>Active Recall</Text>
              <Text style={styles.recallSubtitle}>
                {batch.recallReason ?? "See manufacturer notice"}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionLabel
            title={`Nutrition - per ${product.nutrition?.referenceBasis ?? "100g"}`}
          />
          <View style={styles.card}>
            <Row label="Energy" value={nutrition.energyKcal} unit="kcal" bold />
            <Row label="Fat" value={nutrition.fat} bold />
            <Row label="Saturates" value={nutrition.saturatedFat} sub />
            <Row label="Trans fat" value={nutrition.transFat} sub />
            <Row label="Carbohydrates" value={nutrition.carbs} bold />
            <Row label="Sugars" value={nutrition.sugars} sub />
            <Row label="Added sugars" value={nutrition.addedSugars} sub />
            <Row label="Fibre" value={nutrition.fiber} />
            <Row label="Protein" value={nutrition.protein} bold />
            <Row label="Salt" value={nutrition.salt} />
            <Row label="Caffeine" value={nutrition.caffeine} unit="mg" />
            <Row label="Calcium" value={nutrition.calcium} unit="mg" />
            <Row label="Iron" value={nutrition.iron} unit="mg" />
            <Row label="Magnesium" value={nutrition.magnesium} unit="mg" />
            <Row label="Potassium" value={nutrition.potassium} unit="mg" />
            <Row label="Vitamin C" value={nutrition.vitaminC} unit="mg" />
            <Row label="Vitamin D" value={nutrition.vitaminD} unit="mcg" />
            {(nutrition.additionalNutrients ?? []).map((item: any) => (
              <Row
                key={item.name}
                label={item.name}
                value={item.value}
                unit={item.unit}
              />
            ))}
          </View>
        </View>

        {product.ingredientsText ? (
          <View style={styles.section}>
            <SectionLabel title="Ingredients" />
            <View style={styles.card}>
              <Text style={styles.ingredientsText}>
                {product.ingredientsText}
              </Text>
            </View>
          </View>
        ) : null}

        {product.allergens ? (
          <View style={styles.section}>
            <SectionLabel title="Allergens" />
            <View style={styles.card}>
              {product.allergens.contains.length > 0 ? (
                <View style={styles.allergenRow}>
                  <View
                    style={[
                      styles.allergenDot,
                      { backgroundColor: ios26Colors.warning },
                    ]}
                  />
                  <Text style={[styles.allergenText, styles.allergenContains]}>
                    Contains: {product.allergens.contains.join(", ")}
                  </Text>
                </View>
              ) : null}

              {product.allergens.mayContain.length > 0 ? (
                <View style={styles.allergenRow}>
                  <View
                    style={[
                      styles.allergenDot,
                      { backgroundColor: ios26Colors.textMuted },
                    ]}
                  />
                  <Text style={styles.allergenText}>
                    May contain: {product.allergens.mayContain.join(", ")}
                  </Text>
                </View>
              ) : null}

              {product.allergens.freeFrom.length > 0 ? (
                <View style={styles.allergenRow}>
                  <View
                    style={[
                      styles.allergenDot,
                      { backgroundColor: ios26Colors.success },
                    ]}
                  />
                  <Text style={[styles.allergenText, styles.allergenFree]}>
                    Free from: {product.allergens.freeFrom.join(", ")}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {product.additives && product.additives.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel title="Additives" />
            <View style={styles.card}>
              {product.additives.map((additive: any) => (
                <View key={additive.code} style={styles.additiveRow}>
                  <Text style={styles.additiveCode}>{additive.code}</Text>
                  <Text style={styles.additiveName}>
                    {additive.name ?? additive.code}
                  </Text>
                  <View
                    style={[
                      styles.riskBadge,
                      additive.riskLevel === "low"
                        ? styles.riskLow
                        : additive.riskLevel === "moderate"
                          ? styles.riskModerate
                          : styles.riskHigh,
                    ]}
                  >
                    <Text style={styles.riskBadgeText}>
                      {additive.riskLevel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {batch ? (
          <View style={styles.section}>
            <SectionLabel title="Batch traceability" />
            <View style={styles.batchGrid}>
              <View style={styles.batchCell}>
                <Text style={styles.batchKey}>Lot code</Text>
                <Text style={styles.batchValue}>{batch.batchCodeRaw}</Text>
              </View>

              {batch.originCountry ? (
                <View style={styles.batchCell}>
                  <Text style={styles.batchKey}>Origin</Text>
                  <Text style={styles.batchValue}>{batch.originCountry}</Text>
                </View>
              ) : null}

              {batch.manufacturedAt ? (
                <View style={styles.batchCell}>
                  <Text style={styles.batchKey}>Manufactured</Text>
                  <Text style={styles.batchValue}>
                    {new Date(batch.manufacturedAt).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}

              {batch.bestBeforeAt ? (
                <View style={styles.batchCell}>
                  <Text style={styles.batchKey}>Best before</Text>
                  <Text style={styles.batchValue}>
                    {new Date(batch.bestBeforeAt).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}

              {batch.facilityCode ? (
                <View style={styles.batchCell}>
                  <Text style={styles.batchKey}>Facility</Text>
                  <Text style={styles.batchValue}>{batch.facilityCode}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionLabel title="Producer" />
          <View style={[styles.card, styles.producerCard]}>
            <View style={styles.producerCopy}>
              <Text style={styles.producerName}>{producer.displayName}</Text>
              <Text style={styles.producerLegal}>{producer.name}</Text>
              {producer.countryCode ? (
                <Text style={styles.producerCountry}>
                  {producer.countryCode}
                </Text>
              ) : null}
            </View>
            {producer.verificationStatus === "verified" ? (
              <View style={styles.verifiedBadge}>
                <SymbolView
                  name="checkmark.seal.fill"
                  style={styles.verifiedIcon}
                  tintColor={ios26Colors.success}
                  type="hierarchical"
                />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ios26Colors.sheet,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pressed: {
    opacity: 0.72,
  },
  notFoundIcon: {
    width: 52,
    height: 52,
  },
  notFoundTitle: {
    color: ios26Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  notFoundSubtitle: {
    color: ios26Colors.textSecondary,
    fontSize: 13,
  },
  notFoundButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: ios26Radii.pill,
    backgroundColor: ios26Colors.surfaceElevated,
  },
  notFoundButtonText: {
    color: ios26Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionLabel: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    overflow: "hidden",
    borderRadius: ios26Radii.card,
    paddingHorizontal: 14,
    backgroundColor: ios26Colors.surface,
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  riskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  riskIcon: {
    width: 16,
    height: 16,
  },
  riskText: {
    color: ios26Colors.warning,
    fontSize: 13,
    fontWeight: "500",
  },
  recallBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: ios26Radii.card,
    borderWidth: 1,
    borderColor: "rgba(255,95,87,0.36)",
    backgroundColor: "rgba(255,95,87,0.12)",
  },
  recallIcon: {
    width: 28,
    height: 28,
  },
  recallCopy: {
    flex: 1,
  },
  recallTitle: {
    color: ios26Colors.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  recallSubtitle: {
    color: ios26Colors.danger,
    opacity: 0.78,
    fontSize: 13,
    marginTop: 2,
  },
  ingredientsText: {
    color: ios26Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    paddingVertical: 12,
  },
  allergenRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
  },
  allergenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 5,
  },
  allergenText: {
    flex: 1,
    color: ios26Colors.textSecondary,
    fontSize: 14,
  },
  allergenContains: {
    color: ios26Colors.warning,
    fontWeight: "600",
  },
  allergenFree: {
    color: ios26Colors.success,
  },
  additiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ios26Colors.separatorStrong,
  },
  additiveCode: {
    width: 40,
    color: ios26Colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  additiveName: {
    flex: 1,
    color: ios26Colors.textSecondary,
    fontSize: 14,
  },
  riskBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  riskLow: {
    backgroundColor: "rgba(48,209,88,0.15)",
  },
  riskModerate: {
    backgroundColor: "rgba(255,159,10,0.15)",
  },
  riskHigh: {
    backgroundColor: "rgba(255,95,87,0.15)",
  },
  riskBadgeText: {
    color: ios26Colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  batchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  batchCell: {
    minWidth: "45%",
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: ios26Colors.surface,
  },
  batchKey: {
    color: ios26Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  batchValue: {
    color: ios26Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  producerCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  producerCopy: {
    flex: 1,
  },
  producerName: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  producerLegal: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    marginBottom: 3,
  },
  producerCountry: {
    color: ios26Colors.textSecondary,
    fontSize: 13,
  },
  verifiedBadge: {
    padding: 4,
  },
  verifiedIcon: {
    width: 26,
    height: 26,
  },
});
