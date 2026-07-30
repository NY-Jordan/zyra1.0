'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Clock, Edit, Save, X, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { editDocument } from '@zyra/conf/lib/query'
import { ISalon, OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { DAYS_OF_WEEK } from '@zyra/conf/lib/utils'
import { logActivity, getCurrentActor } from '@zyra/core/usecases/notificationsUseCases'
import { useHasPermission } from '@/hooks/useHasPermission'

interface SalonOpeningHoursProps {
  salon: ISalon
  onUpdate: () => void
}


export default function SalonOpeningHours({ salon, onUpdate }: SalonOpeningHoursProps) {
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('settings.hours')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingSlot, setEditingSlot] = useState<OpeningHour | null>(null)
  const [editOpen, setEditOpen] = useState("")
  const [editClose, setEditClose] = useState("")

  const timeSlots = salon.openingHours || []

  const handleEditClick = (slot: OpeningHour) => {
    setEditingSlot(slot)
    setEditOpen(slot.open || "09:00")
    setEditClose(slot.close || "18:00")
    setIsEditing(true)
  }

  const handleToggleDay = async (slot: OpeningHour) => {
    setLoading(true)
    try {
      const updatedSlots = timeSlots.map((s) =>
        s.day === slot.day ? { ...s, openDay: !s.openDay } : s
      )
      await editDocument("salons", salon.id, { openingHours: updatedSlots })
      await logActivity({
        salonId: salon.id,
        ...getCurrentActor(),
        type: 'salon_hours_updated',
        action: slot.openDay ? 'closed' : 'opened',
        resourceId: salon.id,
        resourceType: 'salon',
        resourceLabel: slot.day,
        metadata: { statut: slot.openDay ? 'Fermé' : 'Ouvert' },
      })
      toast.success(
        slot.openDay
          ? "Jour fermé avec succès"
          : "Jour réouvert avec succès"
      )
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error("Erreur lors de la modification")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingSlot) return
    setLoading(true)
    try {
      const updatedSlots = timeSlots.map((slot) =>
        slot.day === editingSlot.day 
          ? { ...slot, day: editingSlot.day, open: editOpen, close: editClose, openDay: true }
          : slot
      )
      await editDocument("salons", salon.id, { openingHours: updatedSlots })
      await logActivity({
        salonId: salon.id,
        ...getCurrentActor(),
        type: 'salon_hours_updated',
        action: 'updated',
        resourceId: salon.id,
        resourceType: 'salon',
        resourceLabel: editingSlot.day,
        metadata: { heures: `${editOpen} - ${editClose}` },
      })
      toast.success("Horaires mis à jour avec succès")
      setIsEditing(false)
      setEditingSlot(null)
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error("Erreur lors de la mise à jour des horaires")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingSlot(null)
    setEditOpen("")
    setEditClose("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Horaires d'ouverture</CardTitle>
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800">
                <th className="px-4 py-2 text-left">Jour</th>
                <th className="px-4 py-2 text-left">Heures</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, index) => {
                const isDisabled = slot.openDay === false
                const isCurrentlyEditing = editingSlot?.day === slot.day && isEditing
                return (
                  <tr
                    key={slot.day || index}
                    className={`border-t dark:border-slate-700 ${isDisabled ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : ""}`}
                  >
                    <td className="px-4 py-2 font-medium">
                      {slot.day}
                    </td>
                    <td className="px-4 py-2">
                      {isCurrentlyEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={editOpen}
                            onChange={(e) => setEditOpen(e.target.value)}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">à</span>
                          <Input
                            type="time"
                            value={editClose}
                            onChange={(e) => setEditClose(e.target.value)}
                            className="w-24"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {slot.openDay && slot.open && slot.close ? (
                            <>
                              <Clock className="h-4 w-4 text-green-600" />
                              <span>{slot.open} - {slot.close}</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-red-600" />
                              <span className="text-muted-foreground">Fermé</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        {!isCurrentlyEditing && canEdit && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditClick(slot)}
                              disabled={loading}
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant={isDisabled ? "secondary" : "destructive"}
                              className={isDisabled ? "border border-red-300" : ""}
                              onClick={() => handleToggleDay(slot)}
                              disabled={loading}
                            >
                              {isDisabled ? (
                                <>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Réouvrir
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Fermer
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {timeSlots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun horaire configuré</p>
            <p className="text-sm">Les horaires seront générés automatiquement lors de la configuration initiale</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}