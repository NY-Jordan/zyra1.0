'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import OrdersManagement from '@/presentation/components/orders/OrdersManagement'
import BookingGate from '@/presentation/components/layout/BookingGate'

export default function OrdersPage() {
  return (
    <ProtectedLayout>
      <BookingGate>
        <OrdersManagement />
      </BookingGate>
    </ProtectedLayout>
  )
}
