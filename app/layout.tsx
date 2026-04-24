import type { Metadata, Viewport } from "next";
import TermsGuard from "./components/TermsGuard";

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
  themeColor: "#007bff",
};

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>
          <TermsGuard>
            {children}
          </TermsGuard>
        </body>
      </html>
    )
  }