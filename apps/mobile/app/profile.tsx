import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

type RowProps = {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
};

function Row({ label, onPress, destructive, last }: RowProps) {
  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <Text style={[styles.rowLabel, destructive && styles.rowDestructive]}>
          {label}
        </Text>
        {!destructive && <Text style={styles.chevron}>›</Text>}
      </Pressable>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export default function ProfileModal() {
  const { signOut } = useAuthActions();
  const insets = useSafeAreaInsets();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/email");
  }

  return (
    <View style={styles.root}>
      {/* Drag handle area */}
      <View style={styles.handleBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical>

        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.name}>Abinayan Sureskumar</Text>
          <Text style={styles.email}>abinayan@example.com</Text>
        </View>

        {/* Account */}
        <Group>
          <Row label="Edit profile" />
          <Row label="Notifications" last />
        </Group>

        <SectionTitle title="Preferences" />
        <Group>
          <Row label="Dietary filters" />
          <Row label="Allergen alerts" />
          <Row label="Language" last />
        </Group>

        <SectionTitle title="Privacy" />
        <Group>
          <Row label="Scan history" />
          <Row label="Data & privacy" last />
        </Group>

        <Group>
          <Row label="Sign out" onPress={handleSignOut} destructive last />
        </Group>

        <Text style={styles.footer}>
          Your scan data is stored securely and never shared without your consent.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ios26Colors.surface,
  },
  handleBar: {
    height: 56,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ios26Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 13,
    color: ios26Colors.textMuted,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5E5CE6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 15,
    color: ios26Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: ios26Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  group: {
    marginHorizontal: 20,
    backgroundColor: ios26Colors.surfaceElevated,
    borderRadius: ios26Radii.card,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  rowPressed: {
    backgroundColor: ios26Colors.surfaceElevated,
  },
  rowLabel: {
    fontSize: 17,
    color: ios26Colors.textPrimary,
  },
  rowDestructive: {
    color: ios26Colors.danger,
  },
  chevron: {
    fontSize: 20,
    color: ios26Colors.textMuted,
    fontWeight: "300",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ios26Colors.separator,
    marginLeft: 18,
  },
  footer: {
    fontSize: 13,
    color: ios26Colors.surfaceHigh,
    textAlign: "center",
    marginHorizontal: 32,
    marginTop: 24,
    lineHeight: 18,
  },
});
