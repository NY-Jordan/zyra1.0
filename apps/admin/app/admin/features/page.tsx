'use client'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Plus, Search } from 'lucide-react'
import PageHeader from '@/presentation/components/common/PageHeader'
import FeatureModal from '@/presentation/components/features/FeatureModal'
import FeatureTable from '@/presentation/components/features/FeatureTable'
import Pagination from '@/presentation/components/common/Pagination'
import { useFeaturesUseCases } from '@/usecases/featuresUseCases'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zyra/ui/components/select'
import { FeatureDisplayData } from '@zyra/conf/domain/entities/features.entities'
import { FeatureTypeEnum } from '@zyra/conf/domain/enums/FeatureTypeEnum'
import { useLanguage } from '@/hooks/useLanguage'
import defaultFeatures from '@/data/defaultFeatures'

export default function FeaturesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureDisplayData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | FeatureTypeEnum>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // const { currentLanguage } = useLanguage() // À décommenter quand le provider sera ajouté
  const currentLanguage = 'fr' // Temporaire

  const {
    useFeatures,
    useCreateFeature,
  } = useFeaturesUseCases()

  const { data: featuresResult, isLoading } = useFeatures({
    page: currentPage,
    pageSize,
    searchTerm,
    filterType,
    language: currentLanguage,
  })
  const createFeatureMutation = useCreateFeature()


  const handleView = (featureData: FeatureDisplayData) => {
    setEditingFeature(featureData)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFeature(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setCurrentPage(1)
  }

  const handleImportDefaultFeatures = async () => {
    try {
      for (const feature of defaultFeatures) {
        await createFeatureMutation.mutateAsync({
          key: feature.key,
          type: feature.type as FeatureTypeEnum,
          defaultValue: feature.defaultValue
        })
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
    }
  }

  // Get features and pagination info
  const features = (featuresResult?.data || []) as FeatureDisplayData[]
  const totalPages = featuresResult?.totalPages || 1
  const totalItems = featuresResult?.total || 0

  return (
    <>
      <PageHeader 
        title="Fonctionnalités Disponibles"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Fonctionnalités", isCurrent: true }
        ]}
      />

      <div className="space-y-6">
        {/* Description and Import Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">Consultez les fonctionnalités disponibles pour les salons</p>
          {features.length === 0 && (
            <Button 
              variant="outline"
              onClick={handleImportDefaultFeatures}
              disabled={createFeatureMutation.isPending}
              className="flex items-center gap-2"
            >
              {createFeatureMutation.isPending ? 'Import...' : 'Charger les fonctionnalités'}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: 'all' | FeatureTypeEnum) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de fonctionnalité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value={FeatureTypeEnum.ACCESS}>Accès</SelectItem>
                <SelectItem value={FeatureTypeEnum.LIMIT}>Limite</SelectItem>
                <SelectItem value={FeatureTypeEnum.SETTING}>Paramètre</SelectItem>
                <SelectItem value={FeatureTypeEnum.FEATURE}>Fonctionnalité</SelectItem>
              </SelectContent>
            </Select>

            <div></div>

            <Button
              variant="outline"
              onClick={handleResetFilters}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Table */}
        <FeatureTable
          features={features}
          isLoading={isLoading}
          onView={handleView}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalItems)} sur {totalItems} résultats
            </p>
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Modal */}
        <FeatureModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          feature={editingFeature}
        />
      </div>
    </>
  )
}
