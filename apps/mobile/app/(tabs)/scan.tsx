import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

export default function ScanScreen() {
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

    try {
      router.push({
        pathname: "/product/[barcode]",
        params: { barcode: data, source: "scan" },
      });
    } catch {
                                        
      scanning.current = false;
      return;
    }

                                                                              
                                                                       
                                                               
    setTimeout(() => {
      scanning.current = false;
    }, 2000);
  };

                                                                              
  if (!permission) {
    return <View style={styles.root} />;
  }

                                                                               
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.root, styles.center]} edges={["top"]}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconShell}>
            <SymbolView
              name="camera.aperture"
              style={styles.permissionIcon}
              tintColor={ios26Colors.textPrimary}
              type="hierarchical"
            />
          </View>
          <Text style={styles.permissionTitle}>Camera access</Text>
          <Text style={styles.permissionBody}>
            Allow camera access to scan product barcodes and instantly look up
            ingredients, nutrition, and origin.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionBtn,
              pressed && { opacity: 0.72 },
            ]}>
            <Text style={styles.permissionBtnText}>Allow Camera</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

                                                                               
  return (
    <View style={styles.root}>
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

      
      <View pointerEvents="none" style={styles.overlay} />

      
      <View pointerEvents="none" style={styles.ui}>
        
        <SafeAreaView edges={["top"]}>
          <View style={styles.topArea}>
            <Text style={styles.screenTitle}>Scan</Text>
            <Text style={styles.screenSub}>Point at a product barcode</Text>
          </View>
        </SafeAreaView>

        
        <View style={styles.finderWrap}>
          <View style={styles.finder}>
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
            <View style={styles.scanLine} />
          </View>
        </View>

        <SafeAreaView edges={["bottom"]} />
      </View>
    </View>
  );
}

const CORNER = 3;
const CORNER_R = 7;
const CORNER_SZ = 30;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

                                                                                
  permissionCard: {
    width: "100%",
    maxWidth: 360,
    padding: 28,
    borderRadius: ios26Radii.card,
    backgroundColor: ios26Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.separatorStrong,
    alignItems: "center",
  },
  permissionIconShell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios26Colors.surfaceElevated,
  },
  permissionIcon: { width: 36, height: 36 },
  permissionTitle: {
    color: ios26Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  permissionBody: {
    color: ios26Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 26,
  },
  permissionBtn: {
    minWidth: 200,
    paddingVertical: 15,
    borderRadius: ios26Radii.pill,
    alignItems: "center",
    backgroundColor: ios26Colors.accent,
  },
  permissionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

                                                                                
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  ui: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  screenSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },

                                                                                
  finderWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  finder: {
    width: 270,
    height: 180,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: CORNER_SZ,
    height: CORNER_SZ,
    borderColor: "#fff",
  },
  cTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER, borderLeftWidth: CORNER,
    borderTopLeftRadius: CORNER_R,
  },
  cTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER, borderRightWidth: CORNER,
    borderTopRightRadius: CORNER_R,
  },
  cBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER, borderLeftWidth: CORNER,
    borderBottomLeftRadius: CORNER_R,
  },
  cBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER, borderRightWidth: CORNER,
    borderBottomRightRadius: CORNER_R,
  },
  scanLine: {
    position: "absolute",
    left: 10, right: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.80)",
  },

  hint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 28,
  },
});
