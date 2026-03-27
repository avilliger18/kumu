import { SymbolView } from "expo-symbols";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ios26Colors, ios26Radii } from "@/constants/ios26";
import ProductHeroMeter from "@/components/product/product-hero-meter";

type ProductHeroProps = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  batchCode?: string;
  score?: number;
  verified?: boolean;
};

export default function ProductHero({
  title,
  subtitle,
  imageUrl,
  batchCode,
  score,
  verified,
}: ProductHeroProps) {
  return (
    <View style={styles.heroWrap}>
      <View style={styles.heroRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <SymbolView
              name="shippingbox.fill"
              style={styles.imageFallbackIcon}
              tintColor={ios26Colors.textSecondary}
              type="hierarchical"
            />
          </View>
        )}

        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.code}>
            {batchCode || subtitle || "Scanned product"}
          </Text>

          <View style={styles.meterRow}>
            <View style={styles.meterWrap}>
              <ProductHeroMeter value={score} />
            </View>
            <View style={styles.helpDot}>
              <Text style={styles.helpText}>?</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            {verified ? (
              <View style={styles.verifiedPill}>
                <SymbolView
                  name="checkmark.seal.fill"
                  style={styles.verifiedIcon}
                  tintColor="#6CBF43"
                  type="hierarchical"
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>View certificates</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 8,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },
  image: {
    width: 148,
    height: 148,
    resizeMode: "contain",
  },
  imageFallback: {
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios26Colors.surfaceElevated,
  },
  imageFallbackIcon: {
    width: 40,
    height: 40,
  },
  copy: {
    flex: 1,
    gap: 8,
    paddingTop: 12,
  },
  title: {
    color: ios26Colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  code: {
    color: ios26Colors.textSecondary,
    fontSize: 18,
  },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  meterWrap: {
    flex: 1,
  },
  helpDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FF62B1",
  },
  helpText: {
    color: "#FF62B1",
    fontSize: 16,
    fontWeight: "700",
    marginTop: -1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    flexWrap: "wrap",
  },
  verifiedPill: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(108,191,67,0.12)",
  },
  verifiedIcon: {
    width: 22,
    height: 22,
  },
  verifiedText: {
    color: ios26Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAD4B0",
  },
  buttonText: {
    color: "#3A3A33",
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});
