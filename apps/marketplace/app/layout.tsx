import { Geist, Geist_Mono } from "next/font/google"
import "@zyra/ui/globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@zyra/ui/components/sonner";
import ReactQueryProvider from "@/presentation/layouts/ReactQueryProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <ReactQueryProvider>
            <main className="overflow-y-auto h-[calc(100vh-64px)]"> {children}</main>
            <Toaster position="top-right" />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  )
}
