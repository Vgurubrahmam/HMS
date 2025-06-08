import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./provider"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hackathon Management System",
  description: "Complete hackathon management platform for coordinators, faculty, students, and mentors",
    generator: 'Guru'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
