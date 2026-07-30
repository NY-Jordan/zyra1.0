// filepath: /home/yvan/PROJECTS/zyra/apps/salon/presentation/components/services/CategoriesManagement.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Users,
  Palette,
  RefreshCw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { useServiceCategories } from '@zyra/core/usecases/useServiceCategories'
import { useHasPermission } from '@/hooks/useHasPermission'
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
  const { hasPermission } = useHasPermission()
  const canManageCategories = hasPermission('services.categories')
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
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-300">
              ⚠️ <strong>Attention :</strong> Cette catégorie contient {servicesCount} service{servicesCount > 1 ? 's' : ''}. 
              La suppression sera bloquée tant que des services y sont rattachés.
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-300">
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

  const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

  return (
    <>
      <div className={`${card} p-4 sm:p-5 space-y-5`}>
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white tracking-tight">
              Catégories de services
            </h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredCategories.total} catégorie{filteredCategories.total > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 w-full sm:w-64 rounded-xl border-[#E8E0D8] dark:border-slate-700"
              />
            </div>
            {canManageCategories && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouvelle Catégorie</span>
              </button>
            )}
          </div>
        </div>

        {filteredCategories.categories.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.categories.map((category) => {
                const servicesCount = getServicesCountByCategory(category.id)
                const isActive = category.isActive !== false
                return (
                  <div
                    key={category.id}
                    className={`${card} p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all`}
                  >
                    <div className="space-y-3">
                      {/* En-tête */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                            <Palette className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[14px] text-slate-800 dark:text-white truncate">
                              {category.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                        {canManageCategories && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 flex-shrink-0"
                                disabled={isToggling || isDeleting}
                              >
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
                                {isActive ? 'Désactiver' : 'Activer'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={servicesCount > 0 ? 'text-gray-400 dark:text-slate-500' : 'text-destructive'}
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
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5em]">
                        {category.description || 'Aucune description'}
                      </p>

                      {/* Services + date */}
                      <div className="flex items-center justify-between py-1.5 px-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Users className="h-3.5 w-3.5" />
                          <span className={`text-[12px] font-semibold ${servicesCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                            {servicesCount} service{servicesCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {category.createdAt
                            ? new Date(category.createdAt).toLocaleDateString('fr-FR')
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination - Afficher seulement si nécessaire */}
            {filteredCategories.total > PAGE_SIZE && (
              <div className="pt-1">
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
            <Palette className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-[14px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie créée'}
            </h3>
            <p className="text-[13px] text-slate-400 mb-4">
              {searchTerm
                ? 'Aucune catégorie ne correspond à votre recherche.'
                : 'Commencez par créer votre première catégorie.'}
            </p>
            {canManageCategories && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Créer votre première catégorie
              </button>
            )}
          </div>
        )}
      </div>

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