'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@zyra/ui/components/dialog"
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

export default function ViewHairDresserModal({
  open,
  onClose,
  hairDresser,
  salonName,
  countryName,
}: {
  open: boolean
  onClose: () => void
  hairDresser: IHairDresser | null
  salonName?: string
  countryName?: string
}) {
  if (!hairDresser) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détails du coiffeur</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <img
            src={hairDresser.photo || "/avatar.jpg"}
            alt={hairDresser.name}
            className="w-24 h-24 object-cover rounded-full border"
          />
          <div className="w-full">
            <div className="mb-2"><span className="font-semibold">Nom :</span> {hairDresser.name}</div>
            <div className="mb-2"><span className="font-semibold">Spécialité :</span> {hairDresser.speciality}</div>
            <div className="mb-2"><span className="font-semibold">Email :</span> {hairDresser.email}</div>
            <div className="mb-2"><span className="font-semibold">Téléphone :</span> {hairDresser.phone}</div>
            <div className="mb-2"><span className="font-semibold">Pays :</span> {countryName}</div>
            <div className="mb-2"><span className="font-semibold">Ville :</span> {hairDresser.city}</div>
            <div className="mb-2"><span className="font-semibold">Salon :</span> {salonName}</div>
            <div className="mb-2"><span className="font-semibold">Statut :</span> <span className={`px-2 py-1 rounded text-xs ${hairDresser.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{hairDresser.status}</span></div>
            <div className="mb-2"><span className="font-semibold">Réservations prises :</span> {hairDresser.reservationsTaken ?? 0}</div>
            <div className="mb-2"><span className="font-semibold">Réservations confirmées :</span> {hairDresser.reservationsConfirmed ?? 0}</div>
            <div className="mb-2"><span className="font-semibold">Réservations faites :</span> {hairDresser.reservationsDone ?? 0}</div>
            <div className="mb-2"><span className="font-semibold">Créé le :</span> {hairDresser.createdAt ? new Date(hairDresser.createdAt).toLocaleString() : "-"}</div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Fermer</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}