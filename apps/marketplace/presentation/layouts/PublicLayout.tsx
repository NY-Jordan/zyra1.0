"use client"
import React, { useLayoutEffect } from "react"
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth"

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
    <div className="min-h-screen w-full bg-background">
      <main className="min-h-screen w-full">
        {children}
      </main>
    </div>
  )
}