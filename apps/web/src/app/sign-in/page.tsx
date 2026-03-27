// "use client";

// import { useAuthActions } from "@convex-dev/auth/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function SignInPage() {
//   const { signIn } = useAuthActions();
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSendOTP = async () => {
//     const trimmed = email.trim();
//     if (!trimmed) {
//       setError("Please enter your email address.");
//       return;
//     }
//     setError(null);
//     setLoading(true);
//     try {
//       await signIn("console-otp", { email: trimmed });
//       router.push(`/verify?email=${encodeURIComponent(trimmed)}`);
//     } catch (e: any) {
//       setError(e?.message ?? "Failed to send code. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center px-4">
//       <div className="w-full max-w-sm">
//         {/* Wordmark */}
//         <div className="mb-14">
//           <h1 className="text-white text-5xl font-bold tracking-tight mb-3">kumu</h1>
//           <p className="text-zinc-400 text-base leading-relaxed">
//             Enter your email to get a one-time sign-in code.
//           </p>
//         </div>

//         {/* Email field */}
//         <div className="bg-zinc-900 rounded-2xl px-4 pt-3 pb-3 mb-3 border border-zinc-800">
//           <label className="block text-zinc-500 text-xs mb-1 uppercase tracking-widest font-medium">
//             Email
//           </label>
//           <input
//             type="email"
//             className="w-full bg-transparent text-white text-base outline-none placeholder:text-zinc-600"
//             placeholder="you@example.com"
//             autoComplete="email"
//             autoCapitalize="none"
//             value={email}
//             onChange={(e) => {
//               setEmail(e.target.value);
//               if (error) setError(null);
//             }}
//             onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
//           />
//         </div>

//         {error ? (
//           <p className="text-red-400 text-sm mb-4 px-1">{error}</p>
//         ) : (
//           <div className="mb-4" />
//         )}

//         {/* CTA */}
//         <button
//           onClick={handleSendOTP}
//           disabled={loading}
//           className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 rounded-2xl py-4 text-white font-semibold text-base transition-colors"
//         >
//           {loading ? (
//             <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//           ) : (
//             "Continue"
//           )}
//         </button>

//         <p className="text-zinc-600 text-xs text-center mt-8 leading-5">
//           No password. No account required.
//           <br />
//           Just check the Convex console for your code.
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Circles (placeholders for images) */}
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-200 to-blue-100 blur-2xl opacity-60" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-200 to-blue-100 blur-2xl opacity-60" />

      {/* Card */}
      <div className="w-full max-w-sm relative z-10">
        {/* Headline */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#243B53] leading-snug">
            Track your food.
            <br />
            Know its story.
          </h1>
        </div>

        <p className="text-sm text-[#243B53] mb-4 font-medium">
          Sign into Kumu
        </p>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="E-Mail"
            className="w-full px-4 py-4 rounded-xl bg-white border border-blue-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#243B53]"
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
              className="w-full px-4 py-4 rounded-xl bg-white border border-blue-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#243B53]"
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
          className="w-full py-4 rounded-xl bg-[#3A7BFF] text-white font-semibold hover:bg-[#2f6df0] transition disabled:opacity-60 flex items-center justify-center"
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
