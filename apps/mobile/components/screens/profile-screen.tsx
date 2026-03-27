import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ios = {
  background: "#1C1C1E",
  card: "#2C2C2E",
  cardStrong: "#36363A",
  label: PlatformColor("label") as unknown as string,
  secondaryLabel: PlatformColor("secondaryLabel") as unknown as string,
  tertiaryLabel: PlatformColor("tertiaryLabel") as unknown as string,
  separator: "rgba(255,255,255,0.08)",
  systemBlue: PlatformColor("systemBlue") as unknown as string,
  systemRed: PlatformColor("systemRed") as unknown as string,
};

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
) {
  const first = (firstName?.trim() || email?.split("@")[0] || "P").trim();
  const last = lastName?.trim() || "";
  return `${first[0] ?? "P"}${last[0] ?? ""}`.toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.currentProfile);
  const updateName = useMutation(api.users.updateCurrentProfileName);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
  }, [profile]);

  const displayName = useMemo(() => {
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    return combined || profile?.name || "Profile";
  }, [firstName, lastName, profile?.name]);

  const email = profile?.email ?? "";
  const initials = useMemo(
    () => getInitials(firstName, lastName, profile?.email),
    [firstName, lastName, profile?.email],
  );
  const saveNames = async () => {
    const nextFirst = firstName.trim();
    const nextLast = lastName.trim();
    if (
      !nextFirst ||
      (nextFirst === profile?.firstName && nextLast === profile?.lastName)
    )
      return;

    setSaving(true);
    try {
      await updateName({ firstName: nextFirst, lastName: nextLast });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.dismissTo("/sign-in");
  };

  if (profile == null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              onBlur={saveNames}
              placeholder="First name"
              placeholderTextColor={ios.tertiaryLabel}
              style={styles.rowInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              selectionColor={ios.systemBlue}
              selectTextOnFocus
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              onBlur={saveNames}
              placeholder="Last name"
              placeholderTextColor={ios.tertiaryLabel}
              style={styles.rowInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              selectionColor={ios.systemBlue}
              selectTextOnFocus
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowDetail}>Your login address</Text>
            </View>
            <Text style={styles.rowValue}>{email || "Not available"}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        {saving ? <Text style={styles.saving}>Saving changes…</Text> : null}
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
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: ios.secondaryLabel,
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  avatarInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(126, 132, 238, 0.98)",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  name: {
    color: ios.label,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  email: {
    color: ios.secondaryLabel,
    fontSize: 15,
    textAlign: "center",
  },
  sectionCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: ios.card,
  },
  row: {
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: {
    color: ios.label,
    fontSize: 17,
    fontWeight: "600",
  },
  rowDetail: {
    color: ios.secondaryLabel,
    fontSize: 13,
    marginTop: 2,
  },
  rowValue: {
    color: ios.tertiaryLabel,
    fontSize: 15,
    maxWidth: 180,
    textAlign: "right",
  },
  rowInput: {
    color: ios.label,
    fontSize: 16,
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginTop: 0,
    marginBottom: 0,
    textAlign: "right",
    letterSpacing: 0,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 18,
    backgroundColor: ios.separator,
  },
  logoutButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ios.systemRed,
  },
  pressed: {
    opacity: 0.75,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  saving: {
    color: ios.secondaryLabel,
    fontSize: 13,
    textAlign: "center",
  },
});
