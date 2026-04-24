import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import TermsGuard from "./components/TermsGuard";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Nilexia — FIT Marketplace",
  description: "Private marketplace for the Florida Institute of Technology community",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nilexia",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TermsGuard>
          {children}
        </TermsGuard>
      </body>
    </html>
  );
}