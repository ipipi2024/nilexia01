import NDAGuard from "./components/NDAGuard";

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