'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import { Avatar, AvatarFallback } from '@zyra/ui/components/avatar'
import { Separator } from '@zyra/ui/components/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import {
  Mail,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Check,
  X,
  ArrowLeft
} from 'lucide-react'
import { fetchCollection, editDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { toast } from 'sonner'
import { hairDresserInvitationStatusEnum, IHairDresserInvitation } from '@zyra/conf/domain/entities/hairdressers.entities'
import { formatDate } from '@zyra/conf/lib/utils'
import { useHairDressers } from '@/usecases/useHairDressers'

interface HairDresserInvitationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hairDresserId: string
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lun' },
  { key: 'tuesday', label: 'Mar' },
  { key: 'wednesday', label: 'Mer' },
  { key: 'thursday', label: 'Jeu' },
  { key: 'friday', label: 'Ven' },
  { key: 'saturday', label: 'Sam' },
  { key: 'sunday', label: 'Dim' }
]

export default function HairDresserInvitationsModal({
  open,
  onOpenChange,
  hairDresserId
}: HairDresserInvitationsModalProps) {
  const queryClient = useQueryClient()
  const { createAssociation } = useHairDressers()
  const [selectedInvitation, setSelectedInvitation] = useState<IHairDresserInvitation | null>(null)
  const [confirmingInvitationId, setConfirmingInvitationId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<hairDresserInvitationStatusEnum.ACCEPTED | hairDresserInvitationStatusEnum.REJECTED | null>(null)

  // Fetch invitations for this hairdresser
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['hair-dresser-invitations', hairDresserId],
    queryFn: async (): Promise<IHairDresserInvitation[]> => {
      const results = await fetchCollection('hair_dresser_invitations', [
        where('hairDresserId', '==', hairDresserId)
      ])
      // Sort by creation date (newest first)
      return results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as IHairDresserInvitation[]
    },
    enabled: !!hairDresserId && open
  })

  // Update invitation status mutation
  const updateInvitationMutation = useMutation({
    mutationFn: async ({ invitation, status, salonId }: { invitation: IHairDresserInvitation; status: 'accepted' | 'rejected'; salonId?: string }) => {
      await editDocument('hair_dresser_invitations', invitation.id, {
        status,
        updatedAt: new Date().toISOString()
      })
      // Create association if accepted
      if (status === hairDresserInvitationStatusEnum.ACCEPTED && salonId) {
        createAssociation({
          hairDresserId,
          salonId,
          salonServiceIds: invitation.selectedServiceIds,
          salary: invitation.salary || null,
          contractType: invitation.contractType,
          commissionRate: invitation.commissionRate,
          workingHours: invitation.workingHours
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dresser-invitations', hairDresserId] })
      toast.success(confirmAction === hairDresserInvitationStatusEnum.ACCEPTED ? 'Invitation acceptée' : 'Invitation refusée')
      setConfirmingInvitationId(null)
      setConfirmAction(null)
      setSelectedInvitation(null)
    },
    onError: () => {
      toast.error('Une erreur est survenue')
    }
  })

  const getStatusBadge = (status: string, expiresAt: string) => {
    const expired = new Date(expiresAt) < new Date()
    if (status ===  hairDresserInvitationStatusEnum.PENDING && expired) {
      return <Badge variant="outline" className="text-gray-500">Expirée</Badge>
    }
    switch (status) {
      case hairDresserInvitationStatusEnum.PENDING:
        return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">En attente</Badge>
      case hairDresserInvitationStatusEnum.ACCEPTED:
        return <Badge variant="default" className="text-green-700 bg-green-100">Acceptée</Badge>
      case hairDresserInvitationStatusEnum.REJECTED:
        return <Badge variant="destructive">Refusée</Badge>
      case hairDresserInvitationStatusEnum.EXPIRED:
        return <Badge variant="outline" className="text-gray-500">Expirée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent style={{ maxWidth : 'none' }} className="w-[50%] max-w-none max-h-[85vh] overflow-hidden p-0 animate-in fade-in duration-300">
          <div className="flex h-full w-full">
            {/* Liste des invitations ou détails */}
            <div
              className={`flex-1 overflow-y-auto transition-all duration-500 ease-in-out ${
                selectedInvitation ? 'hidden md:flex md:border-r md:w-1/2' : 'flex'
              }`}
            >
              <div className="w-full">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Invitations ({invitations.length})
                  </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-2 animate-in fade-in slide-in-from-left duration-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : invitations.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucune invitation</p>
                    </div>
                  ) : (
                    invitations.map((invitation) => (
                      <button
                        key={invitation.id}
                        onClick={() => setSelectedInvitation(invitation)}
                        className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm active:scale-95"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {invitation.salonName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{invitation.salonName}</h4>
                              <p className="text-sm text-gray-500">{formatDate(invitation.createdAt)}</p>
                            </div>
                          </div>
                          {getStatusBadge(invitation.status, invitation.expiresAt)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Détails de l'invitation sélectionnée */}
            {selectedInvitation && (
              <div className="hidden md:flex md:w-1/2 md:flex-col md:border-l bg-white animate-in slide-in-from-right duration-500 ease-out">
                <div className="px-6 py-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setSelectedInvitation(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-semibold flex-1">Détails</h3>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <InvitationDetails
                    invitation={selectedInvitation}
                    onAccept={() => {
                      setConfirmingInvitationId(selectedInvitation.id)
                      setConfirmAction(hairDresserInvitationStatusEnum.ACCEPTED)
                    }}
                    onReject={() => {
                      setConfirmingInvitationId(selectedInvitation.id)
                      setConfirmAction(hairDresserInvitationStatusEnum.REJECTED)
                    }}
                    isLoading={updateInvitationMutation.isPending && confirmingInvitationId === selectedInvitation.id}
                  />
                </div>
              </div>
            )}

            {/* Version mobile - détails en plein écran */}
            {selectedInvitation && (
              <div className="md:hidden absolute inset-0 bg-white flex flex-col z-50 animate-in slide-in-from-right duration-300 ease-out">
                <div className="px-6 py-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setSelectedInvitation(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-semibold flex-1">Détails</h3>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <InvitationDetails
                    invitation={selectedInvitation}
                    onAccept={() => {
                      setConfirmingInvitationId(selectedInvitation.id)
                      setConfirmAction(hairDresserInvitationStatusEnum.ACCEPTED)
                    }}
                    onReject={() => {
                      setConfirmingInvitationId(selectedInvitation.id)
                      setConfirmAction(hairDresserInvitationStatusEnum.REJECTED)
                    }}
                    isLoading={updateInvitationMutation.isPending && confirmingInvitationId === selectedInvitation.id}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmingInvitationId} onOpenChange={() => setConfirmingInvitationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === hairDresserInvitationStatusEnum.ACCEPTED ? 'Accepter l\'invitation ?' : 'Refuser l\'invitation ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === hairDresserInvitationStatusEnum.ACCEPTED
                ? 'Vous allez accepter cette invitation et commencer à travailler dans ce salon.'
                : 'Êtes-vous sûr de vouloir refuser cette invitation ?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const invitation = invitations.find(i => i.id === confirmingInvitationId)
                if (invitation && confirmAction) {
                  updateInvitationMutation.mutate({
                    invitation : invitation,
                    status: confirmAction,
                    salonId: invitation.salonId
                  })
                }
              }}
              className={confirmAction === hairDresserInvitationStatusEnum.ACCEPTED ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmAction === hairDresserInvitationStatusEnum.ACCEPTED ? 'Accepter' : 'Refuser'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}








function InvitationDetails({
  invitation,
  onAccept,
  onReject,
  isLoading
}: {
  invitation: IHairDresserInvitation
  onAccept?: () => void
  onReject?: () => void
  isLoading?: boolean
}) {


  const isPending = invitation.status === 'pending' && new Date(invitation.expiresAt) > new Date()

  return (
    <div className="p-6 space-y-6">
      {/* Salon Info */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {invitation.salonName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-lg font-semibold">{invitation.salonName}</h4>
            <p className="text-sm text-gray-500">Salon</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Dates */}
      <div>
        <h5 className="font-semibold text-sm text-gray-700 mb-3">Dates</h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Envoyée le {formatDate(invitation.createdAt)}</span>
          </div>
          {invitation.status === 'pending' && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Expire le {formatDate(invitation.expiresAt)}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Contrat */}
      <div>
        <h5 className="font-semibold text-sm text-gray-700 mb-3">Contrat</h5>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {invitation.contractType === 'commission' ? (
              <>
                <Percent className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Commission</p>
                  <p className="text-lg font-bold text-green-600">{invitation.commissionRate}%</p>
                </div>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Salaire mensuel</p>
                  <p className="text-lg font-bold text-blue-600">
                    {invitation.salary?.toLocaleString()} XAF
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Horaires */}
      <div>
        <h5 className="font-semibold text-sm text-gray-700 mb-3">Jours de travail</h5>
        <div className="flex flex-wrap gap-2">
          {invitation.workingHours.filter(wh => wh.openDay).map(workingHour => {
            const day = DAYS_OF_WEEK.find(d => d.key === workingHour.day)
            return (
              <div
                key={workingHour.day}
                className="p-2 bg-blue-50 border border-blue-200 rounded text-sm font-medium"
              >
                <p className="text-gray-700">{day?.label}</p>
                <p className="text-xs text-gray-500">
                  {workingHour.open} - {workingHour.close}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      {isPending && (onAccept || onReject) && (
        <>
          <Separator />
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={onReject}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Refuser
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onAccept}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Accepter
            </Button>
          </div>
        </>
      )}

      {/* Status Badge */}
      {invitation.status !== 'pending' && (
        <>
          <Separator />
          <div className="text-center">
            {invitation.status === 'accepted' && (
              <Badge className="bg-green-100 text-green-700">Invitation acceptée</Badge>
            )}
            {invitation.status === 'rejected' && (
              <Badge className="bg-red-100 text-red-700">Invitation refusée</Badge>
            )}
            {invitation.status === 'expired' && (
              <Badge variant="outline">Invitation expirée</Badge>
            )}
          </div>
        </>
      )}
    </div>
  )
}
