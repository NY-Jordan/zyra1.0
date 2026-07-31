'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import {
  Plus,
  Search,
  Star,
  Users,
  CheckCircle,
  XCircle,
  Send,
  Mail,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Badge } from '@zyra/ui/components/badge'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { memberStatusEnum } from '@zyra/conf/domain/enums/MemberEnum'
import {  HairDresserWithSalonAssociation, useHairDressers } from '@zyra/core/usecases/useHairDressers'
import ConfirmModal from '../../../../admin/presentation/components/CofirmModal'
import HairDresserCard from './HairDresserCard'
import HairDresserDetailsModal from './HairDresserDetailsModal'
import InviteHairDresserModal from './InviteHairDresserModal'
import InvitationsSheet from './InvitationsSheet'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useHasPermission } from '@/hooks/useHasPermission'



export default function HairDressersManagement() {
  const { salon } = useSalon()
  const { hasPermission } = useHasPermission()
  const canInvite = hasPermission('hairdressers.invite')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | memberStatusEnum>('all')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [invitationsSheetOpen, setInvitationsSheetOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedHairdresser, setSelectedHairdresser] = useState<HairDresserWithSalonAssociation | null>(null)
  
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    hairDresserId: string | null
    hairDresserName: string
  }>({
    open: false,
    hairDresserId: null,
    hairDresserName: ''
  })

  const [statusModal, setStatusModal] = useState<{
    open: boolean
    hairDresser: IHairDresser | null
  }>({
    open: false,
    hairDresser: null
  })

  const {
    hairDressers,
    isLoading,
    toggleStatus,
    deleteHairDresser,
    isToggling,
    isDeleting
  } = useHairDressers()

  // Filtrage des coiffeurs
  const filteredHairDressers = React.useMemo(() => {
    let filtered = hairDressers

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(hairDresser =>
        hairDresser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hairDresser.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hairDresser.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(hairDresser => hairDresser.status === statusFilter)
    }

    return filtered
  }, [hairDressers, searchTerm, statusFilter]) as HairDresserWithSalonAssociation[]

  const handleDeleteClick = (hairDresser: HairDresserWithSalonAssociation) => {
    setDeleteModal({
      open: true,
      hairDresserId: hairDresser.id,
      hairDresserName: hairDresser.name
    })
  }

  const handleConfirmDelete = () => {
    if (deleteModal.hairDresserId) {
      deleteHairDresser(deleteModal.hairDresserId)
      setDeleteModal({
        open: false,
        hairDresserId: null,
        hairDresserName: ''
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteModal({
      open: false,
      hairDresserId: null,
      hairDresserName: ''
    })
  }

  const handleStatusClick = (hairDresser: HairDresserWithSalonAssociation) => {
    setStatusModal({
      open: true,
      hairDresser: hairDresser
    })
  }

  const handleViewClick = (hairDresser: HairDresserWithSalonAssociation) => {
    setSelectedHairdresser(hairDresser)
    setDetailsOpen(true)
  }

  const handleConfirmStatus = () => {
    if (statusModal.hairDresser) {
      toggleStatus(statusModal.hairDresser)
      setStatusModal({
        open: false,
        hairDresser: null
      })
    }
  }

  const handleCancelStatus = () => {
    setStatusModal({
      open: false,
      hairDresser: null
    })
  }



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des coiffeurs...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* En-tête et statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{hairDressers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {hairDressers.filter(h => h.associationHairdresser.active === true).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suspendus</p>
                  <p className="text-2xl font-bold text-red-600">
                    {hairDressers.filter(h => h.associationHairdresser.active  === false).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Réservations</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {Math.round(hairDressers.reduce((acc, h) => acc + (h.reservationsDone || 0), 0) / (hairDressers.length || 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Équipe de coiffeurs ({filteredHairDressers.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un coiffeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value={memberStatusEnum.active}>Actifs</option>
                  <option value={memberStatusEnum.suspended}>Suspendus</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={() => setInvitationsSheetOpen(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Voir les invitations
                </Button>
                {canInvite && (
                  <Button onClick={() => setInviteModalOpen(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Inviter un coiffeur
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHairDressers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHairDressers.map((hairDresser: HairDresserWithSalonAssociation) => (
                  <HairDresserCard
                    key={hairDresser.id}
                    hairDresser={hairDresser}
                    onDeleteClick={handleDeleteClick}
                    onStatusClick={handleStatusClick}
                    onViewClick={handleViewClick}
                    isToggling={isToggling}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full">
                    <Users className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || statusFilter !== 'all' ? 'Aucun coiffeur trouvé' : 'Aucun coiffeur dans votre équipe'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Essayez de modifier vos critères de recherche' 
                        : 'Commencez par ajouter des coiffeurs à votre salon'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && canInvite && (
                      <Button onClick={() => setInviteModalOpen(true)}>
                        <Send className="h-4 w-4 mr-2" />
                        Inviter votre premier coiffeur
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        open={deleteModal.open}
        title="Supprimer le coiffeur"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.hairDresserName} ? Cette action est irréversible.`}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
        confirmVariant="destructive"
        loading={isDeleting}
      />

      {/* Modal de confirmation de changement de statut */}
      <ConfirmModal
        open={statusModal.open}
        title={statusModal.hairDresser?.status === memberStatusEnum.active ? 'Suspendre le coiffeur' : 'Activer le coiffeur'}
        description={
          statusModal.hairDresser?.status === memberStatusEnum.active
            ? `Voulez-vous suspendre ${statusModal.hairDresser?.name} ? Il ne pourra plus prendre de rendez-vous.`
            : `Voulez-vous activer ${statusModal.hairDresser?.name} ? Il pourra à nouveau prendre des rendez-vous.`
        }
        onCancel={handleCancelStatus}
        onConfirm={handleConfirmStatus}
        confirmLabel={statusModal.hairDresser?.status === memberStatusEnum.active ? 'Suspendre' : 'Activer'}
        confirmVariant={statusModal.hairDresser?.status === memberStatusEnum.active ? 'destructive' : 'default'}
      />

      {/* Details Modal */}
      <HairDresserDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        hairdresser={selectedHairdresser}
        categories={salon?.serviceCategories || []}
      />

      {/* Modal d'invitation de coiffeur */}
      <InviteHairDresserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />

      {/* Sheet des invitations */}
      <InvitationsSheet
        open={invitationsSheetOpen}
        onOpenChange={setInvitationsSheetOpen}
      />
    </>
  )
}