import { useAuthActions } from "@convex-dev/auth/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

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
      await signIn("console-otp", { email, code });
      // NavigationGuard in _layout.tsx handles redirect to (app)
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
      className="flex-1 bg-apple-bg"
    >
      <View className="flex-1 justify-center px-6">
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          className="mb-10 self-start"
        >
          <Text className="text-apple-blue text-base">← Back</Text>
        </Pressable>

        {/* Header */}
        <View className="mb-10">
          <Text className="text-apple-text text-4xl font-bold tracking-tight mb-3">
            Enter Code
          </Text>
          <Text className="text-apple-subtext text-base leading-relaxed">
            We sent a 6-digit code to{"\n"}
            <Text className="text-apple-text font-medium">{email}</Text>
          </Text>
          <Text className="text-apple-subtext text-sm mt-2">
            Check the Convex dev server console.
          </Text>
        </View>

        {/* OTP Input */}
        <View className="bg-apple-surface rounded-2xl px-4 pt-3 pb-3 mb-3 border border-apple-border">
          <Text className="text-apple-subtext text-xs mb-1 uppercase tracking-widest font-medium">
            Verification Code
          </Text>
          <TextInput
            ref={inputRef}
            className="text-apple-text text-3xl tracking-[0.4em] font-mono"
            placeholder="000000"
            placeholderTextColor="#38383A"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => {
              setCode(t);
              if (error) setError(null);
            }}
            onSubmitEditing={handleVerify}
            returnKeyType="done"
            autoFocus
          />
        </View>

        {resent && !error && (
          <Text className="text-apple-green text-sm mb-3 px-1">
            New code sent — check the console.
          </Text>
        )}

        {error ? (
          <Text className="text-apple-red text-sm mb-4 px-1">{error}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Verify */}
        <Pressable
          onPress={handleVerify}
          disabled={loading || code.length < 6}
          style={({ pressed }) => ({
            opacity: pressed || loading || code.length < 6 ? 0.5 : 1,
          })}
          className="bg-apple-blue rounded-2xl py-4 items-center mb-4"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Verify</Text>
          )}
        </Pressable>

        {/* Resend */}
        <Pressable
          onPress={handleResend}
          disabled={resending}
          style={({ pressed }) => ({ opacity: pressed || resending ? 0.5 : 1 })}
          className="items-center py-2"
        >
          <Text className="text-apple-subtext text-sm">
            Didn't receive it?{" "}
            <Text className="text-apple-blue">
              {resending ? "Sending…" : "Resend code"}
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
