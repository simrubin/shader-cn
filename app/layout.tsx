import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Inter_Tight, Geist_Mono as V0_Font_Geist_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"

// Initialize fonts
const interTight = Inter_Tight({ 
  subsets: ['latin'], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-inter-tight',
  display: 'swap',
})
const geistMono = V0_Font_Geist_Mono({ 
  subsets: ['latin'], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: "Shader Studio - GLSL Animation Builder",
  description: "Professional shader animation builder and editor with real-time parameter tweaking",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interTight.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
