'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { useState } from "react"
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { deleteDocument, fetchCollection } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { where } from 'firebase/firestore'

interface DeleteSalonModalProps {
  open: boolean
  onClose: () => void
  salonToDelete: ISalon
  onConfirm?: () => void
  loading?: boolean
}

export default function DeleteSalonModal({ open, onClose, salonToDelete, onConfirm, loading }: DeleteSalonModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    setSubmitting(true)
    await handleDeleteConfirm();
    await onConfirm?.()
    setSubmitting(false)
    onClose()
  }

  const handleDeleteConfirm = async () => {
    if (!salonToDelete) return
    await deleteDocument("salons", salonToDelete.id)
    const otherSalons = await fetchCollection("salons", [
        where("ownerId", "==", salonToDelete.ownerId)
    ])
    const remainingSalons = otherSalons.filter(
      (s: any) => s.ownerId === salonToDelete.ownerId && s.id !== salonToDelete.id
    )
    if (remainingSalons.length === 0 && salonToDelete.ownerId) {
      await deleteDocument("owners", salonToDelete.ownerId)
      toast.success(`Le salon ${salonToDelete.name} et son gérant ont été supprimés.`)
    } else {
      toast.success(`Le salon ${salonToDelete.name} a été supprimé avec succès.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le salon</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Voulez-vous vraiment supprimer le salon <span className="font-semibold">{salonToDelete.name}</span> ?
          Cette action est <span className="text-red-600 font-semibold">définitive</span>.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting || loading}>Annuler</Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting || loading}
          >
            {submitting || loading ? "Suppression..." : "Confirmer la suppression"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
