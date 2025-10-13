import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, Star, Zap, Crown } from 'lucide-react'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'
import PaymentModal from './PaymentModal'
import { formatPrice } from '@zyra/conf/lib/utils'
import { BillingPeriod } from '@zyra/conf/domain/entities/subscriptions.entities'

interface PackageCardProps {
  pkg: PackageData
  billingPeriod: BillingPeriod
  yearlyDiscount: number
  index: number
}

export default function PackageCard({
  pkg,
  billingPeriod,
  yearlyDiscount,
  index
}: PackageCardProps) {
  const router = useRouter()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const isPopular = Boolean(pkg.popular)
  const monthlyPrice = pkg.price
  const yearlyPrice = Math.round(monthlyPrice * 12 * (1 - yearlyDiscount/100))
  const currentPrice = billingPeriod === 'yearly' ? yearlyPrice / 12 : monthlyPrice
  const currency = pkg.currency || 'EUR'
  const owner = auth.currentUser

  // Define card themes
  const getCardTheme = () => {
    if (isPopular) {
      return {
        gradient: 'from-blue-400 to-purple-400',
        bg: 'bg-white',
        border: 'border-2 border-blue-200',
        shadow: 'shadow-md hover:shadow-lg',
        icon: Crown,
        badge: '⭐ Populaire'
      }
    }
    return {
      gradient: 'from-gray-400 to-gray-500',
      bg: 'bg-white',
      border: 'border border-gray-200',
      shadow: 'shadow-sm hover:shadow-md',
      icon: index === 0 ? Star : Zap,
      badge: index === 0 ? 'Starter' : 'Pro'
    }
  }

  const theme = getCardTheme()
  const Icon = theme.icon

  const handleSelectPackage = () => {
    if (!owner) {
      toast.error("Vous devez être connecté pour sélectionner un forfait.")
      router.push('/auth/login')
      return
    }
    setIsPaymentModalOpen(true)
  }

  return (
    <div 
      className={`relative group transition-all duration-300 ${isHovered ? 'scale-102' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className={`
        bg-white ${theme.border} ${theme.shadow}
        rounded-2xl overflow-hidden transition-all duration-300
        ${isPopular ? 'ring-2 ring-blue-200' : ''}
      `}>
        
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-0 left-0 right-0">
            <div className={`bg-gradient-to-r ${theme.gradient} text-white text-center py-2 text-sm font-medium`}>
              {theme.badge}
            </div>
          </div>
        )}

        <div className={`p-6 ${isPopular ? 'pt-12' : 'pt-6'}`}>
          {/* Package Header */}
          <div className="text-center mb-6">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${theme.gradient} flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-1">{pkg.name}</h3>
            <p className="text-gray-500 text-sm">Pour votre salon</p>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="flex items-end justify-center mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice, currency).split(',')[0]}
              </span>
              <span className="text-lg text-gray-500 ml-1">/mois</span>
            </div>
            {billingPeriod === 'yearly' && (
              <div className="space-y-1">
                <p className="text-sm text-green-600 font-medium">
                  Facturé {formatPrice(yearlyPrice, currency)}/an
                </p>
                <p className="text-xs text-amber-600">
                  Économisez {formatPrice(Math.round(monthlyPrice * 12 - yearlyPrice), currency)} par an
                </p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSelectPackage}
            className={`
              w-full py-3 px-4 rounded-xl font-medium transition-all duration-200
              ${isPopular 
                ? `bg-gradient-to-r ${theme.gradient} text-white hover:shadow-md` 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              flex items-center justify-center gap-2
            `}
          >
            Choisir ce forfait
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Features List */}
        <div className="px-6 pb-6">
          <div className="border-t border-gray-100 pt-6">
            <h4 className="font-medium text-gray-800 mb-3 text-center text-sm">
              Fonctionnalités incluses
            </h4>
            <ul className="space-y-2">
              {(pkg.features || []).slice(0, 6).map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center`}>
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            {(pkg.features || []).length > 6 && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                + {(pkg.features || []).length - 6} autres fonctionnalités
              </p>
            )}
          </div>
        </div>

        {/* Hover Effect Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl pointer-events-none" />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        pkg={pkg}
        billingPeriod={billingPeriod}
        yearlyDiscount={yearlyDiscount}
      />
    </div>
  )
}
