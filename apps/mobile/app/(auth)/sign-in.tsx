import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

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
      router.push({ pathname: "/(auth)/verify", params: { email: trimmed } });
    } catch (e: any) {
      setError(e?.message ?? "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-apple-bg"
    >
      <View className="flex-1 justify-center px-6">
        {/* Wordmark */}
        <View className="mb-14">
          <Text className="text-apple-text text-5xl font-bold tracking-tight mb-3">
            kumu
          </Text>
          <Text className="text-apple-subtext text-base leading-relaxed">
            Enter your email to get a one-time sign-in code.
          </Text>
        </View>

        {/* Email field */}
        <View className="bg-apple-surface rounded-2xl px-4 pt-3 pb-3 mb-3 border border-apple-border">
          <Text className="text-apple-subtext text-xs mb-1 uppercase tracking-widest font-medium">
            Email
          </Text>
          <TextInput
            className="text-apple-text text-base"
            placeholder="you@example.com"
            placeholderTextColor="#8E8E93"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError(null);
            }}
            onSubmitEditing={handleSendOTP}
            returnKeyType="send"
          />
        </View>

        {error ? (
          <Text className="text-apple-red text-sm mb-4 px-1">{error}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* CTA */}
        <Pressable
          onPress={handleSendOTP}
          disabled={loading}
          style={({ pressed }) => ({ opacity: pressed || loading ? 0.7 : 1 })}
          className="bg-apple-blue rounded-2xl py-4 items-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Continue
            </Text>
          )}
        </Pressable>

        <Text className="text-apple-subtext text-xs text-center mt-8 leading-5">
          No password. No account required.{"\n"}
          Just check the Convex console for your code.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
