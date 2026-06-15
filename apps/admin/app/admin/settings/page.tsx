'use client'
import React from 'react'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import PageHeader from '@/presentation/components/common/PageHeader'
import GeneralConfigs from '@/presentation/components/settings/GeneralConfigs'
import SalonConfigs from '@/presentation/components/settings/SalonConfigs'
import Categories from '@/presentation/components/settings/Categories'
import Countries from '@/presentation/components/settings/Countries'

export default function Index() {
  return (
    <>
      <PageHeader 
        title="Paramètres"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Paramètres", isCurrent: true }
        ]}
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Configuration Globale */}
          <GeneralConfigs />

          {/* Gestion des salons */}
          <SalonConfigs />
        </div>
        
        <Categories />
        <Countries />
      </div>
    </>
  )
}
