import { useAuthActions } from "@convex-dev/auth/react";
import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  createNativeCloseButtonOptions,
  ios26LargeTitleScreenOptions,
} from "@/constants/ios26-navigation";
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
        {!destructive && <Text style={styles.chevron}>{">"}</Text>}
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
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          ...ios26LargeTitleScreenOptions,
          ...createNativeCloseButtonOptions(() => router.back()),
        }}
      />
      <ScrollView
        style={styles.root}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.name}>Abinayan Sureskumar</Text>
          <Text style={styles.email}>abinayan@example.com</Text>
        </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ios26Colors.surface,
  },
  scrollContent: {
    paddingTop: 8,
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
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
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
    backgroundColor: ios26Colors.surfaceHigh,
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
