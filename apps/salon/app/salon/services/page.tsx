'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zyra/ui/components/tabs'
import { 
  DollarSign,
  Star,
  Scissors,
  Palette
} from 'lucide-react'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import { useSalon } from '@/hooks/useSalon'
import CategoriesManagement from '@/presentation/components/services/Categories/CategoriesManagement'
import ServicesManagement from '@/presentation/components/services/ServicesManagement'
import { formatPrice } from '@zyra/conf/lib/utils'

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
            <div className="text-muted-foreground">Chargement...</div>
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
            <div className="text-muted-foreground">Aucun salon trouvé</div>
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

        <div className="space-y-6">
          {/* En-tête avec statistiques */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Catégories</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                  </div>
                  <Scissors className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Services Actifs</p>
                    <p className="text-2xl font-bold">{activeServices.length}</p>
                  </div>
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prix Moyen</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(averagePrice, 'XAF')}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs pour Catégories et Services */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
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