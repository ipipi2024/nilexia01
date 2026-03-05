import type { Metadata, Viewport } from "next";
import NDAGuard from "./components/NDAGuard";

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
          <NDAGuard>
            {children}
          </NDAGuard>
        </body>
      </html>
    )
  }