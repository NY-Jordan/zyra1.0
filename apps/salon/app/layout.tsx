import type { Metadata } from "next";
import { Providers } from "../components/providers";
import "../styles/globals.css";
import { Toaster } from "@zyra/ui/components/sonner";
import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "Zyra Salon - Gestion de salon de coiffure",
  description: "Plateforme de gestion complète pour salon de coiffure",
};

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
