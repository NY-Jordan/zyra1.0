// filepath: /home/yvan/PROJECTS/zyra/apps/salon/presentation/components/services/CategoriesManagement.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Badge } from '@zyra/ui/components/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MoreHorizontal,
  Eye,
  Users,
  Palette,
  RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { useServiceCategories } from '@/usecases/useServiceCategories'
import CreateCategoryModal from './CreateCategoryModal'
import ConfirmModal from '../../../../../admin/presentation/components/CofirmModal'
import UpdateCategoryModal from './UpdateCategoryModal'
import { ISalonService, IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'
import { toast } from 'sonner'
import Pagination from '../../common/Pagination'

interface CategoriesManagementProps {
  categories: IServiceCategory[]
  services: ISalonService[]
}

export default function CategoriesManagement({ categories, services }: CategoriesManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5
  
  // Nouvel état pour le modal de mise à jour
  const [updateModal, setUpdateModal] = useState<{
    open: boolean
    category: IServiceCategory | null
  }>({
    open: false,
    category: null
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    categoryId: string | null
    categoryName: string
  }>({
    open: false,
    categoryId: null,
    categoryName: ''
  })

  const { toggleActive, deleteCategory, isToggling, isDeleting } = useServiceCategories()

  // Filtrage et pagination des données
  const filteredCategories = React.useMemo(() => {
    const filtered = categories.filter(category =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const startIndex = (page - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    const paginatedCategories = filtered.slice(startIndex, endIndex)
    return {
      categories: paginatedCategories,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / PAGE_SIZE)
    }
  }, [categories, searchTerm, page])

  // Réinitialiser la page quand le terme de recherche change
  React.useEffect(() => {
    setPage(1)
  }, [searchTerm])

  // Fonction pour compter les services par catégorie
  const getServicesCountByCategory = (categoryId: string) => {
    return services.filter(service => service.categoryId === categoryId).length
  }

  const handleToggleActive = (category: any) => {
    toggleActive(category)
  }

  const handleDeleteClick = (category: any) => {
    setDeleteModal({
      open: true,
      categoryId: category.id,
      categoryName: category.name
    })
  }

  const handleConfirmDelete = () => {
    if (deleteModal.categoryId) {
      const servicesCount = getServicesCountByCategory(deleteModal.categoryId)
      // Vérification si des services sont liés à cette catégorie
      if (servicesCount > 0) {
        toast.error(
          `Impossible de supprimer la catégorie "${deleteModal.categoryName}"`,
          {
            description: `Cette catégorie contient ${servicesCount} service${servicesCount > 1 ? 's' : ''}. Veuillez d'abord supprimer ou déplacer les services avant de supprimer la catégorie.`,
            duration: 5000,
          }
        )
        // close modal
        setDeleteModal({
          open: false,
          categoryId: null,
          categoryName: ''
        })
        return
      }
      deleteCategory(deleteModal.categoryId)
      setDeleteModal({
        open: false,
        categoryId: null,
        categoryName: ''
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteModal({
      open: false,
      categoryId: null,
      categoryName: ''
    })
  }

  const getDeleteDescription = () => {
    if (!deleteModal.categoryId) return ''
    const servicesCount = getServicesCountByCategory(deleteModal.categoryId)
    if (servicesCount > 0) {
      return (
        <div className="space-y-2">
          <p>Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{deleteModal.categoryName}"</strong> ?</p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Attention :</strong> Cette catégorie contient {servicesCount} service{servicesCount > 1 ? 's' : ''}. 
              La suppression sera bloquée tant que des services y sont rattachés.
            </p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>Conseil :</strong> Supprimez d'abord les services liés ou déplacez-les vers une autre catégorie.
            </p>
          </div>
        </div>
      )
    }
    return `Êtes-vous sûr de vouloir supprimer la catégorie "${deleteModal.categoryName}" ? Cette action est irréversible.`
  }

  // Nouvelle fonction pour ouvrir le modal de mise à jour
  const handleEditClick = (category: IServiceCategory) => {
    setUpdateModal({
      open: true,
      category: category
    })
  }

  // Fonction pour fermer le modal de mise à jour
  const handleUpdateModalClose = () => {
    setUpdateModal({
      open: false,
      category: null
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Catégories de Services ({filteredCategories.total})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Catégorie
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Services</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 font-medium">Date Création</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.categories.map((category) => {
                    const servicesCount = getServicesCountByCategory(category.id)
                    return (
                      <tr key={category.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{category.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-muted-foreground">
                            {category.description || 'Aucune description'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className={`text-sm ${servicesCount > 0 ? 'font-medium text-blue-600' : ''}`}>
                              {servicesCount}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={category.isActive !== false ? "default" : "secondary"}>
                            {category.isActive !== false ? "Actif" : "Inactif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">
                            {category.createdAt 
                              ? new Date(category.createdAt).toLocaleDateString('fr-FR')
                              : 'N/A'
                            }
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isToggling || isDeleting}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(category)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                                  <RefreshCw className="w-4 h-4" />
                                  {category.isActive !== false ? "Désactiver" : "Activer"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={servicesCount > 0 ? "text-gray-400" : "text-destructive"}
                                  onClick={() => handleDeleteClick(category)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                  {servicesCount > 0 && (
                                    <span className="ml-1 text-xs">
                                      ({servicesCount} service{servicesCount > 1 ? 's' : ''})
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination - Afficher seulement si nécessaire */}
              {filteredCategories.total > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={filteredCategories.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie créée'}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première catégorie
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCategoryModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        existingCategories={categories}
      />

      {/* Nouveau modal de mise à jour */}
      <UpdateCategoryModal 
        open={updateModal.open}
        onOpenChange={handleUpdateModalClose}
        category={updateModal.category}
        existingCategories={categories}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Supprimer la catégorie"
        description={getDeleteDescription()}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel={deleteModal.categoryId && getServicesCountByCategory(deleteModal.categoryId) > 0 ? "Impossible de supprimer" : "Supprimer"}
        confirmVariant="destructive"
        loading={isDeleting}
      />
    </>
  )
}