import React from 'react'
import { Badge } from '@zyra/ui/components/badge'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { formatCurrency } from '../PricingSection'

interface PackageDetailsProps {
  pkg: PackageData
  billingPeriod: 'monthly' | 'yearly'
  yearlyDiscount: number
  monthlyPrice: number
  yearlyPrice: number
  currentPrice: number
  totalAmount: number
  currency: string
}

export default function PackageDetails({
  pkg,
  billingPeriod,
  monthlyPrice,
  yearlyPrice,
  currentPrice,
  totalAmount,
  currency
}: PackageDetailsProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <h3 className="font-bold text-lg text-gray-800">{pkg.name}</h3>
        {pkg.popular && (
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1 rounded-full font-semibold shadow-sm">
            ⭐ Populaire
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
          <span className="text-sm text-gray-600">Prix mensuel</span>
          <span className="font-semibold text-gray-800">{formatCurrency(currentPrice, currency)}/mois</span>
        </div>
        {billingPeriod === 'yearly' && (
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700">Total annuel</span>
            <span className="font-semibold text-blue-800">{formatCurrency(yearlyPrice, currency)}/an</span>
          </div>
        )}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <span className="font-medium text-green-800">Montant à payer</span>
          <span className="text-xl font-bold text-green-900">{formatCurrency(totalAmount, currency)}</span>
        </div>
      </div>
    </div>
  )
}
