'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import ReservationsManagement from '@/presentation/components/reservations/ReservationsManagement'
import BookingGate from '@/presentation/components/layout/BookingGate'

export default function ReservationsPage() {
  return (
    <ProtectedLayout>
      <BookingGate>
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Réservations</h1>
            <p className="text-gray-600 dark:text-slate-400">
              Consultez et gérez toutes les réservations de votre salon
            </p>
          </div>
          <ReservationsManagement />
        </div>
      </BookingGate>
    </ProtectedLayout>
  )
}
