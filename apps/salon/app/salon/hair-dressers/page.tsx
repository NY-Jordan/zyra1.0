'use client'

import React from 'react'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import HairDressersManagement from '@/presentation/components/hairdressers/HairDressersManagement'

export default function HairDressersPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Coiffeurs</h1>
          <p className="text-gray-600 dark:text-slate-400">
            Gérez votre équipe de coiffeurs, leurs spécialités et leurs performances
          </p>
        </div>
        
        <HairDressersManagement />
      </div>
    </ProtectedLayout>
  )
}
