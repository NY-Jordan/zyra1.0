'use client'

import SalonChecker from "@/presentation/components/layout/SalonChecker"

export default function SalonLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="overflow-y-auto h-fit">
      <SalonChecker>
        {children}
      </SalonChecker>
    </main>
  )
}
