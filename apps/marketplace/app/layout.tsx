import { Geist, Geist_Mono, Bricolage_Grotesque, Inter, Montserrat } from "next/font/google"
import localFont from "next/font/local"
import "@zyra/ui/globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@zyra/ui/components/sonner";
import ReactQueryProvider from "@/presentation/layouts/ReactQueryProvider";
import "./../styles/salon-detail.css"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontBricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
})

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fontClash = localFont({
  src: "./fonts/ClashDisplay-Semibold.woff2",
  variable: "--font-clash",
  weight: "600",
  display: "swap",
})

// Headline font — loaded with the full weight range so titles can mix
// black/extrabold for the biggest words and semibold for the rest.
const fontHeading = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontBricolage.variable} ${fontInter.variable} ${fontClash.variable} ${fontHeading.variable} font-sans antialiased`}
      >
        <Providers>
          <ReactQueryProvider>
            <main className="h-screen overflow-y-auto">{children}</main>
            <Toaster position="top-right" />
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  )
}
