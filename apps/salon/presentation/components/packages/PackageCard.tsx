import React from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { formatCurrency } from './PricingSection'

interface PackageCardProps {
  pkg: PackageData
  billingPeriod: 'monthly' | 'yearly'
  yearlyDiscount: number
}

export default function PackageCard({ 
  pkg, 
  billingPeriod,
  yearlyDiscount
}: PackageCardProps) {
  const router = useRouter()
  const isPopular = Boolean(pkg.popular)
  const monthlyPrice = pkg.price
  const yearlyPrice = Math.round(monthlyPrice * 12 * (1 - yearlyDiscount/100))
  const currentPrice = billingPeriod === 'yearly' ? yearlyPrice / 12 : monthlyPrice
  const currency = pkg.currency || 'EUR'
  
  return (
    <div
      className={`relative rounded-2xl ${
        isPopular 
          ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-100 ring-4 ring-emerald-50' 
          : 'bg-white border border-slate-200 shadow-md'
      } overflow-hidden transition-all duration-300 hover:shadow-lg`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-0 left-0 right-0">
          <div className="bg-emerald-600 text-white text-center py-1.5 text-xs font-semibold tracking-wide uppercase shadow-sm">
            Recommandé
          </div>
        </div>
      )}

      <div className={`p-6 sm:p-8 ${isPopular ? 'pt-10 sm:pt-12' : 'pt-6 sm:pt-8'}`}>
        {/* Package name and description */}
        <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
{/*         <p className="mt-2 text-sm text-slate-500 min-h-[3rem]">{pkg.description}</p>
 */}        {/* Price */}
        <div className="mt-6">
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              {formatCurrency(currentPrice, currency)}
            </span>
            <span className="ml-1 text-lg sm:text-xl font-medium text-gray-500">/mois</span>
          </div>
          {billingPeriod === 'yearly' && (
            <p className="mt-1 text-sm text-emerald-600">
              Facturation annuelle ({formatCurrency(yearlyPrice, currency)}/an)
            </p>
          )}
          {billingPeriod === 'yearly' && (
            <p className="mt-1 text-sm font-medium text-amber-600">
              Économisez {formatCurrency(Math.round(monthlyPrice * 12 - yearlyPrice), currency)} par an
            </p>
          )}
        </div>
        {/* CTA Button - Made more touch-friendly */}
        <div className="mt-6">
          <button
            onClick={() => router.push(`/salon/payment/checkout/${pkg.id}?billing=${billingPeriod}`)}
            className={`w-full inline-flex items-center justify-center px-5 py-3 sm:py-4 rounded-lg text-base font-medium transition-colors ${
              isPopular 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                : 'bg-slate-800 text-white hover:bg-slate-900'
            }`}
          >
            Sélectionner
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Features list */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <div className="pt-4 sm:pt-6 pb-2">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Fonctionnalités incluses
          </h4>
        </div>
        
        <ul className="mt-2 space-y-3 sm:space-y-4">
          {(pkg.features || []).map((feature: string, i: number) => (
            <li key={i} className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="ml-3 text-sm text-gray-700">
                {feature}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}