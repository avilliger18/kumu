import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ios26Colors } from "@/constants/ios26";

type ModalCloseButtonProps = {
  backgroundColor?: string;
};

// Button and line dimensions
const BTN = 32;
const LINE_W = 14;
const LINE_H = 2;
// These insets place the line's center exactly at the button's center
const LINE_TOP = (BTN - LINE_H) / 2;
const LINE_LEFT = (BTN - LINE_W) / 2;

export default function ModalCloseButton({
  backgroundColor = ios26Colors.surfaceElevated,
}: ModalCloseButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close modal"
      onPress={() => router.dismiss()}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.lineA} />
      <View style={styles.lineB} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
  },
  pressed: {
    opacity: 0.6,
  },
  lineA: {
    position: "absolute",
    top: LINE_TOP,
    left: LINE_LEFT,
    width: LINE_W,
    height: LINE_H,
    borderRadius: LINE_H / 2,
    backgroundColor: ios26Colors.textSecondary,
    transform: [{ rotate: "45deg" }],
  },
  lineB: {
    position: "absolute",
    top: LINE_TOP,
    left: LINE_LEFT,
    width: LINE_W,
    height: LINE_H,
    borderRadius: LINE_H / 2,
    backgroundColor: ios26Colors.textSecondary,
    transform: [{ rotate: "-45deg" }],
  },
});
