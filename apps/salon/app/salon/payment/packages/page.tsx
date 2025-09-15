'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

import HeroSection from '@/presentation/components/packages/HeroSection'
import PricingSection from '@/presentation/components/packages/PricingSection'
import FeaturesSection from '@/presentation/components/packages/FeaturesSection'
import FAQSection from '@/presentation/components/packages/FAQSection'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner'

export default function SalonPackagesPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const auth = getAuth();
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
    <div className="h-screen bg-gradient-to-b from-white to-slate-50 overflow-x-hidden">
      <HeroSection
        billingPeriod={billingPeriod}
        setBillingPeriod={setBillingPeriod}
        yearlyDiscount={yearlyDiscount}
      />
      <PricingSection
        packages={packages}
        billingPeriod={billingPeriod}
        yearlyDiscount={yearlyDiscount}
      />
      <FeaturesSection />
      <FAQSection />
    </div>
  )
}
