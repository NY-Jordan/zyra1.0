'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import OrdersManagement from '@/presentation/components/orders/OrdersManagement'

export default function OrdersPage() {
  return (
    <ProtectedLayout>
      
        <OrdersManagement />
    </ProtectedLayout>
  )
}
