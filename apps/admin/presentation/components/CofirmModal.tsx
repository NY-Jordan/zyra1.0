'use client'
import React, { ReactNode } from 'react'
import { Button } from '@zyra/ui/components/button'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string|ReactNode
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  loading?: boolean
  confirmVariant?: 'default' | 'destructive' | 'outline'
}

export default function ConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmer',
  loading = false,
  confirmVariant = 'default',
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? '...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}