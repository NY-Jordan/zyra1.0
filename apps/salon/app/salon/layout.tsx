'use client'
import { Geist, Geist_Mono } from "next/font/google"
import "../../styles/globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@zyra/ui/components/sonner"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/config/react-query"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@zyra/conf/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push('/auth/login');
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [router]);

  if (!authChecked) {
    return (
      <html lang="fr">
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-4 text-gray-500">Chargement...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers>
          <QueryClientProvider client={queryClient}>
            {isAuthenticated ? children : null}
            <Toaster position="top-right" />
          </QueryClientProvider>
        </Providers>
      </body>
    </html>
  )
}
