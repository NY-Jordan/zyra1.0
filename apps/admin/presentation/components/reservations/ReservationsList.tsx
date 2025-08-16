'use client'
import { Button } from '@zyra/ui/components/button'
import { Eye, RefreshCw } from 'lucide-react'
import Pagination from '@/presentation/components/common/Pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import SalonServiceDetailsModal from '@/presentation/components/salons/details/Services/SalonServiceDetailsModal'
import ConfirmModal from '@/presentation/components/CofirmModal'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { useToggleReservationStatus } from '@/usecases/toggleReservationStatus.usecase'
import { canTransitionStatusReservation, statusOrderReservation, statusReservationDescriptions } from '@zyra/conf/lib/utils'

interface ReservationsListProps {
  reservations: IReservation[]
  salons: any[]
  loading: boolean
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}



export default function ReservationsList({
  reservations,
  salons,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
}: ReservationsListProps) {
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [toggleModalOpen, setToggleModalOpen] = useState(false)
  const [reservationToToggle, setReservationToToggle] = useState<IReservation | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const { toggleReservationStatus, togglePending } = useToggleReservationStatus()

  const handleToggleStatus = async () => {
    if (!reservationToToggle) return
    if (!selectedStatus || selectedStatus === reservationToToggle.status) {
      setErrorStatus("Veuillez choisir un statut différent.")
      return
    }
    if (!canTransitionStatusReservation(reservationToToggle.status, selectedStatus)) {
      setErrorStatus("Transition non autorisée entre ces statuts.")
      return
    }
    setErrorStatus(null)
    toggleReservationStatus(
      { id: reservationToToggle.id, status: selectedStatus },
      {
        onSuccess: () => {
          toast.success("Statut modifié avec succès")
          setToggleModalOpen(false)
          setReservationToToggle(null)
          setSelectedStatus(null)
        },
        onError: (e) => {
          toast.error("Erreur lors du changement de statut")
        }
      }
    )
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">Salon</th>
            <th className="px-4 py-2 text-left">Service</th>
            <th className="px-4 py-2 text-left">Client</th>
            <th className="px-4 py-2 text-left">Téléphone</th>
            <th className="px-4 py-2 text-left">Date prévue</th>
            <th className="px-4 py-2 text-left">Fin prévue</th> {/* Ajout ici */}
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">Chargement...</td>
            </tr>
          ) : reservations.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">Aucune réservation trouvée.</td>
            </tr>
          ) : (
            reservations.map((reservation) => {
              const salon = salons.find((s: any) => s.id === reservation.salonId)
              const service = salon?.services?.find((srv: any) => srv.id === reservation.serviceId)
              return (
                <tr key={reservation.id} className="border-t">
                  <td className="px-4 py-2 font-bold">{salon?.name || "-"}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    {service?.imageUrl && (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-8 h-8 object-cover rounded mr-2 border"
                      />
                    )}
                    <button
                      type="button"
                      className="text-blue-600 underline hover:text-blue-800"
                      onClick={() => {
                        setSelectedService(service)
                        setSelectedReservation(reservation as IReservation)
                        setServiceModalOpen(true)
                      }}
                    >
                      {service?.name || "-"}
                    </button>
                  </td>
                  <td className="px-4 py-2">{reservation.clientName}</td>
                  <td className="px-4 py-2">{reservation.clientPhone}</td>
                  <td className="px-4 py-2">
                    {reservation.scheduledAt?.toDate?.()
                      ? reservation.scheduledAt.toDate().toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).replace(":", "h")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {reservation.endsAt?.toDate?.()
                      ? reservation.endsAt.toDate().toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).replace(":", "h")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-semibold">{reservation.status}</span>
                    <div className="text-xs text-gray-500">{statusReservationDescriptions[reservation.status] || ""}</div>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setSelectedReservation(reservation as IReservation)
                        setModalOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => {
                        setToggleModalOpen(true)
                        setReservationToToggle(reservation)
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
      {/* Modal de récapitulatif */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedReservation && (() => {
            const salon = salons.find((s: any) => s.id === selectedReservation.salonId)
            return (
              <div className="space-y-2">
                <div><b>Salon :</b> {salon?.name || "-"}</div>
                <div><b>Client :</b> {selectedReservation.clientName}</div>
                <div><b>Téléphone :</b> {selectedReservation.clientPhone}</div>
                <div><b>Date prévue :</b> {
                  selectedReservation.scheduledAt?.toDate?.()
                    ? selectedReservation.scheduledAt.toDate().toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).replace(":", "h")
                    : "-"
                }</div>
                <div><b>Statut :</b> {selectedReservation.status}</div>
                <div><b>Prix :</b> {selectedReservation.price} FCFA</div>
                <div><b>Payé :</b> {selectedReservation.isPaid ? "Oui" : "Non"}</div>
                <div><b>Méthode de paiement :</b> {selectedReservation.paymentMethod}</div>
                <div><b>Notes :</b> {selectedReservation.notes || "-"}</div>
                <div><b>Créée le :</b> {selectedReservation.createdAt?.toDate?.().toLocaleString() || "-"}</div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal détails du service */}
      <SalonServiceDetailsModal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        service={
          selectedService
            ? {
                ...selectedService,
                supplements: selectedReservation?.supplements
                  ? selectedService.supplements?.filter((supp: ISalonServiceSupplement) =>
                      selectedReservation.supplements.includes(supp.id)
                    )
                  : []
              }
            : null
        }
      />
      {/* Modal de confirmation pour le toggle status */}
      <ConfirmModal
        open={toggleModalOpen}
        title="Changer le statut de la réservation"
        description={
          reservationToToggle
            ? (
              <div>
                <div className="mb-2">
                  Statut actuel : <b>{reservationToToggle.status}</b>
                  <div className="text-xs text-gray-500">{statusReservationDescriptions[reservationToToggle.status] || ""}</div>
                </div>
                <label className="block font-medium mb-1">Nouveau statut :</label>
                <div className="flex flex-col gap-2">
                  {statusOrderReservation.map(status => {
                    const disabled = !canTransitionStatusReservation(reservationToToggle.status, status) || status === reservationToToggle.status
                    return (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="newStatus"
                          value={status}
                          checked={selectedStatus === status}
                          disabled={disabled}
                          onChange={() => {
                            setSelectedStatus(status)
                            setErrorStatus(null)
                          }}
                        />
                        <span className={disabled ? "text-gray-400" : ""}>
                          <b>{status}</b>
                          <span className="text-xs text-gray-500 ml-2">{statusReservationDescriptions[status]}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {errorStatus && <div className="text-red-500 text-xs mt-2">{errorStatus}</div>}
              </div>
            )
            : ""
        }
        onCancel={() => {
          setToggleModalOpen(false)
          setSelectedStatus(null)
          setErrorStatus(null)
        }}
        onConfirm={handleToggleStatus}
        confirmLabel="Confirmer"
        loading={togglePending}
        confirmVariant="outline"
      />
    </div>
  )
}