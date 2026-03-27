import { useAuthActions } from "@convex-dev/auth/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
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

export default function VerifyScreen() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (email) {
        await SecureStore.setItemAsync("kumu:last-email", email);
      }
      await signIn("console-otp", { email, code });
      router.replace("/(app)");
    } catch (e: any) {
      setError(e?.message ?? "Invalid code. Please try again.");
      setCode("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setCode("");
    setResent(false);
    setResending(true);

    try {
      await signIn("console-otp", { email });
      setResent(true);
    } catch {
      setError("Could not resend code.");
    } finally {
      setResending(false);
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
          <Text style={styles.title}>Check your code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.email}>{email}</Text>
          </Text>
          <Text style={styles.caption}>
            The code appears in the Convex dev server console.
          </Text>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Verification code</Text>
          <TextInput
            ref={inputRef}
            style={styles.fieldInput}
            placeholder="000000"
            placeholderTextColor={ios26Colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(value) => {
              setCode(value);
              if (error) setError(null);
            }}
            onSubmitEditing={handleVerify}
            returnKeyType="done"
            autoFocus
          />
        </View>

        {resent && !error ? (
          <Text style={styles.success}>New code sent. Check the console.</Text>
        ) : null}

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.errorSpacer} />
        )}

        <Pressable
          onPress={handleVerify}
          disabled={loading || code.length < 6}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || loading || code.length < 6) && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Verify</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleResend}
          disabled={resending}
          style={({ pressed }) => [
            styles.linkButton,
            (pressed || resending) && styles.disabled,
          ]}
        >
          <Text style={styles.linkText}>
            Did not receive it?{" "}
            <Text style={styles.linkAccent}>
              {resending ? "Sending..." : "Resend code"}
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: ios26Colors.background,
  },
  hero: {
    marginBottom: 36,
  },
  title: {
    color: ios26Colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    color: ios26Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  email: {
    color: ios26Colors.textPrimary,
    fontWeight: "600",
  },
  caption: {
    color: ios26Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 12,
    fontVariant: ["tabular-nums"],
  },
  success: {
    color: ios26Colors.success,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
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
    marginBottom: 14,
    backgroundColor: ios26Colors.accentStrong,
  },
  primaryButtonText: {
    color: ios26Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  linkText: {
    color: ios26Colors.textSecondary,
    fontSize: 14,
  },
  linkAccent: {
    color: ios26Colors.accentStrong,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.56,
  },
});
