'use client'
import { Button } from '@zyra/ui/components/button'

interface TimeSlotEditModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  openValue: string
  closeValue: string
  setOpenValue: (v: string) => void
  setCloseValue: (v: string) => void
}

export default function TimeSlotEditModal({
  open,
  onClose,
  onConfirm,
  loading,
  openValue,
  closeValue,
  setOpenValue,
  setCloseValue,
}: TimeSlotEditModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
        <div className="mb-4">
          <div className="font-semibold mb-2">Modifier le créneau</div>
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={openValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpenValue(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <span>-</span>
            <input
              type="time"
              value={closeValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCloseValue(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button variant="default" onClick={onConfirm} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  )
}