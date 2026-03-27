"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
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
      router.push(`/verify?email=${encodeURIComponent(trimmed)}`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-14">
          <h1 className="text-white text-5xl font-bold tracking-tight mb-3">kumu</h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Enter your email to get a one-time sign-in code.
          </p>
        </div>

        {/* Email field */}
        <div className="bg-zinc-900 rounded-2xl px-4 pt-3 pb-3 mb-3 border border-zinc-800">
          <label className="block text-zinc-500 text-xs mb-1 uppercase tracking-widest font-medium">
            Email
          </label>
          <input
            type="email"
            className="w-full bg-transparent text-white text-base outline-none placeholder:text-zinc-600"
            placeholder="you@example.com"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
          />
        </div>

        {error ? (
          <p className="text-red-400 text-sm mb-4 px-1">{error}</p>
        ) : (
          <div className="mb-4" />
        )}

        {/* CTA */}
        <button
          onClick={handleSendOTP}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 rounded-2xl py-4 text-white font-semibold text-base transition-colors"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Continue"
          )}
        </button>

        <p className="text-zinc-600 text-xs text-center mt-8 leading-5">
          No password. No account required.
          <br />
          Just check the Convex console for your code.
        </p>
      </div>
    </div>
  );
}
