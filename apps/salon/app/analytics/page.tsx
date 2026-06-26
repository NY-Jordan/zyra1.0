'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import AnalyticsPage from '@/presentation/components/analytics/AnalyticsPage'
import BookingGate from '@/presentation/components/layout/BookingGate'

export default function Analytics() {
  return (
    <ProtectedLayout>
      <BookingGate>
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <AnalyticsPage />
        </div>
      </BookingGate>
    </ProtectedLayout>
  )
}
