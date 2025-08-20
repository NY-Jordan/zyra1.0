'use client'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Plus, Search } from 'lucide-react'
import PackageModal from '@/presentation/components/packages/PackageModal'
import PackageTable from '@/presentation/components/packages/PackageTable'
import ConfirmModal from '@/presentation/components/CofirmModal'
import Pagination from '@/presentation/components/common/Pagination'
import { usePackagesUseCases } from '../../usecases/packagesUseCases'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zyra/ui/components/select'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'

export default function PackagesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'salon' | 'client'>('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<{ id: string; name: string } | null>(null)

  const {
    usePackages,
    useCountries,
    useDeletePackage,
  } = usePackagesUseCases()

  const { data: packagesResult, isLoading } = usePackages({
    page: currentPage,
    pageSize,
    searchTerm,
    filterType,
    filterCountry: filterCountry
  })
  const { data: countries = [] } = useCountries()
  const deletePackageMutation = useDeletePackage()

  const handleEdit = (packageData: PackageData) => {
    setEditingPackage(packageData)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const packageData = packagesResult?.data.find((pkg: any) => pkg.id === id)
    if (packageData) {
      setPackageToDelete({ id, name: packageData.name })
      setDeleteConfirmOpen(true)
    }
  }

  const handleConfirmDelete = () => {
    if (packageToDelete) {
      deletePackageMutation.mutate(packageToDelete.id)
      setDeleteConfirmOpen(false)
      setPackageToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setPackageToDelete(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPackage(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterCountry('all')
    setCurrentPage(1)
  }

  // Get packages and pagination info
  const packages = packagesResult?.data || []
  const totalPages = packagesResult?.totalPages || 1
  const totalItems = packagesResult?.total || 0

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Forfaits</h1>
            <p className="text-gray-600">Gérez les forfaits pour les salons et clients</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Nouveau forfait
          </Button>
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
            
            <Select value={filterType} onValueChange={(value: 'all' | 'salon' | 'client') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de forfait" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="salon">Salon</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {countries.map((country: any) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleResetFilters}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Table */}
        <PackageTable
          packages={packages}
          countries={countries}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
        <PackageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          package={editingPackage}
          countries={countries}
        />

        {/* Confirm Delete Modal */}
        <ConfirmModal
          open={deleteConfirmOpen}
          title="Supprimer le forfait"
          description={
            <span>
              Êtes-vous sûr de vouloir supprimer le forfait{' '}
              <strong>{packageToDelete?.name}</strong> ?<br />
              Cette action est irréversible.
            </span>
          }
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          confirmLabel="Supprimer"
          confirmVariant="destructive"
          loading={deletePackageMutation.isPending}
        />
      </div>
    </ProtectedLayout>
  )
}
