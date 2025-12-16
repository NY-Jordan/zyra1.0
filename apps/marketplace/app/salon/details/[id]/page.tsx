'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Button } from '@zyra/ui/components/button'
import { Loader2 } from 'lucide-react'

// Import Components
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
  // Fetch salon details
  const { data: salon, isLoading: loadingSalon } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: async () => {
      const salons = await fetchCollection('salons', [where('id', '==', salonId)])
      return salons[0] as ISalon
    },
    enabled: !!salonId,
  })

  // Fetch hairdressers for this salon
  const { data: hairdressers = [], isLoading: loadingHairdressers } = useQuery({
    queryKey: ['salon-hairdressers', salonId],
    queryFn: async () => {
      if (!salonId) return []
      const associations = await fetchAllSubCollections(
        'hair_dressers_salons_associations',
        [where('salonId', '==', salonId), where('active', '==', true)]
      )

      if (associations.length === 0) return []

      const hairdresserPromises = (associations as any[]).map(async (assoc) => {
        const result = await fetchCollection('hair_dressers', [
          where('id', '==', assoc.parentId),
        ])
        return result[0] as IHairDresser
      })

      const results = await Promise.all(hairdresserPromises)
      return results.filter((h) => h)
    },
    enabled: !!salonId,
  })

  if (loadingSalon || loadingHairdressers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            ← Retour
          </Button>
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Salon non trouvé</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <SalonHeader
        salonName={salon.name}
        salonCity={salon.city}
        rating={4.0}
        reviewCount={128}
        onBack={() => router.back()}
      />

     

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-10 lg:space-y-12">
              {/* Gallery Section */}
              <SalonGallery photos={salon.photos as string[] || []} />

              {/* Description */}
              <section>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-balance">
                  {salon.description}
                </p>
              </section>

              {/* Services Section */}
              {salon.serviceCategories && salon.serviceCategories.length > 0 && (
                <SalonServices
                  salonId={salon.id}
                  serviceCategories={salon.serviceCategories}
                  services={salon.services || []}
                />
              )}

              {/* Team Section */}
              {hairdressers.length > 0 && <SalonTeam hairdressers={hairdressers} />}

              {/* Reviews Section */}
              <SalonReviews />
            </div>

            {/* Sidebar */}
            <SalonSidebar salon={salon} />
          </div>
        </div>
      </div>
    </div>
  )
}
