'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Scissors, Loader2, ArrowLeft } from 'lucide-react'

import { SalonHeader } from './components/SalonHeader'
import { SalonGallery } from './components/SalonGallery'
import { SalonServices } from './components/SalonServices'
import { SalonTeam } from './components/SalonTeam'
import { SalonReviews } from './components/SalonReviews'
import { SalonSidebar } from './components/SalonSidebar'

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

  if (loadingSalon || loadingHairdressers) {
    return (
      <div className="min-h-screen bg-[#F8F4F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        </div>
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-[#F8F4F0] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[16px] font-semibold text-slate-600">Salon introuvable</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F4F0]">
      <SalonHeader
        salonName={salon.name}
        salonCity={salon.city}
        rating={4.8}
        reviewCount={128}
        onBack={() => router.back()}
      />

      {/* Hero banner */}
      {(salon.photos as string[] || []).length > 0 ? (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={(salon.photos as string[])[0]}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-[22px] sm:text-[28px] font-extrabold text-white drop-shadow-md">{salon.name}</h1>
            <p className="text-[13px] text-white/80 mt-0.5">{salon.city}</p>
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-end px-6 pb-4">
          <div>
            <h1 className="text-[22px] font-extrabold text-white">{salon.name}</h1>
            <p className="text-[13px] text-white/80">{salon.city}</p>
          </div>
        </div>
      )}

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-sm border-t border-[#F0EAE4]">
        <button
          onClick={() => window.location.href = `/booking/${salon.id}`}
          className="w-full h-12 rounded-2xl text-[14px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Réserver une visite
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {salon.description && (
              <div className="bg-white rounded-2xl border border-[#F0EAE4] p-5">
                <p className="text-[14px] text-slate-600 leading-relaxed">{salon.description}</p>
              </div>
            )}

            {/* Gallery */}
            <div className="bg-white rounded-2xl border border-[#F0EAE4] p-5">
              <SalonGallery photos={salon.photos as string[] || []} />
            </div>

            {/* Services */}
            {salon.serviceCategories && salon.serviceCategories.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#F0EAE4] p-5">
                <SalonServices
                  salonId={salon.id}
                  serviceCategories={salon.serviceCategories}
                  services={salon.services || []}
                />
              </div>
            )}

            {/* Team */}
            {hairdressers.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#F0EAE4] p-5">
                <SalonTeam hairdressers={hairdressers} />
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-[#F0EAE4] p-5">
              <SalonReviews />
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <SalonSidebar salon={salon} />
          </div>
        </div>
      </div>
    </div>
  )
}
