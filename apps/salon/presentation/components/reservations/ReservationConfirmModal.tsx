'use client'

import React, { ReactNode } from 'react'
import { Button } from '@zyra/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Loader2 } from 'lucide-react'

type ReservationConfirmModalProps = {
  open: boolean
  title: string
  description: string | ReactNode
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  loading?: boolean
  confirmVariant?: 'default' | 'destructive' | 'outline'
}

export default function ReservationConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmer',
  loading = false,
  confirmVariant = 'default',
}: ReservationConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            {typeof description === 'string' ? (
              <p>{description}</p>
            ) : (
              <div>{description}</div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
