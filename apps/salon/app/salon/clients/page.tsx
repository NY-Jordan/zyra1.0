'use client'

import ClientsManagement from '@/presentation/components/clients/ClientsManagement'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import BookingGate from '@/presentation/components/layout/BookingGate'

export default function ClientsPage() {
  return (
    <ProtectedLayout>
      <BookingGate>
        <ClientsManagement />
      </BookingGate>
    </ProtectedLayout>
  )
}
