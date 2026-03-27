import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
    router.push({
      pathname: "/product/[barcode]",
      params: { barcode: data, source: "scan" },
    });
  };

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center]}>
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
          <Text style={styles.permissionText}>
            Allow camera access to scan barcodes and open the product screen in
            a native iOS modal stack.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {cameraActive && (
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleScan}
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "qr",
              "code128",
              "code39",
            ],
          }}
        />
      )}

      <View pointerEvents="none" style={styles.finderArea}>
        <View style={styles.finder}>
          <View style={[styles.corner, styles.cTL]} />
          <View style={[styles.corner, styles.cTR]} />
          <View style={[styles.corner, styles.cBL]} />
          <View style={[styles.corner, styles.cBR]} />
          <View style={styles.scanLine} />
        </View>
      </View>
    </View>
  );
}

const cornerWidth = 3;
const cornerRadius = 7;
const cornerSize = 30;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permissionCard: {
    width: "100%",
    maxWidth: 360,
    padding: 24,
    borderRadius: ios26Radii.card,
    backgroundColor: ios26Colors.surface,
    borderWidth: 1,
    borderColor: ios26Colors.separatorStrong,
    alignItems: "center",
  },
  permissionIconShell: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios26Colors.surfaceElevated,
  },
  permissionIcon: {
    width: 34,
    height: 34,
  },
  permissionTitle: {
    color: ios26Colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  permissionText: {
    color: ios26Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    minWidth: 180,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: ios26Radii.pill,
    alignItems: "center",
    backgroundColor: ios26Colors.accentStrong,
  },
  permissionButtonText: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
  },
  finderArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  finder: {
    width: 250,
    height: 170,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: cornerSize,
    height: cornerSize,
    borderColor: ios26Colors.textPrimary,
  },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    borderTopLeftRadius: cornerRadius,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    borderTopRightRadius: cornerRadius,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    borderBottomLeftRadius: cornerRadius,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    borderBottomRightRadius: cornerRadius,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
});
