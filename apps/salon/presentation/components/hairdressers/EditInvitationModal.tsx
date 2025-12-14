'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Separator } from '@zyra/ui/components/separator'
import { Badge } from '@zyra/ui/components/badge'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Percent,
  Save,
  Loader2
} from 'lucide-react'
import { editDocument } from '@zyra/conf/lib/query'
import { IHairDresserInvitation, ContractType } from '@zyra/conf/domain/entities/hairdressers.entities'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { toast } from 'sonner'

interface EditInvitationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitation: IHairDresserInvitation | null
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
]

export default function EditInvitationModal({ open, onOpenChange, invitation }: EditInvitationModalProps) {
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [workingHours, setWorkingHours] = useState<OpeningHour[]>([])
  const [contractType, setContractType] = useState<ContractType>('commission')
  const [commissionRate, setCommissionRate] = useState<number>(30)
  const [salary, setSalary] = useState<number>(0)

  // Initialiser les données quand l'invitation change
  useEffect(() => {
    if (invitation) {
      setWorkingHours(invitation.workingHours)
      setContractType(invitation.contractType)
      setCommissionRate(invitation.commissionRate || 30)
      setSalary(invitation.salary || 0)
    }
  }, [invitation])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!invitation?.id) throw new Error('Invitation non trouvée')

      return await editDocument('hair_dresser_invitations', invitation.id, {
        workingHours,
        contractType,
        commissionRate: contractType === 'commission' ? commissionRate : null,
        salary: contractType === 'salary' ? salary : null
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-invitations'] })
      toast.success('Invitation mise à jour avec succès!')
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  })

  const handleClose = () => {
    setCurrentStep(1)
    onOpenChange(false)
  }

  const handleWorkingDayToggle = (dayKey: string) => {
    const existingHour = workingHours.find(hour => hour.day === dayKey)
    
    let newWorkingHours: OpeningHour[]
    if (existingHour) {
      newWorkingHours = workingHours.map(hour => 
        hour.day === dayKey 
          ? { ...hour, openDay: !hour.openDay }
          : hour
      )
    } else {
      newWorkingHours = [
        ...workingHours,
        { day: dayKey, open: '09:00', close: '18:00', openDay: true }
      ]
    }

    setWorkingHours(newWorkingHours)
  }

  const handleHourChange = (dayKey: string, type: 'open' | 'close', value: string) => {
    const existingHour = workingHours.find(hour => hour.day === dayKey)
    
    if (!existingHour) {
      setWorkingHours([
        ...workingHours,
        { day: dayKey, open: type === 'open' ? value : '09:00', close: type === 'close' ? value : '18:00', openDay: true }
      ])
    } else {
      setWorkingHours(workingHours.map(hour =>
        hour.day === dayKey
          ? { ...hour, [type]: value }
          : hour
      ))
    }
  }

  const formatTimeToFrench = (time: string): string => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    return `${hours}h${minutes}`
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Modifier les horaires'
      case 2: return 'Modifier le contrat'
      case 3: return 'Confirmer les modifications'
      default: return 'Modifier l\'invitation'
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return workingHours.some(hour => hour.openDay)
      case 2: return (
        contractType === 'commission' 
          ? commissionRate > 0
          : salary > 0
      )
      case 3: return true
      default: return false
    }
  }

  if (!invitation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Étape 1: Horaires de travail */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Modifiez les jours et horaires de travail pour {invitation.hairDresserName}
              </div>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const dayHours = workingHours.find(wh => wh.day === day.key)
                  const isChecked = dayHours?.openDay || false
                  
                  return (
                    <Card key={day.key} className={`transition-all ${
                      isChecked ? 'ring-1 ring-primary' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleWorkingDayToggle(day.key)}
                              className="h-4 w-4"
                            />
                            <label className="font-medium">{day.label}</label>
                          </div>
                          
                          {isChecked && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatTimeToFrench(dayHours?.open || '09:00')}</span>
                              <span>à</span>
                              <span className="font-medium">{formatTimeToFrench(dayHours?.close || '18:00')}</span>
                              <div className="ml-2 flex gap-1">
                                <input
                                  type="time"
                                  value={dayHours?.open || ''}
                                  onChange={(e) => handleHourChange(day.key, 'open', e.target.value)}
                                  className="border rounded px-2 py-1 text-xs w-20"
                                  title="Modifier l'heure d'ouverture"
                                />
                                <input
                                  type="time"
                                  value={dayHours?.close || ''}
                                  onChange={(e) => handleHourChange(day.key, 'close', e.target.value)}
                                  className="border rounded px-2 py-1 text-xs w-20"
                                  title="Modifier l'heure de fermeture"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Étape 2: Type de contrat */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Modifiez les conditions du contrat
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    contractType === 'commission' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setContractType('commission')}
                >
                  <CardContent className="p-4 text-center">
                    <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold mb-1">Commission</h4>
                    <p className="text-xs text-muted-foreground">
                      Pourcentage sur les prestations
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    contractType === 'salary' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setContractType('salary')}
                >
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold mb-1">Salaire</h4>
                    <p className="text-xs text-muted-foreground">
                      Montant fixe mensuel
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {contractType === 'commission' ? (
                <div className="space-y-2">
                  <Label>Taux de commission (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le coiffeur recevra {commissionRate}% du montant de chaque prestation
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Salaire mensuel (XAF)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    placeholder="150000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le coiffeur recevra {salary.toLocaleString()} XAF par mois
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Vérifiez les modifications avant de sauvegarder
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Coiffeur</h4>
                      <p className="text-sm">{invitation.hairDresserName}</p>
                      <p className="text-sm text-muted-foreground">{invitation.hairDresserEmail}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Jours de travail</h4>
                      <div className="flex flex-wrap gap-2">
                        {workingHours.filter(wh => wh.openDay).map(workingHour => {
                          const day = DAYS_OF_WEEK.find(d => d.key === workingHour.day)
                          return (
                            <Badge key={workingHour.day} variant="outline">
                              {day?.label} ({formatTimeToFrench(workingHour.open)} - {formatTimeToFrench(workingHour.close)})
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Contrat</h4>
                      <Badge>
                        {contractType === 'commission' 
                          ? `Commission ${commissionRate}%`
                          : `Salaire ${salary.toLocaleString()} XAF/mois`
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                ⚠️ Ces modifications mettront à jour l'invitation. Le coiffeur sera notifié des changements.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => currentStep === 1 ? handleClose() : setCurrentStep(prev => prev - 1)}
              disabled={updateMutation.isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Annuler' : 'Précédent'}
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 3) {
                  updateMutation.mutate()
                } else {
                  setCurrentStep(prev => prev + 1)
                }
              }}
              disabled={!canProceedToNextStep() || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : currentStep === 3 ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
