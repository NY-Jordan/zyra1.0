'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  DollarSign,
  Scissors,
  RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
import { formatPrice } from '@zyra/conf/lib/utils'
import { useHasPermission } from '@/hooks/useHasPermission'
import { useServices } from '@zyra/core/usecases/useServices'
import CreateServiceModal from './CreateServiceModal'
import ConfirmModal from '../../../../admin/presentation/components/CofirmModal'
import UpdateServiceModal from './UpdateServiceModal'
import ServiceDetailsModal from './ServiceDetailsModal'
import { IServiceCategory, ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import Pagination from '../common/Pagination'

interface ServicesManagementProps {
  services: ISalonService[]
  categories: IServiceCategory[]
}

export default function ServicesManagement({ services, categories }: ServicesManagementProps) {
  const { hasPermission } = useHasPermission()
  const canCreate = hasPermission('services.create')
  const canEdit = hasPermission('services.edit')
  const canDelete = hasPermission('services.delete')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // Nouvel état pour le modal de mise à jour
  const [updateModal, setUpdateModal] = useState<{
    open: boolean
    service: ISalonService | null
  }>({
    open: false,
    service: null
  })

  // État pour le modal de détails du service
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean
    service: ISalonService | null
  }>({
    open: false,
    service: null
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    serviceId: string | null
    serviceName: string
  }>({
    open: false,
    serviceId: null,
    serviceName: ''
  })

  const { toggleActive, deleteService, isToggling, isDeleting } = useServices()

  // Filtrage et pagination des données
  const filteredServices = React.useMemo(() => {
    // Filter
    const filtered = services.filter(service =>
      service.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    //pagination
    const startIndex = (page - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    const paginatedServices = filtered.slice(startIndex, endIndex)
    return {
      services: paginatedServices,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / PAGE_SIZE)
    }
  }, [services, searchTerm, page])

  // Reset page when search term changes
  React.useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
    }
    return `${mins}min`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Non catégorisé'
  }

  const handleToggleActive = (service: any) => {
    toggleActive(service)
  }

  const handleDeleteClick = (service: any) => {
    setDeleteModal({
      open: true,
      serviceId: service.id,
      serviceName: service.name
    })
  }

  const handleConfirmDelete = () => {
    if (deleteModal.serviceId) {
      deleteService(deleteModal.serviceId)
      setDeleteModal({
        open: false,
        serviceId: null,
        serviceName: ''
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteModal({
      open: false,
      serviceId: null,
      serviceName: ''
    })
  }

  // Nouvelle fonction pour ouvrir le modal de mise à jour
  const handleEditClick = (service: ISalonService) => {
    setUpdateModal({
      open: true,
      service: service
    })
  }

  // Fonction pour fermer le modal de mise à jour
  const handleUpdateModalClose = () => {
    setUpdateModal({
      open: false,
      service: null
    })
  }

  // Fonction pour ouvrir le modal de détails
  const handleViewDetails = (service: ISalonService) => {
    setDetailsModal({
      open: true,
      service: service
    })
  }

  // Fonction pour fermer le modal de détails
  const handleDetailsModalClose = () => {
    setDetailsModal({
      open: false,
      service: null
    })
  }

  const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

  return (
    <>
      <div className="space-y-4">
        {/* Filtres */}
        <div className={`${card} p-4`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-[15px] font-extrabold text-slate-800 dark:text-white">
              Services <span className="text-slate-400 dark:text-slate-500 font-semibold">({filteredServices.total})</span>
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 w-full sm:w-64 rounded-xl border-[#E8E0D8] dark:border-slate-700"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-[#F5F2EF] dark:bg-slate-700/50 hover:bg-[#EDE8E3] dark:hover:bg-slate-700 transition-colors"
              >
                <Filter className="h-3.5 w-3.5" />
                Filtrer
              </button>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau Service
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste des services */}
        {filteredServices.services.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.services.map((service) => (
                <div
                  key={service.id}
                  className={`${card} p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all`}
                >
                  <div className="space-y-3">
                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt="" className="w-9 h-9 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Scissors className="h-4 w-4" />
                          </div>
                        )}
                        <button
                          onClick={() => handleViewDetails(service)}
                          className="font-bold text-[14px] text-slate-800 dark:text-white truncate text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {service.name}
                        </button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isToggling || isDeleting}
                            className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 flex-shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleEditClick(service)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          )}
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                              <RefreshCw className="w-4 h-4" />
                              {service.isActive !== false ? "Désactiver" : "Activer"}
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(service)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Badges catégorie / statut */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#F5F2EF] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#EDE8E3] dark:border-slate-700">
                        {getCategoryName(service.categoryId)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          service.isActive !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {service.isActive !== false ? "Actif" : "Inactif"}
                      </span>
                    </div>

                    {/* Prix et durée */}
                    <div className="flex items-center justify-between py-1.5 px-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-semibold">{formatDuration(service.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[14px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(service.price, 'XAF')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination - Afficher seulement si nécessaire */}
            {filteredServices.total > PAGE_SIZE && (
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filteredServices.total}
                onPageChange={setPage}
              />
            )}
          </div>
        ) : (
          <div className={`text-center py-12 ${card}`}>
            <Scissors className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-[14px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {searchTerm ? 'Aucun service trouvé' : 'Aucun service créé'}
            </h3>
            <p className="text-[13px] text-slate-400 mb-4">
              {searchTerm ? 'Aucun service ne correspond à votre recherche.' : 'Commencez par créer votre premier service.'}
            </p>
            {canCreate && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Créer votre premier service
              </button>
            )}
          </div>
        )}
      </div>

      <CreateServiceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        categories={categories}
        salonServices={services}
      />

      {/* Nouveau modal de mise à jour */}
      <UpdateServiceModal 
        open={updateModal.open}
        onOpenChange={handleUpdateModalClose}
        service={updateModal.service}
        categories={categories}
        salonServices={services}
      />

      {/* Modal de détails du service */}
      <ServiceDetailsModal 
        open={detailsModal.open}
        onOpenChange={handleDetailsModalClose}
        service={detailsModal.service}
        categories={categories}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Supprimer le service"
        description={`Êtes-vous sûr de vouloir supprimer le service "${deleteModal.serviceName}" ? Cette action est irréversible.`}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
        confirmVariant="destructive"
        loading={isDeleting}
      />
    </>
  )
}