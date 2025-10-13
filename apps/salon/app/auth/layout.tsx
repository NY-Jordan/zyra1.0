'use client'
import type { Metadata } from "next";
import { Providers } from "../../components/providers";
import "../../styles/globals.css"
import { Toaster } from "@zyra/ui/components/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@zyra/conf/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";



const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/salon/dashboard');
      } else {
        setIsChecking(false);
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (isChecking) {
    return (
      <html lang="fr" suppressHydrationWarning>
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
          <div className="min-h-screen flex items-center justify-center bg-zinc-100">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zinc-800"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
