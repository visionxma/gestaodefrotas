import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Controle de Frotas",
  description: "Sistema de gestão de frotas de caminhões",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Controle de Frotas",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Controle de Frotas",
    title: "Controle de Frotas",
    description: "Sistema de controle de frotas de caminhões",
  },
  twitter: {
    card: "summary",
    title: "Gestão de Frotas",
    description: "Sistema de gestão de frotas de caminhões",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
