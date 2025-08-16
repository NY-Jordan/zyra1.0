'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'

interface DeleteServiceModalProps {
  open: boolean
  onClose: () => void
  serviceToDelete: any
  onConfirm?: () => void
  loading?: boolean
}

export default function DeleteServiceModal({ open, onClose, serviceToDelete, onConfirm, loading }: DeleteServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le service</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Voulez-vous vraiment supprimer le service <span className="font-semibold">{serviceToDelete?.name}</span> ?
          Cette action est <span className="text-red-600 font-semibold">définitive</span>.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Confirmer la suppression"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}