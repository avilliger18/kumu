import { Link } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

type ScanHistoryItemProps = {
  barcode: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  scannedAt: number;
};

export default function ScanHistoryItem({
  barcode,
  title,
  subtitle,
  imageUrl,
  scannedAt,
}: ScanHistoryItemProps) {
  return (
    <Link
      href={{ pathname: "/product/[barcode]", params: { barcode } }}
      asChild
    >
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.fallbackText}>?</Text>
          </View>
        )}

        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>
            {title || "Scanned product"}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle || barcode}
          </Text>
          <Text style={styles.time}>
            {new Date(scannedAt).toLocaleString()}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: ios26Radii.card,
    padding: 12,
    backgroundColor: ios26Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ios26Colors.separator,
  },
  pressed: {
    opacity: 0.75,
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: ios26Colors.surfaceElevated,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: ios26Colors.textMuted,
    fontSize: 20,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: ios26Colors.textSecondary,
    fontSize: 14,
  },
  time: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
