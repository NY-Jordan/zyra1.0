'use client'
import { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { HairDresserSalonAssociation, IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Badge, Pencil, Trash2, Ban } from 'lucide-react'
import ConfirmModal from '@/presentation/components/CofirmModal'
import { useHairDressers } from '@/usecases/useHairDressers'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function HairDressers({ hairdressers, salonId }: { hairdressers: IHairDresser[], salonId: string }) {
  const [dissociateModalOpen, setDissociateModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selected, setSelected] = useState<IHairDresser | null>(null)
  const [selectedAssociation, setSelectedAssociation] = useState<HairDresserSalonAssociation | null>(null)
  const { dissociateHairDresserFromSalon, dissociatePending, toggleAssociationStatus, toggleAssociationPending } = useHairDressers()
  const queryClient = useQueryClient()

  const handleDissociate = (hairDresser: IHairDresser) => {
    setSelected(hairDresser)
    setDissociateModalOpen(true)
  }
  const handleConfirmDissociate = async () => {
    if (!selected) return
    await dissociateHairDresserFromSalon({ hairDresserId: selected.id, salonId })
    setDissociateModalOpen(false)
    setSelected(null)
    queryClient.invalidateQueries({ queryKey: ['hairdressers-by-salon'] })
    toast.success("Coiffeur dissocié du salon avec succès")
  }
  const handleToggleStatus = (hairDresser: IHairDresser, salonAssociation: HairDresserSalonAssociation) => {
    setSelected(hairDresser)
    setStatusModalOpen(true);
    setSelectedAssociation(salonAssociation)
  }
  const handleConfirmStatus = async () => {
    if (!selected) return
    await toggleAssociationStatus({
      hairDresserId : selected.id,
      salonId,
    })
    setStatusModalOpen(false)
    setSelected(null)
    queryClient.invalidateQueries({ queryKey: ['hairdressers-by-salon'] })
    toast.success(
      selectedAssociation?.active
        ? "Coiffeur désactivé avec succès"
        : "Coiffeur activé avec succès"
    )
  }
  const handleCancelDissociate = () => {
    setDissociateModalOpen(false)
    setSelected(null)
  }
  const handleCancelStatus = () => {
    setStatusModalOpen(false)
    setSelected(null)
    setSelectedAssociation(null)
  }

  return (
    <div className="mb-8 mt-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Coiffeurs</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Photo</th>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Spécialité</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Téléphone</th>
              <th className="px-4 py-2 text-left">Réservations prises</th>
              <th className="px-4 py-2 text-left">Réservations confirmées</th>
              <th className="px-4 py-2 text-left">Réservations faites</th>
              <th className="px-4 py-2 text-left">Ajouté le</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hairdressers.map((h) => {
              const salonAssociation: HairDresserSalonAssociation | null = h.salonIds?.find(s => s.salonId === salonId) || null

            return (
              <tr key={h.id} className="border-t">
                <td className="px-4 py-2">
                  <img src={h.photo || "/avatar.jpg"} alt={h.name} className="w-10 h-10 rounded-full object-cover border" />
                </td>
                <td className="px-4 py-2">{h.name}</td>
                <td className="px-4 py-2">{h.speciality}</td>
                <td className="px-4 py-2">{h.email}</td>
                <td className="px-4 py-2">{h.phone}</td>
                <td className="px-4 py-2 font-bold text-blue-600">{h.reservationsTaken ?? 0}</td>
                <td className="px-4 py-2 font-bold text-green-600">{h.reservationsConfirmed ?? 0}</td>
                <td className="px-4 py-2 font-bold text-yellow-600">{h.reservationsDone ?? 0}</td>
                <td className="px-4 py-2">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2">
                  {salonAssociation && <span className={`px-2 py-1 rounded text-xs ${salonAssociation.active  ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {salonAssociation.active ? "Actif" : "Inactif"}
                  </span>}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDissociate(h)}
                    title="Dissocier du salon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={salonAssociation?.active ? "outline" : "default"}
                    onClick={() => handleToggleStatus(h, salonAssociation!)}
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            )
            })}
            {hairdressers.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">Aucun coiffeur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={dissociateModalOpen}
        title="Dissocier le coiffeur du salon"
        description={`Voulez-vous vraiment dissocier ${selected?.name} de ce salon ?`}
        onCancel={handleCancelDissociate}
        onConfirm={handleConfirmDissociate}
        confirmLabel="Dissocier"
        loading={dissociatePending}
        confirmVariant="destructive"
      />
      <ConfirmModal
        open={statusModalOpen}
        title={selectedAssociation?.active ? "Désactiver le coiffeur" : "Activer le coiffeur"}
        description={
          selectedAssociation?.active
            ? `Voulez-vous désactiver ${selected?.name} ?`
            : `Voulez-vous activer ${selected?.name} ?`
        }
        onCancel={handleCancelStatus}
        onConfirm={handleConfirmStatus}
        confirmLabel={selectedAssociation?.active ? "Désactiver" : "Activer"}
        loading={toggleAssociationPending}
        confirmVariant={selectedAssociation?.active ? "destructive" : "default"}
      />
    </div>
  )
}
