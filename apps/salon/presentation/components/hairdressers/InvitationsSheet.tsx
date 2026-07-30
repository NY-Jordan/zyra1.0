'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@zyra/ui/components/sheet'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import { Button } from '@zyra/ui/components/button'
import { Separator } from '@zyra/ui/components/separator'
import {
  User,
  Mail,
  Clock,
  DollarSign,
  Percent,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Edit
} from 'lucide-react'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import useSalon from '@zyra/core/hooks/useSalon'
import { toast } from 'sonner'
import { hairDresserInvitationStatusEnum, IHairDresserInvitation } from '@zyra/conf/domain/entities/hairdressers.entities'
import EditInvitationModal from './EditInvitationModal'
import { formatDate } from '@zyra/conf/lib/utils'
import { useHasPermission } from '@/hooks/useHasPermission'

interface InvitationsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export default function InvitationsSheet({ open, onOpenChange }: InvitationsSheetProps) {
  const { salon } = useSalon()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('hairdressers.edit')
  const [selectedInvitation, setSelectedInvitation] = useState<IHairDresserInvitation | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['salon-invitations', salon?.id],
    queryFn: async (): Promise<IHairDresserInvitation[]> => {
      if (!salon?.id) return []
      const results = await fetchCollection('hair_dresser_invitations', [
        where('salonId', '==', salon.id)
      ])
      // Trier par date de création (plus récentes en premier)
      return results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as IHairDresserInvitation[]
    },
    enabled: !!salon?.id && open
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">En attente</Badge>
      case 'accepted':
        return <Badge variant="default" className="text-green-700 bg-green-100">Acceptée</Badge>
      case 'rejected':
        return <Badge variant="destructive">Refusée</Badge>
      case 'expired':
        return <Badge variant="outline" className="text-gray-500 dark:text-slate-400">Expirée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }


  const groupedInvitations = React.useMemo(() => {
    const groups = {
      pending: invitations.filter(inv => inv.status === 'pending' && !isExpired(inv.expiresAt)),
      accepted: invitations.filter(inv => inv.status === 'accepted'),
      rejected: invitations.filter(inv => inv.status === 'rejected'),
      expired: invitations.filter(inv => inv.status === 'expired' || (inv.status === 'pending' && isExpired(inv.expiresAt)))
    }
    return groups
  }, [invitations])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[700px] sm:w-[600px] overfloselectedCategoryIdsw-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations de coiffeurs
          </SheetTitle>
          <SheetDescription>
            Gérez les invitations envoyées aux coiffeurs de votre salon
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 mx-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full">
                  <Mail className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Aucune invitation</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez envoyé aucune invitation pour le moment
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Invitations en attente */}
              {groupedInvitations.pending.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    En attente ({groupedInvitations.pending.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedInvitations.pending.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        onEdit={canEdit ? () => {
                          setSelectedInvitation(invitation)
                          setEditModalOpen(true)
                        } : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Invitations acceptées */}
              {groupedInvitations.accepted.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Acceptées ({groupedInvitations.accepted.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedInvitations.accepted.map((invitation) => (
                      <InvitationCard key={invitation.id} invitation={invitation} />
                    ))}
                  </div>
                </div>
              )}

              {/* Invitations refusées */}
              {groupedInvitations.rejected.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Refusées ({groupedInvitations.rejected.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedInvitations.rejected.map((invitation) => (
                      <InvitationCard key={invitation.id} invitation={invitation} />
                    ))}
                  </div>
                </div>
              )}

              {/* Invitations expirées */}
              {groupedInvitations.expired.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Expirées ({groupedInvitations.expired.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedInvitations.expired.map((invitation) => (
                      <InvitationCard key={invitation.id} invitation={invitation} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
      {/* Modal d'édition */}
      <EditInvitationModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        invitation={selectedInvitation}
      />
    </Sheet>
  )
}

function InvitationCard({
  invitation,
  onEdit
}: {
  invitation: IHairDresserInvitation
  onEdit?: () => void
}) {
  const getStatusBadge = (status: string, expiresAt: string) => {
    const expired = new Date(expiresAt) < new Date()
    if (status === 'pending' && expired) {
      return <Badge variant="outline" className="text-gray-500 dark:text-slate-400">Expirée</Badge>
    }
    switch (status) {
      case hairDresserInvitationStatusEnum.PENDING :
        return <Badge variant="secondary" className="text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30">En attente</Badge>
      case hairDresserInvitationStatusEnum.ACCEPTED:
        return <Badge variant="default" className="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30">Acceptée</Badge>
      case hairDresserInvitationStatusEnum.REJECTED:
        return <Badge variant="destructive">Refusée</Badge>
      case hairDresserInvitationStatusEnum.EXPIRED:
        return <Badge variant="outline" className="text-gray-500 dark:text-slate-400">Expirée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{invitation.hairDresserName}</h4>
                <p className="text-sm text-muted-foreground">{invitation.hairDresserEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(invitation.status, invitation.expiresAt)}
              {invitation.status === 'pending' && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Détails */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Envoyée le {formatDate(invitation.createdAt)}</span>
            </div>
            {invitation.status === 'pending' && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Expire le {formatDate(invitation.expiresAt)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {invitation.contractType === 'commission' ? (
                <>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span>Commission {invitation.commissionRate}%</span>
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Salaire {invitation.salary?.toLocaleString()} XAF/mois</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Jours:</span>
              <div className="flex gap-1">
                {invitation.workingHours.filter(wh => wh.openDay).map(workingHour => {
                  const day = DAYS_OF_WEEK.find(d => d.key === workingHour.day)
                  return (
                    <Badge key={workingHour.day} variant="outline" className="text-xs">
                      {day?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}