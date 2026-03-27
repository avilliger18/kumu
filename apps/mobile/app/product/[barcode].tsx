import { api } from "@kumu/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NUTRI: Record<string, { bg: string; fg: string }> = {
  A: { bg: "#1A9E5A", fg: "#fff" },
  B: { bg: "#7AC547", fg: "#fff" },
  C: { bg: "#F9C423", fg: "#000" },
  D: { bg: "#F07A1A", fg: "#fff" },
  E: { bg: "#E63312", fg: "#fff" },
};

const NOVA: Record<number, string> = {
  1: "#1A9E5A",
  2: "#7AC547",
  3: "#F07A1A",
  4: "#E63312",
};

function Row({ label, value, unit = "g", sub = false, bold = false }: {
  label: string; value?: number; unit?: string; sub?: boolean; bold?: boolean;
}) {
  if (value === undefined) return null;
  return (
    <View style={[r.row, sub && r.sub]}>
      <Text style={[r.label, bold && r.bold, sub && r.subText]}>{label}</Text>
      <Text style={[r.val, bold && r.bold, sub && r.subText]}>
        {Number.isInteger(value) ? value : value.toFixed(1)} {unit}
      </Text>
    </View>
  );
}

const r = StyleSheet.create({
  row:     { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E" },
  sub:     { paddingLeft: 18 },
  label:   { color: "#8E8E93", fontSize: 15 },
  val:     { color: "#8E8E93", fontSize: 15 },
  bold:    { color: "#FFFFFF", fontWeight: "600" },
  subText: { color: "#636366", fontSize: 14 },
});

function ScoreBadge({ label, letter, bg, fg = "#fff", desc }: { label: string; letter: string; bg: string; fg?: string; desc?: string }) {
  return (
    <View style={[b.pill, { backgroundColor: bg }]}>
      <Text style={[b.letter, { color: fg }]}>{letter}</Text>
      <Text style={[b.label, { color: fg === "#fff" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }]}>{label}</Text>
      {desc && <Text style={[b.desc, { color: fg === "#fff" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)" }]}>{desc}</Text>}
    </View>
  );
}

const b = StyleSheet.create({
  pill:   { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", minWidth: 80 },
  letter: { fontSize: 30, fontWeight: "800", lineHeight: 34 },
  label:  { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 2 },
  desc:   { fontSize: 10, marginTop: 1 },
});

function SectionLabel({ title }: { title: string }) {
  return <Text style={p.sectionLabel}>{title}</Text>;
}

export default function ProductModal() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const result = useQuery(
    api.products.resolveProductByScan,
    barcode ? { barcode } : "skip",
  );

  if (result === undefined) {
    return (
      <View style={[p.root, p.center]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (result.resolutionStatus === "not_found") {
    return (
      <View style={[p.root, p.center]}>
        <SymbolView name="barcode" style={p.nfIcon} tintColor="#636366" type="hierarchical" />
        <Text style={p.nfTitle}>Product not found</Text>
        <Text style={p.nfSub}>{barcode}</Text>
        <Pressable onPress={() => router.back()} style={p.nfBtn}>
          <Text style={p.nfBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const { product, producer, batch } = result as any;
  const n  = product.nutrition?.per100 ?? {};
  const qs = product.qualityScores;

  return (
    <View style={p.root}>
      <View style={p.handle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={p.hero}>
          {product.thumbnailUrl ? (
            <Image source={{ uri: product.thumbnailUrl }} style={p.image} />
          ) : (
            <View style={[p.image, p.imageFallback]}>
              <Text style={{ fontSize: 48 }}>📦</Text>
            </View>
          )}

          <Text style={p.brand}>{product.brandLabel ?? producer.displayName}</Text>
          <Text style={p.title}>{product.title}</Text>
          {product.subtitle && <Text style={p.subtitle}>{product.subtitle}</Text>}

          <View style={p.metaRow}>
            {product.netContent && (
              <View style={p.metaChip}>
                <Text style={p.metaChipText}>{product.netContent.value}{product.netContent.unit}</Text>
              </View>
            )}
            {product.originCountries?.[0] && (
              <View style={p.metaChip}>
                <Text style={p.metaChipText}>Made in {product.originCountries[0]}</Text>
              </View>
            )}
            {product.category && (
              <View style={p.metaChip}>
                <Text style={p.metaChipText}>{product.category}</Text>
              </View>
            )}
          </View>
        </View>

        {qs && (
          <View style={p.section}>
            <SectionLabel title="Quality scores" />
            <View style={p.scoreRow}>
              {qs.nutriScore && (
                <ScoreBadge
                  letter={qs.nutriScore}
                  label="Nutri-Score"
                  bg={NUTRI[qs.nutriScore].bg}
                  fg={NUTRI[qs.nutriScore].fg}
                />
              )}
              {qs.novaGroup && (
                <ScoreBadge
                  letter={String(qs.novaGroup)}
                  label="NOVA group"
                  desc={qs.processingLevel}
                  bg={NOVA[qs.novaGroup]}
                />
              )}
              {qs.overallFoodScore !== undefined && (
                <ScoreBadge
                  letter={String(qs.overallFoodScore)}
                  label="Food score"
                  bg="#2C2C2E"
                />
              )}
            </View>

            {qs.additiveRiskScore !== undefined && qs.additiveRiskScore > 0 && (
              <View style={p.riskRow}>
                <SymbolView name="exclamationmark.triangle" style={p.riskIcon} tintColor="#FF9500" type="hierarchical" />
                <Text style={p.riskText}>{qs.additiveRiskScore} additive{qs.additiveRiskScore > 1 ? "s" : ""} with risk</Text>
              </View>
            )}
          </View>
        )}

        {batch?.recallStatus === "active" && (
          <View style={p.recallBanner}>
            <SymbolView name="exclamationmark.octagon.fill" style={p.recallIcon} tintColor="#FF453A" type="hierarchical" />
            <View>
              <Text style={p.recallTitle}>Active Recall</Text>
              <Text style={p.recallSub}>{batch.recallReason ?? "See manufacturer notice"}</Text>
            </View>
          </View>
        )}

        <View style={p.section}>
          <SectionLabel title={`Nutrition · per ${product.nutrition?.referenceBasis ?? "100g"}`} />
          <View style={p.card}>
            <Row label="Energy"         value={n.energyKcal}   unit="kcal" bold />
            <Row label="Fat"            value={n.fat}                       bold />
            <Row label="Saturates"      value={n.saturatedFat}              sub />
            <Row label="Trans fat"      value={n.transFat}                  sub />
            <Row label="Carbohydrates"  value={n.carbs}                     bold />
            <Row label="Sugars"         value={n.sugars}                    sub />
            <Row label="Added sugars"   value={n.addedSugars}               sub />
            <Row label="Fibre"          value={n.fiber} />
            <Row label="Protein"        value={n.protein}                   bold />
            <Row label="Salt"           value={n.salt} />
            <Row label="Caffeine"       value={n.caffeine}     unit="mg" />
            <Row label="Calcium"        value={n.calcium}      unit="mg" />
            <Row label="Iron"           value={n.iron}         unit="mg" />
            <Row label="Magnesium"      value={n.magnesium}    unit="mg" />
            <Row label="Potassium"      value={n.potassium}    unit="mg" />
            <Row label="Vitamin C"      value={n.vitaminC}     unit="mg" />
            <Row label="Vitamin D"      value={n.vitaminD}     unit="µg" />
            {(n.additionalNutrients ?? []).map((an: any) => (
              <Row key={an.name} label={an.name} value={an.value} unit={an.unit} />
            ))}
          </View>
        </View>

        {product.ingredientsText && (
          <View style={p.section}>
            <SectionLabel title="Ingredients" />
            <View style={p.card}>
              <Text style={p.ingredientsText}>{product.ingredientsText}</Text>
            </View>
          </View>
        )}

        {product.allergens && (
          <View style={p.section}>
            <SectionLabel title="Allergens" />
            <View style={p.card}>
              {product.allergens.contains.length > 0 && (
                <View style={p.allergenRow}>
                  <View style={[p.allergenDot, { backgroundColor: "#FF9500" }]} />
                  <Text style={[p.allergenText, { color: "#FF9500", fontWeight: "600" }]}>
                    Contains: {product.allergens.contains.join(", ")}
                  </Text>
                </View>
              )}
              {product.allergens.mayContain.length > 0 && (
                <View style={p.allergenRow}>
                  <View style={[p.allergenDot, { backgroundColor: "#636366" }]} />
                  <Text style={p.allergenText}>May contain: {product.allergens.mayContain.join(", ")}</Text>
                </View>
              )}
              {product.allergens.freeFrom.length > 0 && (
                <View style={p.allergenRow}>
                  <View style={[p.allergenDot, { backgroundColor: "#30D158" }]} />
                  <Text style={[p.allergenText, { color: "#30D158" }]}>
                    Free from: {product.allergens.freeFrom.join(", ")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {product.additives && product.additives.length > 0 && (
          <View style={p.section}>
            <SectionLabel title="Additives" />
            <View style={p.card}>
              {product.additives.map((a: any) => (
                <View key={a.code} style={p.additiveRow}>
                  <Text style={p.additiveCode}>{a.code}</Text>
                  <Text style={p.additiveName}>{a.name ?? a.code}</Text>
                  <View style={[p.riskBadge, a.riskLevel === "low" ? p.riskLow : a.riskLevel === "moderate" ? p.riskMod : p.riskHigh]}>
                    <Text style={p.riskBadgeText}>{a.riskLevel}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {batch && (
          <View style={p.section}>
            <SectionLabel title="Batch traceability" />
            <View style={p.batchGrid}>
              <View style={p.batchCell}>
                <Text style={p.batchKey}>Lot code</Text>
                <Text style={p.batchVal}>{batch.batchCodeRaw}</Text>
              </View>
              {batch.originCountry && (
                <View style={p.batchCell}>
                  <Text style={p.batchKey}>Origin</Text>
                  <Text style={p.batchVal}>{batch.originCountry}</Text>
                </View>
              )}
              {batch.manufacturedAt && (
                <View style={p.batchCell}>
                  <Text style={p.batchKey}>Manufactured</Text>
                  <Text style={p.batchVal}>{new Date(batch.manufacturedAt).toLocaleDateString()}</Text>
                </View>
              )}
              {batch.bestBeforeAt && (
                <View style={p.batchCell}>
                  <Text style={p.batchKey}>Best before</Text>
                  <Text style={p.batchVal}>{new Date(batch.bestBeforeAt).toLocaleDateString()}</Text>
                </View>
              )}
              {batch.facilityCode && (
                <View style={p.batchCell}>
                  <Text style={p.batchKey}>Facility</Text>
                  <Text style={p.batchVal}>{batch.facilityCode}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={p.section}>
          <SectionLabel title="Producer" />
          <View style={[p.card, p.producerCard]}>
            <View style={{ flex: 1 }}>
              <Text style={p.producerName}>{producer.displayName}</Text>
              <Text style={p.producerLegal}>{producer.name}</Text>
              {producer.countryCode && (
                <Text style={p.producerCountry}>{producer.countryCode}</Text>
              )}
            </View>
            {producer.verificationStatus === "verified" && (
              <View style={p.verifiedBadge}>
                <SymbolView name="checkmark.seal.fill" style={p.verifiedIcon} tintColor="#30D158" type="hierarchical" />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const p = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#1C1C1E" },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  handle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: "#48484A",
    alignSelf: "center",
    marginTop: 10, marginBottom: 8,
  },

  nfIcon:    { width: 52, height: 52 },
  nfTitle:   { color: "#fff", fontSize: 20, fontWeight: "700" },
  nfSub:     { color: "#636366", fontSize: 13 },
  nfBtn:     { backgroundColor: "#2C2C2E", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, marginTop: 8 },
  nfBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  hero: { alignItems: "center", paddingTop: 16, paddingHorizontal: 24, paddingBottom: 8 },
  image: {
    width: 120, height: 120,
    borderRadius: 22,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  imageFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#2C2C2E" },
  brand:    { color: "#636366", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 },
  title:    { color: "#fff", fontSize: 26, fontWeight: "800", textAlign: "center", letterSpacing: -0.3, lineHeight: 32, marginBottom: 4 },
  subtitle: { color: "#8E8E93", fontSize: 15, textAlign: "center", marginBottom: 10 },
  metaRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 2 },
  metaChip: { backgroundColor: "#2C2C2E", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  metaChipText: { color: "#8E8E93", fontSize: 12, fontWeight: "500" },

  section:      { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: { color: "#636366", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 8 },

  card: { backgroundColor: "#2C2C2E", borderRadius: 16, paddingHorizontal: 14, overflow: "hidden" },

  scoreRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  riskRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  riskIcon: { width: 16, height: 16 },
  riskText: { color: "#FF9500", fontSize: 13, fontWeight: "500" },

  recallBanner: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: "rgba(255,69,58,0.1)",
    borderWidth: 1, borderColor: "rgba(255,69,58,0.4)",
    borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  recallIcon:  { width: 28, height: 28 },
  recallTitle: { color: "#FF453A", fontSize: 15, fontWeight: "700" },
  recallSub:   { color: "#FF453A", fontSize: 13, opacity: 0.75, marginTop: 2 },

  ingredientsText: { color: "#8E8E93", fontSize: 14, lineHeight: 21, paddingVertical: 12 },

  allergenRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  allergenDot:  { width: 7, height: 7, borderRadius: 3.5, marginTop: 5 },
  allergenText: { flex: 1, color: "#8E8E93", fontSize: 14 },

  additiveRow:     { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#3A3A3C" },
  additiveCode:    { color: "#0A84FF", fontSize: 13, fontWeight: "700", width: 40 },
  additiveName:    { flex: 1, color: "#8E8E93", fontSize: 14 },
  riskBadge:       { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  riskLow:         { backgroundColor: "rgba(48,209,88,0.15)" },
  riskMod:         { backgroundColor: "rgba(255,159,10,0.15)" },
  riskHigh:        { backgroundColor: "rgba(255,69,58,0.15)" },
  riskBadgeText:   { color: "#8E8E93", fontSize: 11, fontWeight: "600", textTransform: "capitalize" },

  batchGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  batchCell: { backgroundColor: "#2C2C2E", borderRadius: 14, padding: 14, flex: 1, minWidth: "45%" },
  batchKey:  { color: "#636366", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  batchVal:  { color: "#fff", fontSize: 14, fontWeight: "600" },

  producerCard:   { flexDirection: "row", alignItems: "center", padding: 14 },
  producerName:   { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 2 },
  producerLegal:  { color: "#636366", fontSize: 12, marginBottom: 3 },
  producerCountry:{ color: "#8E8E93", fontSize: 13 },
  verifiedBadge:  { padding: 4 },
  verifiedIcon:   { width: 26, height: 26 },
});
