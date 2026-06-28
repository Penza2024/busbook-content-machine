import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar, MobileNav } from "@/components/layout/sidebar"
import { Providers } from "@/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "BusBook Content Machine",
  description: "Content Operating System for SaaS Launch",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
