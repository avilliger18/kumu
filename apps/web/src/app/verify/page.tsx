"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense } from "react";
import { getErrorMessage } from "~/lib/error-message";

function VerifyForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn("console-otp", { email, code });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Invalid code. Please try again."));
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.back()}
          className="mb-10 text-blue-400 text-base hover:text-blue-300 transition-colors"
        >
          ← Back
        </button>

        <div className="mb-10">
          <h1 className="text-white text-4xl font-bold tracking-tight mb-3">
            Enter Code
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Check the Convex dev server console.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl px-4 pt-3 pb-3 mb-3 border border-zinc-800">
          <label className="block text-zinc-500 text-xs mb-1 uppercase tracking-widest font-medium">
            Verification Code
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            className="w-full bg-transparent text-white text-3xl tracking-[0.4em] font-mono outline-none placeholder:text-zinc-800"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
        </div>

        {resent && !error && (
          <p className="text-green-400 text-sm mb-3 px-1">
            New code sent — check the console.
          </p>
        )}

        {error ? (
          <p className="text-red-400 text-sm mb-4 px-1">{error}</p>
        ) : (
          <div className="mb-4" />
        )}

        <button
          onClick={handleVerify}
          disabled={loading || code.length < 6}
          className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 rounded-2xl py-4 text-white font-semibold text-base transition-colors mb-4"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Verify"
          )}
        </button>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full py-2 text-zinc-500 text-sm hover:text-zinc-400 transition-colors disabled:opacity-50"
        >
          Didn&apos;t receive it?{" "}
          <span className="text-blue-400">
            {resending ? "Sending…" : "Resend code"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
