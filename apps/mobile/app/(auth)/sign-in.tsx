import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ios26Colors, ios26Radii } from "@/constants/ios26";

export default function SignInScreen() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signIn("console-otp", { email: trimmed });
      router.push({ pathname: "/verify", params: { email: trimmed } });
    } catch (e: any) {
      setError(e?.message ?? "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={styles.root}
    >
      <View className="flex-1 justify-center px-6">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Supply intelligence</Text>
          <Text style={styles.title}>Sign in to kumu</Text>
          <Text style={styles.subtitle}>
            Use your email to receive a one-time code and enter the new iOS 26 navigation shell.
          </Text>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="you@example.com"
            placeholderTextColor={ios26Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
            onSubmitEditing={handleSendOTP}
            returnKeyType="send"
          />
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.errorSpacer} />
        )}

        <Pressable
          onPress={handleSendOTP}
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || loading) && styles.pressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </Pressable>

        <Text style={styles.footnote}>
          No password required. Check the Convex console for the code after you continue.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: ios26Colors.background,
  },
  hero: {
    marginBottom: 48,
  },
  eyebrow: {
    color: ios26Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  title: {
    color: ios26Colors.textPrimary,
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  subtitle: {
    color: ios26Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  fieldCard: {
    borderRadius: ios26Radii.card,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 8,
    backgroundColor: ios26Colors.surface,
    borderWidth: 1,
    borderColor: ios26Colors.separatorStrong,
  },
  fieldLabel: {
    color: ios26Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  fieldInput: {
    color: ios26Colors.textPrimary,
    fontSize: 17,
  },
  error: {
    color: ios26Colors.danger,
    fontSize: 14,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  errorSpacer: {
    height: 24,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ios26Radii.pill,
    paddingVertical: 16,
    backgroundColor: ios26Colors.accentStrong,
  },
  primaryButtonText: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
  },
  footnote: {
    color: ios26Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 28,
    paddingHorizontal: 14,
  },
});
