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
import SalonChecker from "@/presentation/components/layout/SalonChecker"
import { useOwner } from "@/hooks/useOwner"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"

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
  const [statusChecked, setStatusChecked] = useState(false);
  const router = useRouter();
  const { owner, isLoading: ownerLoading } = useOwner();
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

  // Vérification du statut du propriétaire après l'authentification
  useEffect(() => {
    if (authChecked && isAuthenticated && !ownerLoading) {
      if (owner && owner.status.name === SalonStatusEnum.payment) {
        router.push('/payment/packages');
        return;
      }
      setStatusChecked(true);
    }
  }, [authChecked, isAuthenticated, owner, ownerLoading, router]);

  if (!authChecked || !statusChecked || ownerLoading) {
    return (
      <html lang="fr">
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-4 text-gray-500">Vérification du compte...</p>
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
            {isAuthenticated ? (
              <SalonChecker>
                {children}
              </SalonChecker>
            ) : null}
            <Toaster position="top-right" />
          </QueryClientProvider>
        </Providers>
      </body>
    </html>
  )
}
