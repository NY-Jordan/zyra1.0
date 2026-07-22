'use client'

import React, { useState } from 'react'
import { Star, User, Edit2, Save, X } from 'lucide-react'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@zyra/ui/components/avatar'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { HairDresserWithSalonAssociation } from '@/usecases/useHairDressers'
import { IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zyra/ui/components/select'
import { DAYS_OF_WEEK } from '@zyra/conf/lib/utils'
import { updateSubCollectionDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { hairDresserAssociationNameEnum } from '@zyra/conf/domain/entities/hairdressers.entities'
import { useHasPermission } from '@/hooks/useHasPermission'

interface HairDresserDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hairdresser: HairDresserWithSalonAssociation | null
  categories?: IServiceCategory[]
}

export default function HairDresserDetailsModal({
  open,
  onOpenChange,
  hairdresser,
  categories = [],
}: HairDresserDetailsModalProps) {
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('hairdressers.edit')
  const [isEditing, setIsEditing] = useState(false)
  const [editedServices, setEditedServices] = useState<string[]>([])
  const [editedWorkingHours, setEditedWorkingHours] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [serviceError, setServiceError] = useState('')

  React.useEffect(() => {
    if (hairdresser) {
      setEditedServices(hairdresser.associationHairdresser.salonServiceIds || [])
      setEditedWorkingHours(hairdresser.associationHairdresser.workingHours || [])
    }
  }, [hairdresser, open])

  const handleAddService = (categoryId: string) => {
    if (categoryId && !editedServices.includes(categoryId)) {
      setEditedServices([...editedServices, categoryId])
    }
  }

  const handleRemoveService = (serviceId: string) => {
    setEditedServices(editedServices.filter((s) => s !== serviceId))
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId
  }

  const getRemainingCategories = () => {
    return categories.filter((cat) => !editedServices.includes(cat.id))
  }

  const handleUpdateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...editedWorkingHours]
    updated[index] = { ...updated[index], [field]: value }
    setEditedWorkingHours(updated)
  }

  const handleSaveChanges = async () => {
    setServiceError('')
    
    // Validation: at least one service is required
    if (editedServices.length === 0) {
      setServiceError('Au moins une catégorie de service est obligatoire')
      return
    }

    if (!hairdresser) return

    setIsSaving(true)
    try {
      // Update the subcollection document with new services and working hours
      await updateSubCollectionDocument(
        'hair_dressers',
        hairdresser.id,
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        hairdresser.associationHairdresser.salonId,
        {
          ...hairdresser.associationHairdresser,
          salonServiceIds: editedServices,
          workingHours: editedWorkingHours,
        }
      )
      toast.success('Modifications enregistrées avec succès')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth : 'none' }} className="w-5xl max-h-[90vh] overflow-y-auto dark:bg-slate-900">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="flex items-center gap-2">
              Détails de {hairdresser?.name}
            </DialogTitle>
            {!isEditing && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Éditer
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {hairdresser && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Profile */}
            <div className="col-span-1 space-y-4">
              {/* Profile Photo */}
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={hairdresser.photo} alt={hairdresser.name} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Info */}
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">{hairdresser.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{hairdresser.speciality}</p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(2.5)
                          ? 'fill-yellow-400 text-yellow-400'
                          : i === Math.floor(2.5) && 2.5 % 1 !== 0
                          ? 'fill-yellow-200 text-yellow-400'
                          : 'text-gray-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-slate-400 ml-1">2.5</span>
                </div>

                {/* Status Badge */}
                <Badge
                  className={`inline-block text-xs ${
                    hairdresser.associationHairdresser.active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {hairdresser.associationHairdresser.active ? 'Actif' : 'Suspendu'}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 border-t dark:border-slate-700 pt-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Email</p>
                  <p className="text-sm font-medium break-all">{hairdresser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Téléphone</p>
                  <p className="text-sm font-medium">{hairdresser.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Localisation</p>
                  <p className="text-sm font-medium">
                    {hairdresser.city}, {hairdresser.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Services & Contract */}
            <div className="col-span-2 space-y-4">
              {/* Services */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Catégories de services *</h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Select onValueChange={handleAddService} disabled={getRemainingCategories().length === 0}>
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder={getRemainingCategories().length === 0 ? "Toutes les catégories sont ajoutées" : "Ajouter une catégorie..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {getRemainingCategories().map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {serviceError && (
                      <p className="text-xs text-red-600">{serviceError}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {editedServices.map((serviceId) => (
                        <div
                          key={serviceId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded group"
                        >
                          <span className="text-sm">{getCategoryName(serviceId)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleRemoveService(serviceId)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0 hover:bg-gray-300 dark:hover:bg-slate-600 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedServices.map((serviceId) => (
                      <Badge key={serviceId} variant="secondary">
                        {getCategoryName(serviceId)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Contract Info */}
              <div className="border-t dark:border-slate-700 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Contract Type */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Type de contrat</p>
                    <p className="text-sm font-medium capitalize">
                      {hairdresser.associationHairdresser.contractType || '-'}
                    </p>
                  </div>

                  {/* Commission Rate */}
                  {hairdresser.associationHairdresser.contractType === 'commission' && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Taux de commission</p>
                      <p className="text-sm font-medium">
                        {hairdresser.associationHairdresser.commissionRate
                          ? `${hairdresser.associationHairdresser.commissionRate}%`
                          : '-'}
                      </p>
                    </div>
                  )}

                  {/* Salary */}
                  {hairdresser.associationHairdresser.contractType === 'salary' && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Salaire</p>
                      <p className="text-sm font-medium">
                        {hairdresser.associationHairdresser.salary || '-'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              {editedWorkingHours && editedWorkingHours.length > 0 && (
                <div className="border-t dark:border-slate-700 pt-4 space-y-3">
                  <h4 className="font-semibold text-sm">Horaires de travail</h4>
                  {isEditing ? (
                    <div className="space-y-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const workingHour = editedWorkingHours.find(
                          (h) => h.day === day.label || h.day === day.key
                        )
                        return (
                          <div
                            key={day.key}
                            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded"
                          >
                            <p className="font-medium text-sm w-24">{day.label}</p>
                            <input
                              type="checkbox"
                              checked={workingHour?.openDay ?? false}
                              onChange={(e) => {
                                const index = editedWorkingHours.findIndex(
                                  (h) => h.day === day.label || h.day === day.key
                                )
                                if (index !== -1) {
                                  handleUpdateWorkingHour(index, 'openDay', e.target.checked)
                                }
                              }}
                              className="h-4 w-4"
                            />
                            {workingHour?.openDay && (
                              <>
                                <Input
                                  type="time"
                                  value={workingHour?.open || ''}
                                  onChange={(e) => {
                                    const index = editedWorkingHours.findIndex(
                                      (h) => h.day === day.label || h.day === day.key
                                    )
                                    if (index !== -1) {
                                      handleUpdateWorkingHour(index, 'open', e.target.value)
                                    }
                                  }}
                                  className="text-sm w-24"
                                />
                                <span className="text-gray-400 dark:text-slate-500">-</span>
                                <Input
                                  type="time"
                                  value={workingHour?.close || ''}
                                  onChange={(e) => {
                                    const index = editedWorkingHours.findIndex(
                                      (h) => h.day === day.label || h.day === day.key
                                    )
                                    if (index !== -1) {
                                      handleUpdateWorkingHour(index, 'close', e.target.value)
                                    }
                                  }}
                                  className="text-sm w-24"
                                />
                              </>
                            )}
                            {!workingHour?.openDay && (
                              <span className="text-sm text-gray-600 dark:text-slate-400 italic">Fermé</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editedWorkingHours
                        .filter((h) => h.openDay)
                        .map((hours) => {
                          const dayLabel = DAYS_OF_WEEK.find(
                            (d) => d.label === hours.day || d.key === hours.day
                          )?.label || hours.day
                          return (
                            <div key={hours.day} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <p className="font-medium text-sm w-24">{dayLabel}</p>
                              <p className="text-sm text-gray-600 dark:text-slate-400">
                                {hours.open} - {hours.close}
                              </p>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="border-t dark:border-slate-700 pt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-slate-400">Prises</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {hairdresser.reservationsTaken || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-slate-400">Confirmées</p>
                  <p className="text-lg font-semibold text-green-600">
                    {hairdresser.reservationsConfirmed || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-slate-400">Finies</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    {hairdresser.reservationsDone || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
