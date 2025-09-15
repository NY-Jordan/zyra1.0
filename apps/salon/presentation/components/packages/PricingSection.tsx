import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { Check, ArrowRight } from 'lucide-react'
import PackageCard from './PackageCard'
import { formatPrice } from '@zyra/conf/lib/utils'

interface PricingSectionProps {
  packages: PackageData[]
  billingPeriod: 'monthly' | 'yearly'
  yearlyDiscount: number
}

// Helper function for currency formatting
export const formatCurrency = (amount: number, currency: string = 'EUR') => {
  const displayAmount = formatPrice(Number(amount), currency)
    return displayAmount;
}

export default function PricingSection({
  packages,
  billingPeriod,
  yearlyDiscount
}: PricingSectionProps) {
  // Sort packages to highlight popular ones
  const sorted = useMemo(() => {
    const popular = packages.filter(p => p.popular)
    const others = packages.filter(p => !p.popular)
    return [...others.slice(0, Math.ceil(others.length / 2)), ...popular, ...others.slice(Math.ceil(others.length / 2))]
  }, [packages])

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          {sorted.map((pkg, idx) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              billingPeriod={billingPeriod}
              yearlyDiscount={yearlyDiscount}
            />
          ))}
        </div>
      </div>
    </section>
  )
}