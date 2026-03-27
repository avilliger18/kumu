import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ios26Colors } from "@/constants/ios26";

type ModalCloseButtonProps = {
  backgroundColor?: string;
};

export default function ModalCloseButton({
  backgroundColor = "#2C2C2E",
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
      <View style={styles.icon}>
        <View style={[styles.line, styles.lineA]} />
        <View style={[styles.line, styles.lineB]} />
      </View>
    </Pressable>
  );
}

const LINE_LENGTH = 16;
const LINE_THICKNESS = 2.25;

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: LINE_LENGTH,
    height: LINE_LENGTH,
  },
  line: {
    position: "absolute",
    width: LINE_LENGTH,
    height: LINE_THICKNESS,
    borderRadius: 999,
    backgroundColor: ios26Colors.textPrimary,
    top: (LINE_LENGTH - LINE_THICKNESS) / 2,
    left: 0,
  },
  lineA: {
    transform: [{ rotate: "45deg" }],
  },
  lineB: {
    transform: [{ rotate: "-45deg" }],
  },
});
