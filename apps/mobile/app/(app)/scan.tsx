import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.78;

const NUTRI_COLORS: Record<string, string> = {
  A: "#038141",
  B: "#85BB2F",
  C: "#FECB02",
  D: "#EE8100",
  E: "#E63E11",
};

const NOVA_COLORS: Record<number, string> = {
  1: "#038141",
  2: "#85BB2F",
  3: "#EE8100",
  4: "#E63E11",
};

type ScanResult =
  | { resolutionStatus: "not_found"; barcode: string }
  | {
      resolutionStatus: "found" | "found_no_batch";
      product: any;
      producer: any;
      batch: any | null;
    };

function NutritionRow({ label, value, unit, bold }: { label: string; value?: number; unit?: string; bold?: boolean }) {
  if (value === undefined) return null;
  return (
    <View style={[styles.nutriRow, bold && styles.nutriRowBold]}>
      <Text style={[styles.nutriLabel, bold && styles.nutriLabelBold]}>{label}</Text>
      <Text style={[styles.nutriValue, bold && styles.nutriLabelBold]}>
        {value % 1 === 0 ? value : value.toFixed(1)} {unit ?? "g"}
      </Text>
    </View>
  );
}

function ProductSheet({ result, onClose }: { result: ScanResult; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 180,
    }).start();
  }, []);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: SHEET_H,
      duration: 260,
      useNativeDriver: true,
    }).start(onClose);
  };

  if (result.resolutionStatus === "not_found") {
    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }], height: SCREEN_H * 0.35 }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundTitle}>Product not found</Text>
          <Text style={styles.notFoundSub}>Barcode: {result.barcode}</Text>
          <Pressable onPress={dismiss} style={styles.scanAgainBtn}>
            <Text style={styles.scanAgainText}>Scan again</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  const { product, producer, batch } = result;
  const n = product.nutrition?.per100 ?? {};
  const qs = product.qualityScores;

  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }], height: SHEET_H }]}>
      <View style={styles.sheetHandle} />
      <Pressable style={styles.closeBtn} onPress={dismiss}>
        <Text style={styles.closeBtnText}>✕</Text>
      </Pressable>

      <ScrollView
        style={styles.sheetScroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productHeader}>
          {product.thumbnailUrl ? (
            <Image source={{ uri: product.thumbnailUrl }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={styles.thumbnailPlaceholderText}>📦</Text>
            </View>
          )}

          <View style={styles.productMeta}>
            <Text style={styles.brandLabel}>{product.brandLabel ?? producer.displayName}</Text>
            <Text style={styles.productTitle}>{product.title}</Text>
            {product.subtitle && <Text style={styles.productSubtitle}>{product.subtitle}</Text>}
            {product.netContent && (
              <Text style={styles.netContent}>
                {product.netContent.value}{product.netContent.unit}
              </Text>
            )}
          </View>
        </View>

        {qs && (
          <View style={styles.scoresRow}>
            {qs.nutriScore && (
              <View style={[styles.scoreBadge, { backgroundColor: NUTRI_COLORS[qs.nutriScore] }]}>
                <Text style={styles.scoreBadgeSmall}>Nutri</Text>
                <Text style={styles.scoreBadgeLarge}>{qs.nutriScore}</Text>
              </View>
            )}
            {qs.novaGroup && (
              <View style={[styles.scoreBadge, { backgroundColor: NOVA_COLORS[qs.novaGroup] }]}>
                <Text style={styles.scoreBadgeSmall}>NOVA</Text>
                <Text style={styles.scoreBadgeLarge}>{qs.novaGroup}</Text>
              </View>
            )}
            {qs.overallFoodScore !== undefined && (
              <View style={[styles.scoreBadge, { backgroundColor: "#2C2C2E" }]}>
                <Text style={styles.scoreBadgeSmall}>Score</Text>
                <Text style={styles.scoreBadgeLarge}>{qs.overallFoodScore}</Text>
              </View>
            )}
          </View>
        )}

        {batch?.recallStatus === "active" && (
          <View style={styles.recallBanner}>
            <Text style={styles.recallText}>⚠️ ACTIVE RECALL — {batch.recallReason ?? "See manufacturer notice"}</Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>NUTRITION PER {product.nutrition.referenceBasis.toUpperCase()}</Text>
          <NutritionRow label="Energy"       value={n.energyKcal} unit="kcal" bold />
          <View style={styles.nutriDivider} />
          <NutritionRow label="Fat"          value={n.fat}          bold />
          <NutritionRow label="  of which saturates" value={n.saturatedFat} />
          <NutritionRow label="  trans fat"  value={n.transFat} />
          <View style={styles.nutriDivider} />
          <NutritionRow label="Carbohydrates" value={n.carbs}   bold />
          <NutritionRow label="  of which sugars" value={n.sugars} />
          <NutritionRow label="  added sugars"    value={n.addedSugars} />
          <NutritionRow label="Fiber"        value={n.fiber} />
          <View style={styles.nutriDivider} />
          <NutritionRow label="Protein"      value={n.protein} bold />
          <NutritionRow label="Salt"         value={n.salt} />
          {n.caffeine  !== undefined && <NutritionRow label="Caffeine"  value={n.caffeine}  unit="mg" />}
          {n.calcium   !== undefined && <NutritionRow label="Calcium"   value={n.calcium}   unit="mg" />}
          {n.iron      !== undefined && <NutritionRow label="Iron"      value={n.iron}      unit="mg" />}
          {n.magnesium !== undefined && <NutritionRow label="Magnesium" value={n.magnesium} unit="mg" />}
          {n.potassium !== undefined && <NutritionRow label="Potassium" value={n.potassium} unit="mg" />}
          {n.vitaminC  !== undefined && <NutritionRow label="Vitamin C" value={n.vitaminC}  unit="mg" />}
          {n.vitaminD  !== undefined && <NutritionRow label="Vitamin D" value={n.vitaminD}  unit="µg" />}
          {(n.additionalNutrients ?? []).map((an: any) => (
            <NutritionRow key={an.name} label={an.name} value={an.value} unit={an.unit} />
          ))}
        </View>

        {product.ingredientsText && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>INGREDIENTS</Text>
            <Text style={styles.ingredientsText}>{product.ingredientsText}</Text>
          </View>
        )}

        {product.allergens && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>ALLERGENS</Text>
            {product.allergens.contains.length > 0 && (
              <Text style={styles.allergenContains}>
                Contains: {product.allergens.contains.join(", ")}
              </Text>
            )}
            {product.allergens.mayContain.length > 0 && (
              <Text style={styles.allergenMay}>
                May contain: {product.allergens.mayContain.join(", ")}
              </Text>
            )}
            {product.allergens.freeFrom.length > 0 && (
              <Text style={styles.allergenFree}>
                Free from: {product.allergens.freeFrom.join(", ")}
              </Text>
            )}
          </View>
        )}

        {batch && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>BATCH / LOT</Text>
            <View style={styles.batchRow}>
              <Text style={styles.batchKey}>Lot code</Text>
              <Text style={styles.batchVal}>{batch.batchCodeRaw}</Text>
            </View>
            {batch.manufacturedAt && (
              <View style={styles.batchRow}>
                <Text style={styles.batchKey}>Manufactured</Text>
                <Text style={styles.batchVal}>{new Date(batch.manufacturedAt).toLocaleDateString()}</Text>
              </View>
            )}
            {batch.bestBeforeAt && (
              <View style={styles.batchRow}>
                <Text style={styles.batchKey}>Best before</Text>
                <Text style={styles.batchVal}>{new Date(batch.bestBeforeAt).toLocaleDateString()}</Text>
              </View>
            )}
            {batch.originCountry && (
              <View style={styles.batchRow}>
                <Text style={styles.batchKey}>Origin</Text>
                <Text style={styles.batchVal}>{batch.originCountry}</Text>
              </View>
            )}
            {batch.facilityCode && (
              <View style={styles.batchRow}>
                <Text style={styles.batchKey}>Facility</Text>
                <Text style={styles.batchVal}>{batch.facilityCode}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>PRODUCER</Text>
          <Text style={styles.producerName}>{producer.displayName}</Text>
          <Text style={styles.producerSub}>{producer.name}</Text>
          {producer.countryCode && (
            <Text style={styles.producerCountry}>Country: {producer.countryCode}</Text>
          )}
          {producer.verificationStatus === "verified" && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified producer</Text>
            </View>
          )}
        </View>

        <Pressable onPress={dismiss} style={styles.scanAgainBtnBottom}>
          <Text style={styles.scanAgainText}>Scan another product</Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [querying, setQuerying] = useState(false);
  const recordScan = useMutation(api.products.recordScan);
  const cooldown = useRef(false);

  const queryResult = useQuery(
    api.products.resolveProductByScan,
    scannedBarcode ? { barcode: scannedBarcode } : "skip",
  );

  useEffect(() => {
    if (!scannedBarcode || queryResult === undefined) return;
    setQuerying(false);
    setResult(queryResult as ScanResult);

    recordScan({
      sessionId:        "anonymous",
      barcodeRaw:       scannedBarcode,
      productId:        queryResult.resolutionStatus !== "not_found" ? queryResult.product._id : undefined,
      producerId:       queryResult.resolutionStatus !== "not_found" ? queryResult.producer._id : undefined,
      batchId:          queryResult.resolutionStatus === "found" && queryResult.batch ? queryResult.batch._id : undefined,
      resolutionStatus: queryResult.resolutionStatus,
      clientPlatform:   Platform.OS,
    }).catch(() => {});
  }, [queryResult]);

  const handleBarcodeScan = ({ data }: { data: string }) => {
    if (cooldown.current || result) return;
    cooldown.current = true;
    setQuerying(true);
    setScannedBarcode(data);
    setTimeout(() => { cooldown.current = false; }, 2000);
  };

  const handleClose = () => {
    setResult(null);
    setScannedBarcode(null);
    setQuerying(false);
    cooldown.current = false;
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionSub}>
          kumu needs camera access to scan product barcodes.
        </Text>
        <Pressable onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={result ? undefined : handleBarcodeScan}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr", "code128", "code39"],
        }}
      />

      <View style={[styles.overlay, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.overlayTitle}>Scan a product</Text>
        <Text style={styles.overlaySub}>Point at any barcode</Text>
      </View>

      <View style={styles.finderWrapper}>
        <View style={styles.finder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {querying && (
        <View style={styles.queryingPill}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.queryingText}>Looking up product…</Text>
        </View>
      )}

      {result && <ProductSheet result={result} onClose={handleClose} />}
    </View>
  );
}

const CORNER = 24;
const CORNER_W = 3;
const FINDER_SIZE = 240;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionSub: {
    color: "#8E8E93",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {
    backgroundColor: "#0A84FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  overlayTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 1 },
  },
  overlaySub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 1 },
  },
  finderWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  finder: {
    width: FINDER_SIZE,
    height: FINDER_SIZE / 1.6,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#fff",
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 4 },
  queryingPill: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  queryingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3C",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
  },
  sheetScroll: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  notFoundEmoji: { fontSize: 48, marginBottom: 16 },
  notFoundTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 6 },
  notFoundSub: { color: "#636366", fontSize: 13, marginBottom: 28 },
  productHeader: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 16,
    alignItems: "flex-start",
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
  },
  thumbnailPlaceholderText: { fontSize: 36 },
  productMeta: { flex: 1 },
  brandLabel: { color: "#636366", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  productTitle: { color: "#fff", fontSize: 17, fontWeight: "700", lineHeight: 22, marginBottom: 3 },
  productSubtitle: { color: "#8E8E93", fontSize: 13, marginBottom: 4 },
  netContent: { color: "#636366", fontSize: 12 },
  scoresRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  scoreBadge: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  scoreBadgeSmall: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  scoreBadgeLarge: { color: "#fff", fontSize: 22, fontWeight: "800" },
  recallBanner: {
    backgroundColor: "rgba(255,69,58,0.15)",
    borderWidth: 1,
    borderColor: "#FF453A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  recallText: { color: "#FF453A", fontSize: 13, fontWeight: "600" },
  sectionCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#38383A",
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#636366",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  nutriRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  nutriRowBold: {
    paddingVertical: 6,
  },
  nutriLabel: { color: "#8E8E93", fontSize: 13 },
  nutriLabelBold: { color: "#fff", fontWeight: "600" },
  nutriValue: { color: "#8E8E93", fontSize: 13 },
  nutriDivider: { height: 0.5, backgroundColor: "#2C2C2E", marginVertical: 4 },
  ingredientsText: { color: "#8E8E93", fontSize: 13, lineHeight: 20 },
  allergenContains: { color: "#FF9500", fontSize: 13, fontWeight: "600", marginBottom: 3 },
  allergenMay: { color: "#8E8E93", fontSize: 13, marginBottom: 3 },
  allergenFree: { color: "#30D158", fontSize: 13 },
  batchRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  batchKey: { color: "#636366", fontSize: 13 },
  batchVal: { color: "#fff", fontSize: 13, fontWeight: "500" },
  producerName: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 2 },
  producerSub: { color: "#636366", fontSize: 12, marginBottom: 4 },
  producerCountry: { color: "#8E8E93", fontSize: 13 },
  verifiedBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(48,209,88,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  verifiedText: { color: "#30D158", fontSize: 12, fontWeight: "600" },
  scanAgainBtn: {
    marginTop: 16,
    backgroundColor: "#0A84FF",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  scanAgainBtnBottom: {
    backgroundColor: "#1C1C1E",
    borderWidth: 0.5,
    borderColor: "#38383A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  scanAgainText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
