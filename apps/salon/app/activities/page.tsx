'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import BookingGate from '@/presentation/components/layout/BookingGate'
import ActivitiesPage from '@/presentation/components/activities/ActivitiesPage'

export default function Activities() {
  return (
    <ProtectedLayout>
      <BookingGate>
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <ActivitiesPage />
        </div>
      </BookingGate>
    </ProtectedLayout>
  )
}
