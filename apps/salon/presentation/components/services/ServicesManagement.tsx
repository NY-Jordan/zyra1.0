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
  Filter,
  MoreHorizontal,
  Eye,
  Star,
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
import { useServices } from '@/usecases/useServices'
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Services ({filteredServices.total})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Service
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Service</th>
                    <th className="text-left py-3 px-4 font-medium">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium">Prix</th>
                    <th className="text-left py-3 px-4 font-medium">Durée</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.services.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2 flex items-center gap-2">
                        {service.imageUrl && (
                          <img src={service.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />
                        )}
                        <button 
                          onClick={() => handleViewDetails(service)}
                          className="font-medium hover:text-blue-600 hover:underline hover:cursor-pointer text-left"
                        >
                          {service.name}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {getCategoryName(service.categoryId)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatPrice(service.price, 'XAF')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDuration(service.duration)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={service.isActive !== false ? "default" : "secondary"}>
                            {service.isActive !== false ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
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
                              <DropdownMenuItem onClick={() => handleEditClick(service)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                                <RefreshCw className="w-4 h-4" />
                                {service.isActive !== false ? "Désactiver" : "Activer"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteClick(service)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination - Afficher seulement si nécessaire */}
              {filteredServices.total > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={filteredServices.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Aucun service trouvé' : 'Aucun service créé'}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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