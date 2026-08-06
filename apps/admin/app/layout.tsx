import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "@zyra/ui/globals.css"
import { Providers } from "@/components/providers"
import ReactQueryProvider from "@/presentation/layouts/ReactQueryProvider"
import { Toaster } from "@zyra/ui/components/sonner"

export const metadata: Metadata = {
  title: "Zyraa Admin",
  description: "Plateforme d'administration Zyraa",
}

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers>
          <ReactQueryProvider>
            {children}
            <Toaster position="top-right" />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  )
}
