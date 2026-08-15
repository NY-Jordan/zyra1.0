'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Scissors, Loader2, ArrowLeft, Share, Heart, ChevronRight } from 'lucide-react'
import { SalonGallery } from './components/SalonGallery'
import { SalonServices } from './components/SalonServices'
import { SalonTeam } from './components/SalonTeam'
import { SalonSidebar } from './components/SalonSidebar'
import { SalonLocation } from './components/SalonLocation'
import { SalonFooter } from './components/SalonFooter'
import { useSalonDetailsLocale } from './i18n'

export default function SalonDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.id as string
  const { t } = useSalonDetailsLocale()

  const { data: salon, isLoading: loadingSalon } = useQuery({
    queryKey: ['salon-detail', salonId],
    queryFn: async () => {
      const salons = await fetchCollection('salons', [where('id', '==', salonId)])
      return salons[0] as ISalon
    },
    enabled: !!salonId,
  })

  const { data: hairdressers = [], isLoading: loadingHairdressers } = useQuery({
    queryKey: ['salon-hairdressers-public', salonId],
    queryFn: async () => {
      if (!salonId) return []
      const associations = await fetchAllSubCollections(
        'hair_dressers_salons_associations',
        [where('salonId', '==', salonId), where('active', '==', true)]
      )
      if (associations.length === 0) return []
      const results = await Promise.all(
        (associations as any[]).map(async assoc => {
          const res = await fetchCollection('hair_dressers', [where('id', '==', assoc.parentId)])
          return res[0] as IHairDresser
        })
      )
      return results.filter(Boolean)
    },
    enabled: !!salonId,
  })

  const goToBooking = () => { if (salon) window.location.href = `/booking/${salon.id}` }

  if (loadingSalon || loadingHairdressers) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Scissors className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-900">{t.notFound.title}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> {t.notFound.back}
          </button>
        </div>
      </div>
    )
  }

  const photos = (salon.photos as string[]) || []
  const today = salon.openingHours?.find(h => h.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  const fullAddress = [salon.address, salon.city, salon.country].filter(Boolean).join(', ')

  return (
    <div
      className="salon-detail min-h-screen bg-white"
      style={{ fontFamily: 'var(--font-sans), ui-sans-serif, sans-serif' }}
    >
      {/* ===== Top nav ===== */}
      <header className="border-b border-slate-100">
        <div className="max-w-[1420px] mx-auto px-5 sm:px-6 h-[60px] flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center">
            <img src="/images/full-logo-light.png" alt="Zyraa" className="h-[17px] w-auto" />
          </button>
        </div>
      </header>

      <main className="max-w-[1420px] mx-auto px-5 sm:px-6 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-4 flex-wrap">
          <button onClick={() => router.push('/')} className="hover:text-slate-600">{t.breadcrumb.home}</button>
          <ChevronRight className="h-3 w-3" />
          <span>{t.breadcrumb.category}</span>
          {salon.city && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{salon.city}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600 font-medium">{salon.name}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-slate-900">
              {salon.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-[14px]">
              <span className="font-semibold text-emerald-600">{t.status.open}</span>
              {today?.openDay && <span className="text-slate-500">{t.status.until} {today.close}</span>}
              {salon.city && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{salon.city}{salon.country ? `, ${salon.country}` : ''}</span>
                </>
              )}
              {fullAddress && (
                <button
                  onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(fullAddress)}`, '_blank')}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  {t.actions.showDirections}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <Share className="h-4 w-4 text-slate-700" />
            </button>
            <button className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors group">
              <Heart className="h-4 w-4 text-slate-700 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Gallery */}
        {photos.length > 0 && <SalonGallery photos={photos} t={t.gallery} />}

        {/* Two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 mt-10">
          {/* Left */}
          <div className="min-w-0 space-y-12">
            {salon.serviceCategories && salon.serviceCategories.length > 0 && (
              <SalonServices
                salonId={salon.id}
                serviceCategories={salon.serviceCategories}
                services={salon.services || []}
                t={t.services}
              />
            )}

            {salon.description && (
              <section>
                <h2 className="text-slate-900 mb-3">{t.about.title}</h2>
                <p className="text-[18px] text-slate-600 leading-relaxed line-clamp-5">{salon.description}</p>
              </section>
            )}

            {hairdressers.length > 0 && <SalonTeam hairdressers={hairdressers} title={t.team.title} />}

            <SalonLocation salon={salon} t={t.location} />
          </div>

          {/* Right sticky sidebar */}
          <div className="hidden lg:block">
            <SalonSidebar
              salon={salon}
              t={t.status}
              bookLabel={t.actions.book}
              directionsLabel={t.actions.showDirections}
              days={t.days}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <SalonFooter salon={salon} t={t.footer} />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-3 bg-white border-t border-slate-200">
        <button
          onClick={goToBooking}
          className="w-full py-3.5 rounded-full text-[15px] font-bold text-white bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.99] transition-all"
        >
          {t.actions.book}
        </button>
      </div>
    </div>
  )
}
