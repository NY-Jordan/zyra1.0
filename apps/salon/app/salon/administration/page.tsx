'use client'

import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import AdministrationManagement from '@/presentation/components/administration/AdministrationManagement'

export default function AdministrationPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-6">
        <AdministrationManagement />
      </div>
    </ProtectedLayout>
  )
}
