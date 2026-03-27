import { Link } from "expo-router";
import {
  Image,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
    borderRadius: 18,
    padding: 12,
    backgroundColor: PlatformColor("secondarySystemGroupedBackground"),
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: PlatformColor("tertiarySystemGroupedBackground"),
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: PlatformColor("tertiaryLabel"),
    fontSize: 20,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: PlatformColor("label"),
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    color: PlatformColor("secondaryLabel"),
    fontSize: 14,
  },
  time: {
    color: PlatformColor("tertiaryLabel"),
    fontSize: 12,
    marginTop: 2,
  },
});
