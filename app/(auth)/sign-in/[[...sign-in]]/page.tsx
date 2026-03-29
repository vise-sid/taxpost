import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const SignInPage = () => {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center">
      {/* Logo & branding */}
      <Link href="/" className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
          <span className="text-3xl font-extrabold text-brand-navy">T</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-wide text-white">
          Taxpost
        </h1>
      </Link>

      {/* Welcome text */}
      <p className="mb-6 text-center text-sm text-white/60">
        Master India&apos;s new Income Tax Act 2025, one lesson a day.
      </p>

      {/* Clerk SignIn — styled to blend */}
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "bg-white/10 backdrop-blur-sm border border-white/10 shadow-none rounded-2xl p-6",
            headerTitle: "text-white font-extrabold text-xl",
            headerSubtitle: "text-white/50 text-sm",
            socialButtonsBlockButton:
              "bg-white hover:bg-white/90 text-brand-navy font-bold border-none rounded-xl h-12 transition-all",
            socialButtonsBlockButtonText: "text-brand-navy font-bold text-sm",
            dividerLine: "bg-white/20",
            dividerText: "text-white/40 text-xs",
            formFieldLabel: "text-white/70 font-semibold text-sm",
            formFieldInput:
              "bg-white/10 border-white/20 text-white rounded-xl h-12 focus:border-brand-orange focus:ring-brand-orange placeholder:text-white/30",
            formButtonPrimary:
              "bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold rounded-xl h-12 text-sm uppercase tracking-wide shadow-lg border-b-4 border-orange-700 active:border-b-0 transition-all",
            footerActionLink:
              "text-brand-orange hover:text-brand-orange/80 font-bold",
            footerActionText: "text-white/50",
            identityPreviewEditButton: "text-brand-orange",
            formFieldAction: "text-brand-orange hover:text-brand-orange/80 font-semibold",
            otpCodeFieldInput:
              "bg-white/10 border-white/20 text-white rounded-lg",
            alternativeMethodsBlockButton:
              "text-white/70 hover:text-white border-white/20 hover:bg-white/10 rounded-xl",
            formResendCodeLink: "text-brand-orange",
            alert: "bg-red-500/20 border-red-500/30 text-red-200 rounded-xl",
            alertText: "text-red-200",
          },
          layout: {
            socialButtonsPlacement: "top",
            showOptionalFields: false,
            logoPlacement: "none",
          },
        }}
      />

      {/* Bottom link */}
      <p className="mt-6 text-center text-xs text-white/30">
        Free forever for Chartered Accountants
      </p>
    </div>
  );
};

export default SignInPage;
