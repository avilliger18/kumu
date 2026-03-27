"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import circle from "../../../public/circle-bubble.png";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn("console-otp", { email });
      setStep("code");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!code.trim()) {
      setError("Enter the code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn("console-otp", { email, code });
      router.push("/");
    } catch (e: any) {
      setError(e?.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Circles (placeholders for images) */}
      <Image
        src={circle}
        alt="bubble"
        className="absolute -top-32 -right-32 w-[420px] h-[420px] object-contain opacity-70 pointer-events-none select-none"
      />

      <Image
        src={circle}
        alt="bubble"
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] object-contain opacity-70 pointer-events-none select-none"
      />
      {/* Card */}
      <div className="w-full max-w-sm relative z-10">
        {/* Headline */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold font-heading text-primary leading-snug">
            Track your food.
            <br />
            Know its story.
          </h1>
        </div>

        <p className="text-sm text-primary mb-4 font-medium">Sign into Kumu</p>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="E-Mail"
            className="w-full px-4 py-4 rounded-xl bg-white border border-blue-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
        </div>

        {/* OTP Input (only after step 1) */}
        {step === "code" && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter OTP Code"
              className="w-full px-4 py-4 rounded-xl bg-white border border-blue-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
            />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Button */}
        <button
          onClick={step === "email" ? handleSendOTP : handleVerifyOTP}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary transition disabled:opacity-60 flex items-center justify-center"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : step === "email" ? (
            "Send Code"
          ) : (
            "Verify Code"
          )}
        </button>
      </div>
    </div>
  );
}
