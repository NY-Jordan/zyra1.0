'use client'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import React, { useState } from 'react'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import GeneralConfigs from '@/presentation/components/settings/GeneralConfigs'
import SalonConfigs from '@/presentation/components/settings/SalonConfigs'
import Categories from '@/presentation/components/settings/Categories'
import Countries from '@/presentation/components/settings/Countries'

export default function Index() {
 

  return (
    <ProtectedLayout pageTitle='Paramètres' breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Paramètres", isCurrent: true }
    ]}>
      <div className=" mx-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration Globale */}
        <GeneralConfigs />

        {/* Gestion des salons */}
       <SalonConfigs />
      </div>
      <Categories />
      <Countries />
    </ProtectedLayout>
  )
}
