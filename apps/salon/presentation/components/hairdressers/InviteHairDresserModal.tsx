'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Separator } from '@zyra/ui/components/separator'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Mail,
  Phone,
  Clock,
  Calendar,
  DollarSign,
  Percent,
  Send,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { fetchCollection, createDocument } from '@zyra/conf/lib/query'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { toast } from 'sonner'
import useSalon from '@zyra/core/hooks/useSalon'
import { logActivity, createNotification, getCurrentActor } from '@zyra/core/usecases/notificationsUseCases'
import {
  SearchHairDresserForm,
  ServiceSelectionForm,
  WorkingHoursForm,
  ContractTypeForm,
  InvitationConfirmation
} from './invite-forms'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'

interface InviteHairDresserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ContractType = 'commission' | 'salary'


interface InvitationData {
  hairDresser: IHairDresser | null
  selectedServiceIds: string[]
  workingHours: OpeningHour[]
  contractType: ContractType
  commissionRate?: number
  salary?: number
}



export default function InviteHairDresserModal({ open, onOpenChange }: InviteHairDresserModalProps) {
  const { salon } = useSalon()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [invitationData, setInvitationData] = useState<InvitationData>({
    hairDresser: null,
    selectedServiceIds: [],
    workingHours: salon?.openingHours ?? [],
    contractType: 'commission',
    commissionRate: 30,
    salary: 0
  })



  // Mutation pour envoyer l'invitation
  const inviteMutation = useMutation({
    mutationFn: async (data: InvitationData) => {
      if (!salon?.id || !data.hairDresser) {
        throw new Error('Données manquantes pour l\'invitation')
      }
      const invitation = {
        salonId: salon.id,
        salonName: salon.name,
        hairDresserId: data.hairDresser.id,
        hairDresserName: data.hairDresser.name,
        hairDresserEmail: data.hairDresser.email,
        selectedServiceIds: data.selectedServiceIds,
        workingHours: data.workingHours,
        contractType: data.contractType,
        commissionRate: data.contractType === 'commission' ? data.commissionRate : null,
        salary: data.contractType === 'salary' ? data.salary : null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      }
      const invitationId = await createDocument('hair_dresser_invitations', invitation)
      await Promise.all([
        logActivity({
          salonId: salon.id,
          ...getCurrentActor(),
          type: 'hairdresser_invitation_created',
          action: 'invited',
          resourceId: data.hairDresser.id,
          resourceType: 'invitation',
          resourceLabel: data.hairDresser.name,
        }),
        createNotification({
          salonId: salon.id,
          type: 'hairdresser_invitation_created',
          title: 'Invitation coiffeur envoyée',
          body: data.hairDresser.name,
          resourceId: data.hairDresser.id,
          resourceType: 'invitation',
        }),
      ])
      return invitationId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Invitation envoyée avec succès!')
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation')
    }
  })

  const handleClose = () => {
    setCurrentStep(1)
    setSearchTerm('')
    setInvitationData({
      hairDresser: null,
      selectedServiceIds: [],
      workingHours: salon?.openingHours ?? [],
      contractType: 'commission',
      commissionRate: 30,
      salary: 0
    })
    onOpenChange(false)
  }

  const handleSelectHairDresser = (hairDresser: IHairDresser) => {
    setInvitationData(prev => ({ ...prev, hairDresser }))
    setCurrentStep(2)
  }

  const handleServiceToggle = (serviceId: string) => {
    setInvitationData(prev => {
      const isSelected = prev.selectedServiceIds.includes(serviceId)
      return {
        ...prev,
        selectedServiceIds: isSelected
          ? prev.selectedServiceIds.filter(id => id !== serviceId)
          : [...prev.selectedServiceIds, serviceId]
      }
    })
  }

  const handleWorkingDayToggle = (dayKey: string) => {
    setInvitationData(prev => {
      const existingHour = prev.workingHours.find(hour => hour.day === dayKey)
      
      let newWorkingHours: OpeningHour[]
      if (existingHour) {
        // Si le jour existe, on toggle openDay
        newWorkingHours = prev.workingHours.map(hour => 
          hour.day === dayKey 
            ? { ...hour, openDay: !hour.openDay }
            : hour
        )
      } else {
        // Si le jour n'existe pas, on le crée avec openDay: true
        newWorkingHours = [
          ...prev.workingHours,
          { day: dayKey, open: '09:00', close: '18:00', openDay: true }
        ]
      }

      return {
        ...prev,
        workingHours: newWorkingHours
      }
    })
  }

  const handleHourChange = (dayKey: string, type: 'open' | 'close', value: string) => {
    setInvitationData(prev => {
      const existingHour = prev.workingHours.find(hour => hour.day === dayKey)
      
      if (!existingHour) {
        // Si le jour n'existe pas, on le crée
        return {
          ...prev,
          workingHours: [
            ...prev.workingHours,
            { day: dayKey, open: type === 'open' ? value : '09:00', close: type === 'close' ? value : '18:00', openDay: true }
          ]
        }
      }
      
      return {
        ...prev,
        workingHours: prev.workingHours.map(hour =>
          hour.day === dayKey
            ? { ...hour, [type]: value }
            : hour
        )
      }
    })
  }

  const handleBreakToggle = (dayKey: string) => {
    setInvitationData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(hour =>
        hour.day === dayKey
          ? { ...hour, breaks: hour.breaks?.length ? [] : [{ start: '12:00', end: '13:00' }] }
          : hour
      )
    }))
  }

  const handleBreakChange = (dayKey: string, type: 'start' | 'end', value: string) => {
    setInvitationData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(hour =>
        hour.day === dayKey
          ? { ...hour, breaks: [{ ...(hour.breaks?.[0] ?? { start: '12:00', end: '13:00' }), [type]: value }] }
          : hour
      )
    }))
  }

  const handleSendInvitation = () => {
    inviteMutation.mutate(invitationData)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Rechercher un coiffeur'
      case 2: return 'Services du coiffeur'
      case 3: return 'Horaires de travail'
      case 4: return 'Type de contrat'
      case 5: return 'Confirmer l\'invitation'
      default: return 'Inviter un coiffeur'
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return !!invitationData.hairDresser
      case 2: return invitationData.selectedServiceIds.length > 0
      case 3: return invitationData.workingHours.some(hour => hour.openDay)
      case 4: return (
        invitationData.contractType === 'commission' 
          ?( invitationData?.commissionRate ? invitationData?.commissionRate  > 0 : false)
          : (invitationData?.salary ? invitationData?.salary > 0 : false)
      )
      case 5 : return true;
      default: return false
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Étape 1: Recherche de coiffeur */}
          {currentStep === 1 && (
            <SearchHairDresserForm
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selectedHairDresser={invitationData.hairDresser}
              onSelectHairDresser={handleSelectHairDresser}
            />
          )}

          {/* Étape 2: Sélection des services */}
          {currentStep === 2 && (
            <ServiceSelectionForm
              selectedCategoryIds={invitationData.selectedServiceIds}
              onCategoryToggle={handleServiceToggle}
            />
          )}

          {/* Étape 3: Horaires de travail */}
          {currentStep === 3 && invitationData.hairDresser && (
            <WorkingHoursForm
              hairDresser={invitationData.hairDresser}
              workingHours={invitationData.workingHours}
              onWorkingDayToggle={handleWorkingDayToggle}
              onHourChange={handleHourChange}
              onBreakToggle={handleBreakToggle}
              onBreakChange={handleBreakChange}
              salonOpeningHours={salon?.openingHours}
            />
          )}

          {/* Étape 4: Type de contrat */}
          {currentStep === 4 && (
            <ContractTypeForm
              contractType={invitationData.contractType}
              commissionRate={invitationData.commissionRate}
              salary={invitationData.salary}
              onContractTypeChange={(type) => setInvitationData(prev => ({ ...prev, contractType: type }))}
              onCommissionRateChange={(rate) => setInvitationData(prev => ({ ...prev, commissionRate: rate }))}
              onSalaryChange={(salary) => setInvitationData(prev => ({ ...prev, salary }))}
            />
          )}

          {/* Étape 5: Confirmation */}
          {currentStep === 5 && invitationData.hairDresser && (
            <InvitationConfirmation
              hairDresser={invitationData.hairDresser}
              workingHours={invitationData.workingHours}
              contractType={invitationData.contractType}
              commissionRate={invitationData.commissionRate}
              salary={invitationData.salary}
            />
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => currentStep === 1 ? handleClose() : setCurrentStep(prev => prev - 1)}
              disabled={inviteMutation.isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Annuler' : 'Précédent'}
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 5) {
                  handleSendInvitation()
                } else {
                  setCurrentStep(prev => prev + 1)
                }
              }}
              disabled={!canProceedToNextStep() || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : currentStep === 5 ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer l'invitation
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