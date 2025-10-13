'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'


import PricingSection from '@/presentation/components/packages/PricingSection'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner'
import { BillingPeriod } from '@zyra/conf/domain/entities/subscriptions.entities'

export default function SalonPackagesPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(BillingPeriod.MONTHLY)
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['salon-packages'],
    queryFn: async () => {
      const result = await fetchCollection('packages', [
        where('type', '==', 'salon'),
        where('active', '==', true)
      ])
      return (result as PackageData[]) || []
    }
  })

  if (isLoading) {
    return <LoadingSpinner message="Chargement des forfaits..." />
  }

  const yearlyDiscount = 20 // percentage

  return (
    <main className="h-screen bg-white text-gray-900 overflow-y-scroll">
      {/* Simple Header */}
      <header className="py-12 border-b border-gray-200 text-center bg-white">
        <h1 className="text-3xl font-bold mb-2">Forfaits salons</h1>
        <p className="text-gray-500">Choisissez le forfait qui correspond à votre activité</p>
      </header>

      {/* Pricing Section */}
      <section className="py-12">
        <PricingSection
          packages={packages}
          billingPeriod={billingPeriod}
          yearlyDiscount={yearlyDiscount}
        />
      </section>
    </main>
  )
}
