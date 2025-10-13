import React, { useMemo } from 'react'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import PackageCard from './PackageCard'
import { BillingPeriod } from '@zyra/conf/domain/entities/subscriptions.entities'

interface PricingSectionProps {
  packages: PackageData[]
  billingPeriod: BillingPeriod
  yearlyDiscount: number
}

export default function PricingSection({
  packages,
  billingPeriod,
  yearlyDiscount
}: PricingSectionProps) {
  // Sort packages to highlight popular ones
  const sortedPackages = useMemo(() => {
    const popular = packages.filter(p => p.popular)
    const others = packages.filter(p => !p.popular)
    return [...others.slice(0, Math.ceil(others.length / 2)), ...popular, ...others.slice(Math.ceil(others.length / 2))]
  }, [packages])

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Nos forfaits
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choisissez le forfait qui vous convient le mieux
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {sortedPackages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              billingPeriod={billingPeriod}
              yearlyDiscount={yearlyDiscount}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Une question ?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Notre équipe est là pour vous aider
            </p>
            <button className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm">
              Nous contacter
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
