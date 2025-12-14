'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import { Separator } from '@zyra/ui/components/separator'
import { User } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'

type ContractType = 'commission' | 'salary'


interface InvitationConfirmationProps {
  hairDresser: IHairDresser
  workingHours: OpeningHour[]
  contractType: ContractType
  commissionRate?: number
  salary?: number
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

export default function InvitationConfirmation({
  hairDresser,
  workingHours,
  contractType,
  commissionRate,
  salary
}: InvitationConfirmationProps) {
  // Convertir format HH:MM en format français HH:MM (24h)
  const formatTimeToFrench = (time: string): string => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    return `${hours}h${minutes}`
  }
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Vérifiez les informations avant d'envoyer l'invitation
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={hairDresser?.photo} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{hairDresser?.name}</h3>
              <p className="text-sm text-muted-foreground">{hairDresser?.email}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
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

            <div>
              <h4 className="font-medium mb-2">Contrat</h4>
              <Badge>
                {contractType === 'commission' 
                  ? `Commission ${commissionRate}%`
                  : `Salaire ${salary?.toLocaleString()} XAF/mois`
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}