"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignInPage = () => {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = result.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code"
      );

      if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setStep("code");
      } else {
        setError("Email sign-in is not available. Please contact support.");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push("/learn");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/learn",
      });
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => router.push("/")}
          className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-6 w-6" />
        </button>

        <Link
          href="/sign-up"
          className="rounded-xl border-2 border-neutral-200 px-4 py-2 text-sm font-bold uppercase tracking-wide text-brand-navy transition-colors hover:bg-neutral-50"
        >
          Sign up
        </Link>
      </div>

      {/* Form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[400px]">
          {step === "email" ? (
            <>
              <h1 className="mb-8 text-center text-2xl font-bold text-neutral-800">
                Log in
              </h1>

              <form onSubmit={handleSendCode} className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    autoFocus
                    className="h-[52px] w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 text-base text-neutral-800 placeholder:text-neutral-400 focus:border-sky-400 focus:bg-white focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-brand-navy font-bold uppercase tracking-wide text-white shadow-[0_4px_0_0] shadow-brand-navy/40 transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-4">
                <div className="h-[2px] flex-1 bg-neutral-200" />
                <span className="text-sm font-bold text-neutral-400">OR</span>
                <div className="h-[2px] flex-1 bg-neutral-200" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-neutral-200 bg-white font-bold uppercase tracking-wide text-neutral-600 transition-colors hover:bg-neutral-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <p className="mt-6 text-center text-xs text-neutral-400">
                By signing in, you agree to our Terms and Privacy Policy.
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-center text-2xl font-bold text-neutral-800">
                Check your email
              </h1>
              <p className="mb-8 text-center text-sm text-neutral-500">
                We sent a verification code to{" "}
                <span className="font-semibold text-neutral-700">{email}</span>
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  autoFocus
                  maxLength={6}
                  className="h-[52px] w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 text-center text-lg font-bold tracking-[0.3em] text-neutral-800 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-400 focus:border-sky-400 focus:bg-white focus:outline-none"
                />

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-brand-navy font-bold uppercase tracking-wide text-white shadow-[0_4px_0_0] shadow-brand-navy/40 transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  className="text-sm font-bold text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  Change email
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-sm font-bold text-brand-navy transition-colors hover:text-brand-navy/80"
                >
                  Resend code
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default SignInPage;
