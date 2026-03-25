import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";

import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1a237e",
};

export const metadata: Metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <ClerkProvider
          appearance={{
            layout: {
              logoImageUrl: "/favicon.ico",
            },
            variables: {
              colorPrimary: "#1a237e",
            },
          }}
          afterSignOutUrl="/"
        >
          <Toaster theme="light" richColors closeButton />
          <ExitModal />
          <HeartsModal />
          <PracticeModal />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
