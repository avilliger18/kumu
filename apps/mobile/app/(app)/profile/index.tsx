import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  destructive = false,
  showChevron = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, destructive && styles.rowIconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? ios26Colors.danger : ios26Colors.textSecondary}
        />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDanger]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {showChevron && !destructive ? (
        <Ionicons name="chevron-forward" size={16} color={ios26Colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets
      automaticallyAdjustsScrollIndicatorInsets
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={ios26Colors.textSecondary} />
        </View>
        <Text style={styles.name}>kumu user</Text>
        <Text style={styles.email}>Signed in via Magic OTP</Text>
      </View>

      <Section title="App">
        <SettingsRow icon="globe-outline" label="Globe" sublabel="Supply chain visualization" />
        <View style={styles.divider} />
        <SettingsRow icon="notifications-outline" label="Notifications" sublabel="System defaults" />
        <View style={styles.divider} />
        <SettingsRow icon="moon-outline" label="Appearance" sublabel="Dark" />
      </Section>

      <Section title="Account">
        <SettingsRow icon="shield-checkmark-outline" label="Security" />
        <View style={styles.divider} />
        <SettingsRow icon="key-outline" label="Authentication" sublabel="Magic OTP" />
      </Section>

      <Section title="About">
        <SettingsRow
          icon="information-circle-outline"
          label="Version"
          sublabel="1.0.0"
          showChevron={false}
        />
        <View style={styles.divider} />
        <SettingsRow icon="code-outline" label="Built with Convex" showChevron={false} />
      </Section>

      <Section>
        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={({ pressed }) => [styles.row, (pressed || signingOut) && styles.pressed]}
        >
          <View style={[styles.rowIcon, styles.rowIconDanger]}>
            {signingOut ? (
              <ActivityIndicator size="small" color={ios26Colors.danger} />
            ) : (
              <Ionicons name="log-out-outline" size={18} color={ios26Colors.danger} />
            )}
          </View>
          <Text style={[styles.rowLabel, styles.rowLabelDanger]}>
            {signingOut ? "Signing out..." : "Sign Out"}
          </Text>
        </Pressable>
      </Section>

      <Text style={styles.footer}>kumu / supply chain intelligence</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ios26Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: ios26Colors.separatorStrong,
    backgroundColor: ios26Colors.surface,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios26Colors.surfaceElevated,
  },
  name: {
    color: ios26Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    color: ios26Colors.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    overflow: "hidden",
    borderRadius: ios26Radii.card,
    borderWidth: 1,
    borderColor: ios26Colors.separator,
    backgroundColor: ios26Colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios26Colors.surfaceElevated,
  },
  rowIconDanger: {
    backgroundColor: "rgba(255,95,87,0.12)",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  rowLabelDanger: {
    color: ios26Colors.danger,
  },
  rowSublabel: {
    color: ios26Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
    backgroundColor: ios26Colors.separator,
  },
  pressed: {
    opacity: 0.72,
  },
  footer: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
