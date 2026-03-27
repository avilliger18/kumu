import { type Href, Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PlatformColor, Pressable, StyleSheet, View } from "react-native";

type ModalCloseButtonProps = {
  href?: Href;
  backgroundColor?: string;
};

export default function ModalCloseButton({
  href = "..",
  backgroundColor = "#2C2C2E",
}: ModalCloseButtonProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name="close"
            size={18}
            color={PlatformColor("label") as unknown as string}
          />
        </View>
      </Pressable>
    </Link>
  );
}

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
  iconWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
