import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const scanning = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      scanning.current = false;
      return () => setCameraActive(false);
    }, []),
  );

  const handleScan = ({ data }: { data: string }) => {
    if (scanning.current) return;
    scanning.current = true;
    router.push({ pathname: "/product/[barcode]", params: { barcode: data } });
  };

  if (!permission) return <View style={s.root} />;

  if (!permission.granted) {
    return (
      <View style={[s.root, s.center]}>
        <SymbolView name="camera.fill" style={s.permIcon} tintColor="#636366" type="hierarchical" />
        <Text style={s.permTitle}>Camera Access</Text>
        <Text style={s.permSub}>kumu needs camera access to scan product barcodes.</Text>
        <Pressable onPress={requestPermission} style={s.permBtn}>
          <Text style={s.permBtnText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleScan}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr", "code128", "code39"],
          }}
        />
      )}

      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.headerTitle}>Scanner</Text>
        <Text style={s.headerSub}>Hold camera over any barcode</Text>
      </View>

      <View style={s.finderArea}>
        <View style={s.finder}>
          <View style={[s.corner, s.cTL]} />
          <View style={[s.corner, s.cTR]} />
          <View style={[s.corner, s.cBL]} />
          <View style={[s.corner, s.cBR]} />
          <View style={s.scanLine} />
        </View>
        <Text style={s.finderLabel}>Align barcode within frame</Text>
      </View>
    </View>
  );
}

const CW = 3;
const CR = 5;
const CS = 26;

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },

  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    alignItems: "center",
    paddingBottom: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 1 },
  },
  headerSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 3,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 1 },
  },

  finderArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  finder: {
    width: 240,
    height: 160,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner:       { position: "absolute", width: CS, height: CS, borderColor: "#fff" },
  cTL: { top: 0, left: 0,    borderTopWidth: CW,    borderLeftWidth: CW,   borderTopLeftRadius: CR },
  cTR: { top: 0, right: 0,   borderTopWidth: CW,    borderRightWidth: CW,  borderTopRightRadius: CR },
  cBL: { bottom: 0, left: 0,  borderBottomWidth: CW, borderLeftWidth: CW,   borderBottomLeftRadius: CR },
  cBR: { bottom: 0, right: 0, borderBottomWidth: CW, borderRightWidth: CW,  borderBottomRightRadius: CR },
  scanLine: {
    position: "absolute",
    left: 0, right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  finderLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 1 },
  },

  permIcon:    { width: 52, height: 52, marginBottom: 20 },
  permTitle:   { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  permSub:     { color: "#8E8E93", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  permBtn:     { backgroundColor: "#0A84FF", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14 },
  permBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
