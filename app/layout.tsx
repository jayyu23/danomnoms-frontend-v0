import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "@rainbow-me/rainbowkit/styles.css"
import "./globals.css"

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: "DaNomNoms - AI Food Delivery Agent",
  description: "Order food with AI-powered delivery using x402 micropayments on Monad",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
