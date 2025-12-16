'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@zyra/ui/components/button'
import { Scissors, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <div className="inline-block p-4 bg-blue-100 rounded-full">
            <Scissors className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Bienvenue
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Découvrez les meilleurs salons de coiffure et réservez votre créneau en quelques clics
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/booking/salon-id')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg gap-2"
          >
            Commencer une réservation
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-600">
            Accédez à la galerie complète de nos salons
          </p>
        </div>
      </div>
    </div>
  )
}

