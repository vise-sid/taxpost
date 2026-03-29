"use client";

import { useSignUp } from "@clerk/nextjs/legacy";
import { ArrowLeft, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignUpPage = () => {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "code">("details");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setStep("code");
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
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
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

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Could not resend code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[380px] flex-col items-center">
      {/* Logo */}
      <Link href="/" className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/10">
          <span className="text-3xl font-extrabold text-brand-navy">T</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-wide text-white">
          Taxpost
        </h1>
      </Link>

      {step === "details" ? (
        <>
          <h2 className="mb-2 text-xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mb-8 text-sm text-white/50">
            Join CAs preparing for the new Income Tax Act 2025
          </p>

          <form onSubmit={handleSendCode} className="w-full space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First"
                    required
                    autoFocus
                    className="h-12 w-full rounded-xl border border-white/20 bg-white/15 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  required
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/15 px-4 text-sm text-white placeholder:text-white/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/15 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !firstName || !lastName}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange font-extrabold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-brand-orange/90 active:translate-y-0.5 disabled:opacity-50 disabled:active:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-bold text-brand-orange transition-colors hover:text-brand-orange/80"
            >
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setStep("details");
              setCode("");
              setError("");
            }}
            className="mb-6 flex items-center gap-1.5 self-start text-xs font-bold uppercase tracking-wide text-white/40 transition-colors hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <h2 className="mb-2 text-xl font-extrabold text-white">
            Check your email
          </h2>
          <p className="mb-8 text-center text-sm text-white/50">
            We sent a code to{" "}
            <span className="font-semibold text-white/70">{email}</span>
          </p>

          <form onSubmit={handleVerifyCode} className="w-full space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">
                Verification code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                autoFocus
                maxLength={6}
                className="h-12 w-full rounded-xl border border-white/20 bg-white/15 px-4 text-center text-lg font-bold tracking-[0.3em] text-white placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-white/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange font-extrabold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-brand-orange/90 active:translate-y-0.5 disabled:opacity-50 disabled:active:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <button
            onClick={handleResendCode}
            disabled={loading}
            className="mt-4 text-xs font-semibold text-brand-orange transition-colors hover:text-brand-orange/80"
          >
            Didn&apos;t receive it? Resend code
          </button>
        </>
      )}

      <p className="mt-10 text-[11px] text-white/20">
        Free forever for Chartered Accountants
      </p>
    </div>
  );
};

export default SignUpPage;
