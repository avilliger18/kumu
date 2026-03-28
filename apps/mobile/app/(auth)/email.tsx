import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
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

const bubbleImage = require("@/assets/images/circle-bubble.png") as number;

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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Background bubbles */}
      <Image source={bubbleImage} style={styles.bubbleLeft} />
      <Image source={bubbleImage} style={styles.bubbleRight} />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Centered hero title */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Track your food.{"\n"}Know its story.
          </Text>
        </View>

        {/* Form section */}
        <View style={styles.formSection}>
          <Text style={styles.signInLabel}>Sign into Kumu</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="E-Mail"
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
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={ios26Colors.surface} size="small" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  (!isValid || loading) && styles.buttonTextDisabled,
                ]}
              >
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bubbleLeft: {
    position: "absolute",
    width: 380,
    height: 380,
    top: "30%",
    left: -160,
    opacity: 0.85,
  },
  bubbleRight: {
    position: "absolute",
    width: 420,
    height: 420,
    top: -100,
    right: -140,
    opacity: 0.85,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1A2E4A",
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  formSection: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 12,
  },
  signInLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: ios26Colors.textPrimary,
    marginBottom: 4,
  },
  inputWrapper: {
    borderRadius: ios26Radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#C8D8E8",
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
    backgroundColor: "#1B3A5B",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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
