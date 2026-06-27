'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Scissors, Loader2, ArrowLeft, Star, Share, Heart, ChevronRight } from 'lucide-react'

import { SalonGallery } from './components/SalonGallery'
import { SalonServices } from './components/SalonServices'
import { SalonTeam } from './components/SalonTeam'
import { SalonReviews } from './components/SalonReviews'
import { SalonSidebar } from './components/SalonSidebar'
import { SalonLocation } from './components/SalonLocation'
import { SalonFooter } from './components/SalonFooter'

export default function SalonDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.id as string

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
        <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
            <Scissors className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-[15px] font-semibold text-gray-900">Salon introuvable</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>
      </div>
    )
  }

  const photos = (salon.photos as string[]) || []
  const today = salon.openingHours?.find(h => h.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  const fullAddress = [salon.address, salon.city, salon.country].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Top nav ===== */}
      <header className="border-b border-gray-100">
        <div className="max-w-[1420px] mx-auto px-5 sm:px-6 h-[60px] flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-[22px] font-extrabold tracking-tight text-gray-900 lowercase">
            zyra
          </button>
        </div>
      </header>

      <main className="max-w-[1420px] mx-auto px-5 sm:px-6 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-4 flex-wrap">
          <button onClick={() => router.push('/')} className="hover:text-gray-600">Accueil</button>
          <ChevronRight className="h-3 w-3" />
          <span>Salon de coiffure</span>
          {salon.city && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{salon.city}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-600 font-medium">{salon.name}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight text-gray-900 leading-[1.05]">
              {salon.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-[14px]">
              <span className="font-bold text-gray-900">4,7</span>
              <span className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/40 text-amber-400'}`} />
                ))}
              </span>
              <span className="font-semibold text-gray-900">(151)</span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold text-emerald-600">Ouvert</span>
              {today?.openDay && <span className="text-gray-500">jusqu'à {today.close}</span>}
              {salon.city && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">{salon.city}{salon.country ? `, ${salon.country}` : ''}</span>
                </>
              )}
              {fullAddress && (
                <button
                  onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(fullAddress)}`, '_blank')}
                  className="font-semibold text-violet-600 hover:underline"
                >
                  Afficher l'itinéraire
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Share className="h-4 w-4 text-gray-700" />
            </button>
            <button className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors group">
              <Heart className="h-4 w-4 text-gray-700 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Gallery */}
        {photos.length > 0 && <SalonGallery photos={photos} />}

        {/* Two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 mt-10">
          {/* Left */}
          <div className="min-w-0 space-y-12">
            {salon.serviceCategories && salon.serviceCategories.length > 0 && (
              <SalonServices
                salonId={salon.id}
                serviceCategories={salon.serviceCategories}
                services={salon.services || []}
              />
            )}

            {salon.description && (
              <section>
                <h2 className="text-[26px] font-extrabold tracking-tight text-gray-900 mb-3">À propos</h2>
                <p className="text-[15px] text-gray-600 leading-relaxed line-clamp-5">{salon.description}</p>
              </section>
            )}

            {hairdressers.length > 0 && <SalonTeam hairdressers={hairdressers} />}

            <SalonReviews />

            <SalonLocation salon={salon} />
          </div>

          {/* Right sticky sidebar */}
          <div className="hidden lg:block">
            <SalonSidebar salon={salon} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <SalonFooter salon={salon} />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-3 bg-white border-t border-gray-200">
        <button
          onClick={goToBooking}
          className="w-full py-3.5 rounded-full text-[15px] font-bold text-white bg-gray-900 hover:bg-gray-800 active:scale-[0.99] transition-all"
        >
          Réserver
        </button>
      </div>
    </div>
  )
}
