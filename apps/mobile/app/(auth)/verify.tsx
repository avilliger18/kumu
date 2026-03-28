import { useAuthActions } from "@convex-dev/auth/react";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const { signIn } = useAuthActions();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);

  const isComplete = code.length === CODE_LENGTH;

  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isComplete || loading) return;

    let cancelled = false;

    const verify = async () => {
      setError("");
      setLoading(true);
      try {
        await signIn("console-otp", { email, code });
      } catch {
        if (cancelled) return;
        setError("Invalid code. Please try again.");
        setCode("");
        inputRef.current?.focus();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [code, email, isComplete, loading, signIn]);

  async function handleResend() {
    if (resending) return;
    setError("");
    setCode("");
    setResending(true);
    try {
      await signIn("console-otp", { email });
    } catch {
      setError("Could not resend code. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(t) => {
                setError("");
                setCode(t.replace(/\D/g, "").slice(0, CODE_LENGTH));
              }}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              textContentType="oneTimeCode"
            />

            <Pressable
              style={styles.codeRow}
              onPress={() => inputRef.current?.focus()}
            >
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const char = code[i];
                const isActive = code.length === i && !loading;
                return (
                  <View
                    key={i}
                    style={[
                      styles.codeBox,
                      isActive && styles.codeBoxActive,
                      char && styles.codeBoxFilled,
                      error ? styles.codeBoxError : null,
                    ]}
                  >
                    {loading && i === 0 ? (
                      <ActivityIndicator
                        color={ios26Colors.textMuted}
                        size="small"
                      />
                    ) : (
                      <Text style={styles.codeChar}>{char || ""}</Text>
                    )}
                  </View>
                );
              })}
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn&apos;t get it? </Text>
              <Pressable onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator color={ios26Colors.accent} size="small" />
                ) : (
                  <Text style={styles.resendLink}>Resend code</Text>
                )}
              </Pressable>
            </View>
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
    paddingBottom: 48,
  },
  header: {
    marginTop: 24,
    gap: 0,
  },
  backButton: {
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 17,
    color: ios26Colors.accent,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: ios26Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: ios26Colors.textMuted,
    lineHeight: 26,
  },
  emailHighlight: {
    color: ios26Colors.textPrimary,
    fontWeight: "500",
  },
  form: {
    gap: 20,
    alignItems: "center",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  codeRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    justifyContent: "center",
  },
  codeBox: {
    width: 48,
    height: 60,
    borderRadius: ios26Radii.sm,
    backgroundColor: ios26Colors.surface,
    borderWidth: 1.5,
    borderColor: "#E3E3E3",
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxActive: {
    borderColor: ios26Colors.accent,
  },
  codeBoxFilled: {
    borderColor: "#CCDDEF",
    backgroundColor: "#EEF2F9",
  },
  codeBoxError: {
    borderColor: ios26Colors.danger,
    backgroundColor: "#FFF0F0",
  },
  codeChar: {
    fontSize: 26,
    fontWeight: "600",
    color: ios26Colors.textPrimary,
    letterSpacing: 0,
  },
  errorText: {
    fontSize: 14,
    color: ios26Colors.danger,
    textAlign: "center",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  resendLabel: {
    fontSize: 15,
    color: ios26Colors.textMuted,
  },
  resendLink: {
    fontSize: 15,
    color: ios26Colors.accent,
    fontWeight: "500",
  },
});
