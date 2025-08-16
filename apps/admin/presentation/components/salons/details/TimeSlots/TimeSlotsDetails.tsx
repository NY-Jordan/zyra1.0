'use client'
import { Button } from '@zyra/ui/components/button'
import { Pencil, Plus, Trash2, RotateCcw } from 'lucide-react'
import React, { useState } from 'react'
import { editDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import TimeSlotConfirmModal from './TimeSlotConfirmModal'
import TimeSlotEditModal from './TimeSlotEditModal'
import { useQueryClient } from "@tanstack/react-query"

export default function TimeSlotsDetails({ timeSlots, salon }: { timeSlots: any[], salon: ISalon }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editSlot, setEditSlot] = useState<any>(null)
  const [editOpen, setEditOpen] = useState("")
  const [editClose, setEditClose] = useState("")
  const queryClient = useQueryClient()

  const handleDeleteClick = (slot: any) => {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedSlot) return
    setLoading(true)
    try {
      const updatedSlots = timeSlots.map((slot) =>
        slot === selectedSlot ? { ...slot, openDay: !slot.openDay } : slot
      )
      await editDocument("salons", salon.id, { openingHours: updatedSlots })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success(
        selectedSlot.openDay
          ? "Créneau supprimé (désactivé) avec succès."
          : "Créneau réactivé avec succès."
      )
    } catch (e) {
      toast.error("Erreur lors de la modification du créneau")
    }
    setLoading(false)
    setModalOpen(false)
    setSelectedSlot(null)
  }

  const handleEditClick = (slot: any) => {
    setEditSlot(slot)
    setEditOpen(slot.open || "")
    setEditClose(slot.close || "")
    setEditModalOpen(true)
  }

  const handleEditConfirm = async () => {
    if (!editSlot) return
    setLoading(true)
    try {
      const updatedSlots = timeSlots.map((slot) =>
        slot === editSlot ? { ...slot, open: editOpen, close: editClose } : slot
      )
      await editDocument("salons", salon.id, { openingHours: updatedSlots })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Créneau modifié avec succès.")
    } catch (e) {
      toast.error("Erreur lors de la modification du créneau")
    }
    setLoading(false)
    setEditModalOpen(false)
    setEditSlot(null)
  }

  return (
    <div className="mb-8 mt-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Créneaux disponibles</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Jour</th>
              <th className="px-4 py-2 text-left">Heures</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(timeSlots || []).map((c: any, i: number) => {
              const isDisabled = c.openDay === false
              return (
                <tr
                  key={i}
                  className={`border-t ${isDisabled ? "bg-red-50 text-red-600" : ""}`}
                >
                  <td className="px-4 py-2">{ c.day}</td>
                  <td className="px-4 py-2">{(c.open && c.close ? `${c.open} - ${c.close}` : "")}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleEditClick(c)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={isDisabled ? "secondary" : "destructive"}
                      className={isDisabled ? "border border-red-300" : ""}
                      onClick={() => handleDeleteClick(c)}
                    >
                      {isDisabled ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <TimeSlotConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        slot={selectedSlot}
      />
      {/* edit modal */}
      <TimeSlotEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={handleEditConfirm}
        loading={loading}
        openValue={editOpen}
        closeValue={editClose}
        setOpenValue={setEditOpen}
        setCloseValue={setEditClose}
      />
    </div>
  )
}
