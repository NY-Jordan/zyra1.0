'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Textarea } from '@zyra/ui/components/textarea'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import {
  User,
  Phone,
  Mail,
  Scissors,
  Users,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react'
import { fetchCollection, createDocument, editDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import useSalon from '@/hooks/useSalon'
import { toast } from 'sonner'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'
import { useHairDressers } from '@/usecases/useHairDressers'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import ClientSearchModal from './ClientSearchModal'

interface NewOrderSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
  supplements?: Array<{
    name: string
    price: number
    duration: number
  }>
}

export default function NewOrderSheet({ open, onOpenChange }: NewOrderSheetProps) {
  const { salon } = useSalon()
  const { hairDressers} = useHairDressers();
  const queryClient = useQueryClient()
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false)

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: '',
    hairDresserId: '',
    supplements: [] as string[],
    paymentMethod: 'cash' as 'cash' | 'mobile',
    isPaid: true,
    notes: '',
    saveAsRegularClient: false
  })


  
  // Mutation pour créer la commande
  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!salon?.id) throw new Error('Salon non trouvé')
      const selectedService = salon?.services.find(s => s.id === data.serviceId)
      const selectedHairDresser = hairDressers.find(h => h.id === data.hairDresserId)
      if (!selectedService) throw new Error('Service non trouvé')
      if (!selectedHairDresser) throw new Error('Coiffeur non trouvé')
      // Calculer le prix des suppléments
      let supplementsPrice = 0
      const supplementNames: string[] = []
      data.supplements.forEach(suppName => {
        const supp = selectedService.supplements?.find(s => s.name === suppName)
        if (supp) {
          supplementsPrice += supp.price
          supplementNames.push(supp.name)
        }
      })
      const totalPrice = selectedService.price + supplementsPrice

      // Créer la commande
      const orderData = {
        salonId: salon.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        hairDresserId: selectedHairDresser.id,
        hairDresserName: selectedHairDresser.name,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || null,
        price: selectedService.price,
        supplements: supplementNames,
        supplementsPrice,
        totalPrice,
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid,
        status: 'completed',
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        clientId: null as string | null
      }

      // Si on doit enregistrer le client comme régulier
      if (data.saveAsRegularClient) {
        // Vérifier si le client existe déjà
        const existingClients = await fetchCollection('clients', [
          where('salonId', '==', salon.id),
          where('phone', '==', data.clientPhone),
          where('name', '==', data.clientName),
        ])

        let clientId: string
        console.log(existingClients);
        if (existingClients.length > 0) {
          // Client existe déjà, on récupère son ID
          clientId = existingClients[0].id
        } else {
          // Créer un nouveau client
          const newClient: Omit<IClient, 'id'> = {
            salonId: salon.id,
            name: data.clientName,
            phone: data.clientPhone,
            email: data.clientEmail || null,
            history: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          clientId = await createDocument('clients', newClient)
        }

        orderData.clientId = clientId
      }

      const orderId = await createDocument('orders', orderData)

      // Si on a créé/utilisé un client, mettre à jour son historique
      if (orderData.clientId) {
        const client = await fetchCollection('clients', [
          where('id', '==', orderData.clientId),
        ])
        if (client.length > 0) {
          const existingHistory = client[0].history || []
          await editDocument('clients', orderData.clientId, {
            ...client[0],
            history: [...existingHistory, orderId],
            updatedAt: new Date().toISOString()
          })
        }
      }
      return orderId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Commande créée avec succès!')
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la commande')
    }
  })

  const handleClose = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      serviceId: '',
      hairDresserId: '',
      supplements: [],
      paymentMethod: 'cash',
      isPaid: true,
      notes: '',
      saveAsRegularClient: false
    })
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientName || !formData.clientPhone || !formData.serviceId || !formData.hairDresserId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    createOrderMutation.mutate(formData)
  }

  const handleSupplementToggle = (supplementName: string) => {
    setFormData(prev => ({
      ...prev,
      supplements: prev.supplements.includes(supplementName)
        ? prev.supplements.filter(s => s !== supplementName)
        : [...prev.supplements, supplementName]
    }))
  }

  const selectedService = salon?.services.find(s => s.id === formData.serviceId)
  const servicePrice = selectedService?.price || 0
  const supplementsPrice = formData.supplements.reduce((acc, suppName) => {
    const supp = selectedService?.supplements?.find(s => s.name === suppName)
    return acc + (supp?.price || 0)
  }, 0)
  const totalPrice = servicePrice + supplementsPrice

  const handleImportClient = (client: IClient) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || '',
      saveAsRegularClient: true
    }))
  }

  return (
    <Sheet open={open}  onOpenChange={onOpenChange}>
      <SheetContent style={{ maxWidth : 'none' }} className=" xs:w-2/3 sm:w-1/2  md:w-1/3 px-3 pb-3 max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvelle Commande
          </SheetTitle>
          <SheetDescription>
            Créez une nouvelle commande pour un client
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informations Client */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations Client
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClientSearchOpen(true)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Importer un client
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nom complet *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Téléphone *</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="Ex: +237 6XX XX XX XX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email (optionnel)</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="Ex: jean@example.com"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="saveAsRegularClient"
                  checked={formData.saveAsRegularClient}
                  onChange={(e) => setFormData(prev => ({ ...prev, saveAsRegularClient: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="saveAsRegularClient" className="cursor-pointer">
                  Enregistrer comme client régulier
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Coiffeur */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Coiffeur
              </h3>

              <div className="space-y-2">
                <Label htmlFor="hairDresser">Sélectionner un coiffeur *</Label>
                <select
                  id="hairDresser"
                  value={formData.hairDresserId}
                  onChange={(e) => setFormData(prev => ({ ...prev, hairDresserId: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">-- Choisir un coiffeur --</option>
                  {hairDressers.map((hd) => (
                    <option key={hd.id} value={hd.id}>
                      {hd.name} - {hd.speciality}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Service et Suppléments */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Service
              </h3>

              <div className="space-y-2">
                <Label htmlFor="service">Sélectionner un service *</Label>
                <select
                  id="service"
                  value={formData.serviceId}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      serviceId: e.target.value,
                      supplements: []
                    }))
                  }}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">-- Choisir un service --</option>
                  {salon?.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price.toLocaleString()} XAF
                    </option>
                  ))}
                </select>
              </div>

              {/* Suppléments */}
              {selectedService?.supplements && selectedService.supplements.length > 0 && (
                <div className="space-y-2">
                  <Label>Suppléments (optionnels)</Label>
                  <div className="space-y-2">
                    {selectedService.supplements.map((supplement : ISalonServiceSupplement) => (
                      <label
                        key={supplement.name}
                        className="flex items-center gap-2 p-2 border dark:border-slate-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.supplements.includes(supplement.name)}
                          onChange={() => handleSupplementToggle(supplement.name)}
                          className="h-4 w-4"
                        />
                        <span className="flex-1">{supplement.name}</span>
                        <span className="font-medium">{supplement.price.toLocaleString()} XAF</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Prix total */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prix du service:</span>
                  <span>{servicePrice.toLocaleString()} XAF</span>
                </div>
                {supplementsPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Suppléments:</span>
                    <span>{supplementsPrice.toLocaleString()} XAF</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{totalPrice.toLocaleString()} XAF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Paiement
              </h3>

              <div className="space-y-2">
                <Label>Méthode de paiement *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      formData.paymentMethod === 'cash'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Banknote className="h-6 w-6" />
                    <span className="font-medium">Espèces</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'mobile' }))}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      formData.paymentMethod === 'mobile'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Smartphone className="h-6 w-6" />
                    <span className="font-medium">Mobile Money</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPaid" className="cursor-pointer">
                  Paiement effectué
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Ajoutez des notes supplémentaires..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={createOrderMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la commande
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>

      {/* Client Search Modal */}
      <ClientSearchModal
        open={isClientSearchOpen}
        onOpenChange={setIsClientSearchOpen}
        onSelectClient={handleImportClient}
      />
    </Sheet>
  )
}
