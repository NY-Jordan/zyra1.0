import React from 'react'

interface HeroSectionProps {
  billingPeriod: 'monthly' | 'yearly'
  setBillingPeriod: (period: 'monthly' | 'yearly') => void
  yearlyDiscount: number
}

export default function HeroSection({ 
  billingPeriod, 
  setBillingPeriod,
  yearlyDiscount 
}: HeroSectionProps) {
  return (
    <section className="relative py-10 sm:py-16 md:py-20 overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.1),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_30%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-700">
            Forfaits pour Votre Salon
          </h1>
          <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 px-2">
            Des solutions complètes pour développer votre activité
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 md:mt-10 inline-flex items-center bg-white rounded-full p-1 sm:p-1.5 shadow-lg border border-slate-100">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === 'monthly' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Annuel</span>
              <span className="absolute -top-3 -right-3 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full ring-2 ring-white">
                -{yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}