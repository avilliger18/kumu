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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.rowIcon, destructive && styles.rowIconRed]}>
        <Ionicons name={icon} size={18} color={destructive ? "#FF453A" : "#8E8E93"} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && { color: "#FF453A" }]}>{label}</Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      {showChevron && !destructive && (
        <Ionicons name="chevron-forward" size={16} color="#38383A" />
      )}
    </Pressable>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const [signingOut, setSigningOut] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color="#8E8E93" />
        </View>
        <Text style={styles.name}>kumu user</Text>
        <Text style={styles.email}>Signed in via Magic OTP</Text>
      </View>

      {/* App */}
      <Section title="APP">
        <SettingsRow icon="globe-outline" label="Globe" sublabel="Supply chain visualization" />
        <View style={styles.divider} />
        <SettingsRow icon="notifications-outline" label="Notifications" />
        <View style={styles.divider} />
        <SettingsRow icon="moon-outline" label="Appearance" sublabel="Dark" />
      </Section>

      {/* Account */}
      <Section title="ACCOUNT">
        <SettingsRow icon="shield-checkmark-outline" label="Security" />
        <View style={styles.divider} />
        <SettingsRow icon="key-outline" label="Authentication" sublabel="Magic OTP" />
      </Section>

      {/* About */}
      <Section title="ABOUT">
        <SettingsRow icon="information-circle-outline" label="Version" sublabel="1.0.0" showChevron={false} />
        <View style={styles.divider} />
        <SettingsRow icon="code-outline" label="Built with Convex" showChevron={false} />
      </Section>

      {/* Sign out */}
      <Section>
        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={({ pressed }) => [styles.row, { opacity: pressed || signingOut ? 0.6 : 1 }]}
        >
          <View style={[styles.rowIcon, styles.rowIconRed]}>
            {signingOut ? (
              <ActivityIndicator size="small" color="#FF453A" />
            ) : (
              <Ionicons name="log-out-outline" size={18} color="#FF453A" />
            )}
          </View>
          <Text style={[styles.rowLabel, { color: "#FF453A" }]}>
            {signingOut ? "Signing out…" : "Sign Out"}
          </Text>
        </Pressable>
      </Section>

      <Text style={styles.footer}>kumu · supply chain intelligence</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#38383A",
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  email: {
    color: "#636366",
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#636366",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#38383A",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconRed: {
    backgroundColor: "rgba(255,69,58,0.12)",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "400",
  },
  rowSublabel: {
    color: "#636366",
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#38383A",
    marginLeft: 58,
  },
  footer: {
    color: "#3A3A3C",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
