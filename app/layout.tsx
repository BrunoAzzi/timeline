import type React from "react"
import "@/styles/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Timeline",
  description: "Interactive timeline visualization component inspired by Linear",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[rgb(18,18,18)] min-h-screen">{children}</body>
    </html>
  )
}