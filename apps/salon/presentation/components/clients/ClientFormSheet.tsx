'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@zyra/ui/components/sheet'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Card, CardContent } from '@zyra/ui/components/card'
import {
  User,
  Phone,
  Mail,
  Plus,
  Loader2
} from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { useCreateClient, useUpdateClient } from '@/usecases/clientsUseCases'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'

interface ClientFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: IClient | null
}

export default function ClientFormSheet({ open, onOpenChange, client }: ClientFormSheetProps) {
  const { salon } = useSalon()
  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()

  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || ''
  })

  React.useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email || ''
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: ''
      })
    }
  }, [client, open])

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: ''
    })
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      return
    }

    if (client) {
      // Mise à jour
      updateClientMutation.mutate(
        {
          clientId: client.id,
          data: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null
          }
        },
        {
          onSuccess: () => handleClose()
        }
      )
    } else {
      // Création
      createClientMutation.mutate(
        {
          salonId: salon?.id || '',
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          history: []
        },
        {
          onSuccess: () => handleClose()
        }
      )
    }
  }

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client ? 'Modifier le client' : 'Nouveau client'}
          </SheetTitle>
          <SheetDescription>
            {client
              ? 'Modifiez les informations du client'
              : 'Ajoutez un nouveau client régulier'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: +237 6XX XX XX XX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ex: jean@example.com"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {client ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {client ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
