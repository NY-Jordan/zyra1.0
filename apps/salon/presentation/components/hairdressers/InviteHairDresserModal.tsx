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
import useSalon from '@/hooks/useSalon'
import {
  SearchHairDresserForm,
  WorkingHoursForm,
  ContractTypeForm,
  InvitationConfirmation
} from './invite-forms'

interface InviteHairDresserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ContractType = 'commission' | 'salary'

interface WorkingHours {
  [key: string]: { start: string; end: string; active: boolean }
}

interface InvitationData {
  hairDresser: IHairDresser | null
  workingDays: string[]
  workingHours: WorkingHours
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
    workingDays: [],
    workingHours: {
      monday: { start: '09:00', end: '18:00', active: false },
      tuesday: { start: '09:00', end: '18:00', active: false },
      wednesday: { start: '09:00', end: '18:00', active: false },
      thursday: { start: '09:00', end: '18:00', active: false },
      friday: { start: '09:00', end: '18:00', active: false },
      saturday: { start: '09:00', end: '18:00', active: false },
      sunday: { start: '09:00', end: '18:00', active: false }
    },
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
        workingDays: data.workingDays,
        workingHours: data.workingHours,
        contractType: data.contractType,
        commissionRate: data.contractType === 'commission' ? data.commissionRate : null,
        salary: data.contractType === 'salary' ? data.salary : null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      }

      return await createDocument('hair_dresser_invitations', invitation)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-hairdressers'] })
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
      workingDays: [],
      workingHours: {
        monday: { start: '09:00', end: '18:00', active: false },
        tuesday: { start: '09:00', end: '18:00', active: false },
        wednesday: { start: '09:00', end: '18:00', active: false },
        thursday: { start: '09:00', end: '18:00', active: false },
        friday: { start: '09:00', end: '18:00', active: false },
        saturday: { start: '09:00', end: '18:00', active: false },
        sunday: { start: '09:00', end: '18:00', active: false }
      },
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

  const handleWorkingDayToggle = (dayKey: string) => {
    setInvitationData(prev => {
      const isCurrentlyActive = prev.workingDays.includes(dayKey)
      const newWorkingDays = isCurrentlyActive 
        ? prev.workingDays.filter(day => day !== dayKey)
        : [...prev.workingDays, dayKey]

      const newWorkingHours = {
        ...prev.workingHours,
        [dayKey]: {
          ...prev.workingHours[dayKey],
          active: !isCurrentlyActive
        }
      }

      return {
        ...prev,
        workingDays: newWorkingDays,
        workingHours: newWorkingHours
      }
    })
  }

  const handleHourChange = (dayKey: string, type: 'start' | 'end', value: string) => {
    setInvitationData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayKey]: {
          ...prev.workingHours[dayKey],
          [type]: value
        }
      }
    }))
  }

  const handleSendInvitation = () => {
    inviteMutation.mutate(invitationData)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Rechercher un coiffeur'
      case 2: return 'Horaires de travail'
      case 3: return 'Type de contrat'
      case 4: return 'Confirmer l\'invitation'
      default: return 'Inviter un coiffeur'
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return !!invitationData.hairDresser
      case 2: return invitationData.workingDays.length > 0
      case 3: return (
        invitationData.contractType === 'commission' 
          ?( invitationData?.commissionRate ? invitationData?.commissionRate  > 0 : false)
          : (invitationData?.salary ? invitationData?.salary > 0 : false)
      )
      case 4 : return true;
      default: return false
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4].map((step) => (
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
          {/* Étape 1: Recherche de coiffeur */}
          {currentStep === 1 && (
            <SearchHairDresserForm
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selectedHairDresser={invitationData.hairDresser}
              onSelectHairDresser={handleSelectHairDresser}
            />
          )}

          {/* Étape 2: Horaires de travail */}
          {currentStep === 2 && invitationData.hairDresser && (
            <WorkingHoursForm
              hairDresser={invitationData.hairDresser}
              workingDays={invitationData.workingDays}
              workingHours={invitationData.workingHours}
              onWorkingDayToggle={handleWorkingDayToggle}
              onHourChange={handleHourChange}
            />
          )}

          {/* Étape 3: Type de contrat */}
          {currentStep === 3 && (
            <ContractTypeForm
              contractType={invitationData.contractType}
              commissionRate={invitationData.commissionRate}
              salary={invitationData.salary}
              onContractTypeChange={(type) => setInvitationData(prev => ({ ...prev, contractType: type }))}
              onCommissionRateChange={(rate) => setInvitationData(prev => ({ ...prev, commissionRate: rate }))}
              onSalaryChange={(salary) => setInvitationData(prev => ({ ...prev, salary }))}
            />
          )}

          {/* Étape 4: Confirmation */}
          {currentStep === 4 && invitationData.hairDresser && (
            <InvitationConfirmation
              hairDresser={invitationData.hairDresser}
              workingDays={invitationData.workingDays}
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
                if (currentStep === 4) {
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
              ) : currentStep === 4 ? (
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