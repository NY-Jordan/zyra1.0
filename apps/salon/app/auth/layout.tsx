import type { Metadata } from "next";
import { Providers } from "../../components/providers";
import "@zyra/ui/globals.css"
import { Toaster } from "@zyra/ui/components/sonner";
import { Geist, Geist_Mono } from "next/font/google";


export const metadata: Metadata = {
  title: "Salon Admin - Gestion de salon",
  description: "Interface d'administration pour salon de coiffure",
};

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
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
