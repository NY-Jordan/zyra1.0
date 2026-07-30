'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zyra/ui/components/tabs'
import {
  DollarSign,
  Star,
  Scissors,
  Palette
} from 'lucide-react'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import { useSalon } from '@zyra/core/hooks/useSalon'
import CategoriesManagement from '@/presentation/components/services/Categories/CategoriesManagement'
import ServicesManagement from '@/presentation/components/services/ServicesManagement'
import { formatPrice } from '@zyra/conf/lib/utils'

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[20px] font-extrabold text-slate-800 dark:text-white leading-none truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { salon, isLoading } = useSalon()
  const [activeTab, setActiveTab] = useState('categories')

  // fetch salon data
  const categories = salon?.serviceCategories || []
  const services = salon?.services || []

  // Calcul stats
  const activeServices = services.filter(service => service?.isActive !== false)
  const averagePrice = services.length > 0
    ? services.reduce((acc, service) => acc + (service.price || 0), 0) / services.length
    : 0

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestion des Services"
            breadcrumbs={[
              { label: 'Dashboard', href: '/salon' },
              { label: 'Services', isCurrent: true }
            ]}
          />
          <div className="flex items-center justify-center min-h-96">
            <div className="text-[13px] text-slate-400">Chargement...</div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!salon) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestion des Services"
            breadcrumbs={[
              { label: 'Dashboard', href: '/salon' },
              { label: 'Services', isCurrent: true }
            ]}
          />
          <div className="flex items-center justify-center min-h-96">
            <div className="text-[13px] text-slate-400">Aucun salon trouvé</div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestion des Services"
          breadcrumbs={[
            { label: 'Dashboard', href: '/salon' },
            { label: 'Services', isCurrent: true }
          ]}
        />

        <div className="space-y-5">
          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              icon={<Palette className="h-5 w-5" />} label="Catégories"
              value={categories.length}
              bg="bg-[#F2EDFE] dark:bg-violet-950/20" iconColor="text-violet-600"
            />
            <KpiCard
              icon={<Scissors className="h-5 w-5" />} label="Services"
              value={services.length}
              bg="bg-[#ECF6FE] dark:bg-sky-950/20" iconColor="text-sky-600"
            />
            <KpiCard
              icon={<Star className="h-5 w-5" />} label="Services Actifs"
              value={activeServices.length}
              bg="bg-[#EEF8F0] dark:bg-emerald-950/20" iconColor="text-emerald-600"
            />
            <KpiCard
              icon={<DollarSign className="h-5 w-5" />} label="Prix Moyen"
              value={formatPrice(averagePrice, 'XAF')}
              bg="bg-[#FDF3E3] dark:bg-amber-950/20" iconColor="text-amber-600"
            />
          </div>

          {/* Tabs pour Catégories et Services */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="grid w-full grid-cols-2 bg-[#F8F4F0] dark:bg-slate-800/50 rounded-xl p-1 h-auto">
              <TabsTrigger
                value="categories"
                className="rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm"
              >
                Catégories
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm"
              >
                Services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <CategoriesManagement
                categories={categories}
                services={services}
              />
            </TabsContent>

            <TabsContent value="services">
              <ServicesManagement
                services={services}
                categories={categories}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  )
}