'use client'
import { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import ConfirmModal from '@/presentation/components/CofirmModal'
import { useHairDressers } from '@/usecases/useHairDressers'
import EditHairDresserModal from './EditHairDresserModal'
import ViewHairDresserModal from './ViewHairDresserModal'
import SalonAssociationsModal from './SalonAssociationsModal'

export default function HairDressersList({ hairDressers }: { hairDressers: IHairDresser[] }) {
  // Fetch salons and countries from DB
  const { data: salons = [] } = useQuery({
    queryKey: ['salons'],
    queryFn: async () => await fetchCollection('salons'),
  })
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => await fetchCollection('countries'),
  })

  // Usecases actions
  const { deleteHairDresser, toggleStatus, deletePending, togglePending } = useHairDressers()

  // State for modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [salonModalOpen, setSalonModalOpen] = useState(false)
  const [selected, setSelected] = useState<IHairDresser | null>(null)

  // Helpers
  const getSalonName = (id?: string | null) => {
    if (!id || !salons.length) return "-"
    const salon = salons.find((s: any) => s.id === id)
    return salon ? salon.name : "-"
  }
  const getCountryName = (id?: string) => {
    if (!id || !countries.length) return "-"
    const country = countries.find((c: any) => c.id === id)
    return country ? country.name : "-"
  }

  // Handlers
  const handleDelete = (hairDresser: IHairDresser) => {
    setSelected(hairDresser)
    setDeleteModalOpen(true)
  }
  const handleToggleStatus = (hairDresser: IHairDresser) => {
    setSelected(hairDresser)
    setStatusModalOpen(true)
  }
  const handleConfirmDelete = () => {
    if (!selected) return
    deleteHairDresser(selected.id)
    setDeleteModalOpen(false)
    setSelected(null)
  }
  const handleConfirmStatus = () => {
    if (!selected) return
    toggleStatus(selected)
    setStatusModalOpen(false)
    setSelected(null)
  }
  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setSelected(null)
  }
  const handleCancelStatus = () => {
    setStatusModalOpen(false)
    setSelected(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2">Photo</th>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Spécialité</th>
            <th className="px-4 py-2">Pays</th>
            <th className="px-4 py-2">Ville</th>
            <th className="px-4 py-2">Salon()</th>
            <th className="px-4 py-2">Réservations prises</th>
            <th className="px-4 py-2">Réservations confirmées</th>
            <th className="px-4 py-2">Réservations faites</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hairDressers.map((h) => (
            <tr key={h.id} className="border-t">
              <td className="px-2 py-2">
                <img
                  src={h.photo || "/assets/avatar.jpg"}
                  alt={h.name}
                  className="w-10 h-10 object-cover rounded-full border"
                />
              </td>
              <td className="px-2 py-2 font-medium">{h.name}</td>
              <td className="px-2 py-2">{h.speciality}</td>
              <td className="px-2 py-2">{getCountryName(h.country)}</td>
              <td className="px-2 py-2">{h.city}</td>
              <td className="px-2 py-2 flex justify-center font-bold">
                <span>
                  <a
                    className='underline text-center text-blue-500 hover:cursor-pointer link'
                    onClick={() => { setSelected(h); setSalonModalOpen(true) }}
                  >
                    {h.salonIds?.length}
                  </a>
                </span>
              </td>
              <td className="px-2 py-2 text-center">{h.reservationsTaken ?? 0}</td>
              <td className="px-2 py-2 text-center">{h.reservationsConfirmed ?? 0}</td>
              <td className="px-2 py-2 text-center">{h.reservationsDone ?? 0}</td>
              <td className="px-2 py-2">
                <span className={`px-2 py-1 rounded text-xs ${h.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {h.status}
                </span>
              </td>
              <td className="px-2 py-2 flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { setSelected(h); setViewModalOpen(true) }}>Voir</Button>
                <Button size="sm" variant="outline" className="ml-1" onClick={() => { setSelected(h); setEditModalOpen(true) }}>Modifier</Button>
                <Button
                  size="sm"
                  variant={h.status === "active" ? "outline" : "default"}
                  className="ml-1"
                  onClick={() => handleToggleStatus(h)}
                >
                  {h.status === "active" ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-1"
                  onClick={() => handleDelete(h)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
          {hairDressers.length === 0 && (
            <tr>
              <td colSpan={11} className="text-center py-6 text-gray-500">Aucun coiffeur trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Modal de suppression */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Supprimer le coiffeur"
        description={`Voulez-vous vraiment supprimer ${selected?.name} ? Cette action est irréversible.`}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
        loading={deletePending}
        confirmVariant="destructive"
      />
      {/* Modal de changement de statut */}
      <ConfirmModal
        open={statusModalOpen}
        title={selected?.status === "active" ? "Désactiver le coiffeur" : "Activer le coiffeur"}
        description={
          selected?.status === "active"
            ? `Voulez-vous désactiver ${selected?.name} ?`
            : `Voulez-vous activer ${selected?.name} ?`
        }
        onCancel={handleCancelStatus}
        onConfirm={handleConfirmStatus}
        confirmLabel={selected?.status === "active" ? "Désactiver" : "Activer"}
        loading={togglePending}
        confirmVariant="default"
      />
      <EditHairDresserModal open={editModalOpen} onClose={() => setEditModalOpen(false)} hairDresser={selected} />
      <ViewHairDresserModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        hairDresser={selected}
        countryName={getCountryName(selected?.country)}
      />
      <SalonAssociationsModal
        open={salonModalOpen}
        onClose={() => setSalonModalOpen(false)}
        hairDresser={selected}
        salons={salons}
      />
    </div>
  )
}