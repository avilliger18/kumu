import { StyleSheet, View } from "react-native";

type ProductHeroMeterProps = {
  value?: number;
};

export default function ProductHeroMeter({ value }: ProductHeroMeterProps) {
  const normalized = Math.max(0, Math.min(100, value ?? 50));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${normalized}%` }]} />
      <View style={[styles.knob, { left: `${normalized}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255, 84, 153, 0.12)",
    position: "relative",
    justifyContent: "center",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    right: "auto",
    borderRadius: 14,
    backgroundColor: "#FF4FAD",
  },
  knob: {
    position: "absolute",
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});
