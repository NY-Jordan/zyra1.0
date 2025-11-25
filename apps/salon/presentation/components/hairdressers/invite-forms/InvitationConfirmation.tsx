'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import { Separator } from '@zyra/ui/components/separator'
import { User } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

type ContractType = 'commission' | 'salary'

interface WorkingHours {
  [key: string]: { start: string; end: string; active: boolean }
}

interface InvitationConfirmationProps {
  hairDresser: IHairDresser
  workingDays: string[]
  workingHours: WorkingHours
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
  workingDays,
  workingHours,
  contractType,
  commissionRate,
  salary
}: InvitationConfirmationProps) {
  
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
                {workingDays.map(dayKey => {
                  const day = DAYS_OF_WEEK.find(d => d.key === dayKey)
                  const hours = workingHours[dayKey]
                  return (
                    <Badge key={dayKey} variant="outline">
                      {day?.label} ({hours.start} - {hours.end})
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