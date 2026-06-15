"use client"
import React, { useEffect } from "react"
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      /* if (user) {
        router.replace("/")
      } */
    })
    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="min-h-screen w-full">
        {children}
      </main>
    </div>
  )
}