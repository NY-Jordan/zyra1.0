'use client'
import React, { useEffect, useLayoutEffect } from "react"
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { Toaster } from "@zyra/ui/components/sonner"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useLayoutEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/")
      }
    })
    return () => unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <main className="w-full max-w-md mx-auto p-6">
        {children}
      </main>
    </div>
  )
}