'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import ReservationsManagement from '@/presentation/components/reservations/ReservationsManagement'

export default function ReservationsPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Réservations</h1>
          <p className="text-gray-600">
            Consultez et gérez toutes les réservations de votre salon
          </p>
        </div>
        
        <ReservationsManagement />
      </div>
    </ProtectedLayout>
  )
}
