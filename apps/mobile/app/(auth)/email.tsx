import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { ios26Colors, ios26Radii } from "@/constants/ios26";

export default function EmailScreen() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleContinue() {
    if (!isValid || loading) return;
    setError("");
    setLoading(true);
    try {
      await signIn("console-otp", { email: email.trim().toLowerCase() });
      router.push({
        pathname: "/(auth)/verify",
        params: { email: email.trim().toLowerCase() },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>What's your email?</Text>
            <Text style={styles.subtitle}>
              We'll send you a one-time code to sign in.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={ios26Colors.textMuted}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[
                styles.button,
                (!isValid || loading) && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!isValid || loading}>
              {loading ? (
                <ActivityIndicator color={ios26Colors.surface} size="small" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    (!isValid || loading) && styles.buttonTextDisabled,
                  ]}>
                  Continue
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ios26Colors.bg,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  header: {
    marginTop: 64,
    gap: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: ios26Colors.textMuted,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    borderRadius: ios26Radii.md,
    backgroundColor: ios26Colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },
  input: {
    height: 52,
    fontSize: 17,
    color: ios26Colors.textPrimary,
  },
  errorText: {
    fontSize: 14,
    color: ios26Colors.danger,
    paddingHorizontal: 4,
  },
  button: {
    height: 56,
    borderRadius: ios26Radii.md,
    backgroundColor: ios26Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#E3E3E3",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonTextDisabled: {
    color: ios26Colors.textMuted,
  },
});
