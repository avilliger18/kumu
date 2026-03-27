import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ios = {
  background: PlatformColor("systemGroupedBackground"),
  card: PlatformColor("secondarySystemGroupedBackground"),
  fill: PlatformColor("systemGray6"),
  label: PlatformColor("label"),
  secondaryLabel: PlatformColor("secondaryLabel"),
  tertiaryLabel: PlatformColor("tertiaryLabel"),
  separator: PlatformColor("separator"),
  systemBlue: PlatformColor("systemBlue"),
  systemRed: PlatformColor("systemRed"),
  systemGray: PlatformColor("systemGray"),
};

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.dismissTo("/sign-in");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.description}>
              Manage your account, preferences, and session.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Account</Text>
            <Text style={styles.rowValue}>Signed in</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Theme</Text>
            <Text style={styles.rowValue}>System</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Support</Text>
            <Text style={styles.rowValue}>Available</Text>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.footer}>
          Uses native iOS system colors and grouped surfaces.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ios.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: ios.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    minHeight: "100%",
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 28,
    padding: 16,
    backgroundColor: ios.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios.fill,
  },
  avatarText: {
    color: ios.systemBlue,
    fontSize: 22,
    fontWeight: "700",
  },
  heroCopy: {
    flex: 1,
  },
  title: {
    color: ios.label,
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    color: ios.secondaryLabel,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: ios.card,
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    color: ios.label,
    fontSize: 16,
    fontWeight: "500",
  },
  rowValue: {
    color: ios.tertiaryLabel,
    fontSize: 15,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
    backgroundColor: ios.separator,
  },
  logoutButton: {
    borderRadius: 20,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios.card,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  logoutButtonPressed: {
    opacity: 0.75,
  },
  logoutText: {
    color: ios.systemRed,
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    color: ios.systemGray,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 18,
    marginTop: -2,
  },
});
