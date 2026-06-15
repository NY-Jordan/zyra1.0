'use client'

import { usePathname } from 'next/navigation'
import SalonChecker from "@/presentation/components/layout/SalonChecker"

export default function SalonLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Setup page has its own SetupWrapper guard — skip SalonChecker to avoid redirect loop
  if (pathname === '/salon/setup') {
    return <main className="overflow-y-auto h-fit">{children}</main>
  }

  return (
    <main className="overflow-y-auto h-fit">
      <SalonChecker>
        {children}
      </SalonChecker>
    </main>
  )
}
