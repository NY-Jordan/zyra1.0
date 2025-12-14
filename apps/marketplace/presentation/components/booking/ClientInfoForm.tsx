'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Textarea } from '@zyra/ui/components/textarea'
import { User, Phone, Mail, MessageSquare } from 'lucide-react'

interface ClientInfoFormProps {
  formData: {
    clientName: string
    clientPhone: string
    clientEmail: string
    notes: string
  }
  onChange: (field: string, value: string) => void
}

export default function ClientInfoForm({ formData, onChange }: ClientInfoFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vos informations</h2>
        <p className="text-gray-600 mt-1">Complétez vos coordonnées pour finaliser la réservation</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nom complet *
            </Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => onChange('clientName', e.target.value)}
              placeholder="Ex: Jean Dupont"
              required
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="clientPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Téléphone *
            </Label>
            <Input
              id="clientPhone"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => onChange('clientPhone', e.target.value)}
              placeholder="Ex: +237 6XX XX XX XX"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="clientEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email (optionnel)
            </Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => onChange('clientEmail', e.target.value)}
              placeholder="Ex: jean@example.com"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              placeholder="Précisions particulières, préférences..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
