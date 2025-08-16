'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'

interface TimeSlotConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  slot: any
}

export default function TimeSlotConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  slot,
}: TimeSlotConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {slot?.openDay === false ? "Réactiver le créneau" : "Supprimer le créneau"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {slot?.openDay === false
            ? <>Voulez-vous vraiment <b>réactiver</b> le créneau <span className="font-semibold">{slot?.jour || slot?.day}</span> ?</>
            : <>Voulez-vous vraiment <b>supprimer</b> le créneau <span className="font-semibold">{slot?.jour || slot?.day}</span> ?</>
          }
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button
            variant={slot?.openDay === false ? "secondary" : "destructive"}
            onClick={onConfirm}
            disabled={loading}
          >
            {slot?.openDay === false ? "Réactiver" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}