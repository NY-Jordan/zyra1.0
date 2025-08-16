'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@zyra/ui/components/dialog"
import { Button } from "@zyra/ui/components/button"
import { useState } from "react"
import { ISalon } from "@zyra/conf/domain/entities/salons.entities"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"
import { editDocument } from "@zyra/conf/lib/query"
import { toast } from "sonner"

interface SuspendSalonModalProps {
  open: boolean
  onClose: () => void
  salonName: string
  onConfirm?: () => void 
  isSuspended?: boolean
  selectedSalon: ISalon
}

export function SuspendSalonModal({ open, onClose, salonName, onConfirm, isSuspended, selectedSalon }: SuspendSalonModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true)
    await handleSuspendOrActivateConfirm()
    setSubmitting(false)
    onClose()
  }
  const handleSuspendOrActivateConfirm = async () => {
      if (!selectedSalon) return
      setLoading(true)
      const isSuspended = selectedSalon.status.name === SalonStatusEnum.suspended
      await editDocument("salons", selectedSalon.id, {
        status: {
          name: isSuspended ? SalonStatusEnum.active : SalonStatusEnum.suspended
        }
      })
      onConfirm?.()
      setLoading(false)
      toast.success(
        isSuspended
          ? `Le salon ${selectedSalon.name} a été réactivé avec succès.`
          : `Le salon ${selectedSalon.name} a été suspendu avec succès.`
      )
    }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSuspended ? "Réactiver le salon" : "Suspendre le salon"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isSuspended
            ? <>Voulez-vous vraiment <b>réactiver</b> le salon <span className="font-semibold">{salonName}</span> ?</>
            : <>Voulez-vous vraiment <b>suspendre</b> le salon <span className="font-semibold">{salonName}</span> ?</>
          }
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button
            variant={isSuspended ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={submitting || loading}
          >
            {submitting || loading
              ? (isSuspended ? "Réactivation..." : "Suspension...")
              : (isSuspended ? "Réactiver" : "Suspendre")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}