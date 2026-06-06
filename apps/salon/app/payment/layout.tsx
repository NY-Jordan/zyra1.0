'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@zyra/conf/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import SalonChecker from "@/presentation/components/layout/SalonChecker"

export default function PaymentLayout({
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600" />
          <p className="mt-4 text-gray-500 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <SalonChecker>{children}</SalonChecker>
  ) : null;
}
