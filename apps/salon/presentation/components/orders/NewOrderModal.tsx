'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Input } from '@zyra/ui/components/input'
import { Textarea } from '@zyra/ui/components/textarea'
import {
  User,
  Scissors,
  Users,
  Banknote,
  Smartphone,
  Plus,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Receipt,
  UserCheck,
  Info,
} from 'lucide-react'
import { fetchCollection, createDocument, editDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { useSalon } from '@/hooks/useSalon'
import { toast } from 'sonner'
import { logActivity, getCurrentActor } from '@/usecases/notificationsUseCases'
import { getPhonePrefix } from '@/utils/phonePrefix'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'
import { useHairDressers } from '@/usecases/useHairDressers'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import ClientSearchModal from './ClientSearchModal'

interface NewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = [
  { label: 'Client', icon: User },
  { label: 'Service', icon: Scissors },
  { label: 'Paiement', icon: Receipt },
]

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center px-1">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        const Icon = step.icon
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/30'
                    : 'bg-[#F5F2EF] dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  active || done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-colors ${
                  i < current ? 'bg-emerald-400' : 'bg-[#F0EAE4] dark:bg-slate-700'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id?: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ── Selectable row (suppléments / méthode de paiement) ────────────────────────

function SelectableRow({
  selected,
  onClick,
  icon,
  label,
  meta,
}: {
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
  label: string
  meta?: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
          : 'border-[#F0EAE4] dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800/60'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{label}</span>
      </span>
      <span className="flex items-center gap-2 flex-shrink-0">
        {meta}
        <span
          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors ${
            selected ? 'bg-emerald-500' : 'bg-[#F0EAE4] dark:bg-slate-700'
          }`}
        >
          {selected && <Check className="w-2.5 h-2.5 text-white" />}
        </span>
      </span>
    </button>
  )
}

// ── Field label ───────────────────────────────────────────────────────────────

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
      {children}
    </label>
  )
}

export default function NewOrderModal({ open, onOpenChange }: NewOrderModalProps) {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()
  const queryClient = useQueryClient()
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [duplicateClient, setDuplicateClient] = useState<IClient | null>(null)

  const phonePrefix = getPhonePrefix(salon?.country ?? '')

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: phonePrefix,
    clientEmail: '',
    linkedClientId: null as string | null,
    serviceId: '',
    hairDresserId: '',
    supplements: [] as string[],
    paymentMethod: 'cash' as 'cash' | 'mobile',
    isPaid: true,
    notes: '',
    saveAsRegularClient: false,
  })

  // En saisie manuelle, on vérifie (avec un léger débounce) si un client existe déjà
  // avec ce numéro — qu'on ait coché "client régulier" ou non, on signale toujours sa
  // présence. Si en plus la case est cochée, l'étape suivante sera bloquée tant que ce
  // doublon n'est pas résolu (import, décocher, ou changement de numéro).
  useEffect(() => {
    if (formData.linkedClientId || !formData.clientPhone || !salon?.id) {
      setDuplicateClient(null)
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const matches = await fetchCollection('clients', [
          where('salonId', '==', salon.id),
          where('phone', '==', formData.clientPhone),
        ]) as IClient[]
        setDuplicateClient(matches[0] ?? null)
      } catch {
        setDuplicateClient(null)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [formData.clientPhone, formData.linkedClientId, salon?.id])

  // Mutation pour créer la commande
  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!salon?.id) throw new Error('Salon non trouvé')
      const selectedService = salon?.services.find(s => s.id === data.serviceId)
      const selectedHairDresser = hairDressers.find(h => h.id === data.hairDresserId)
      if (!selectedService) throw new Error('Service non trouvé')
      if (!selectedHairDresser) throw new Error('Coiffeur non trouvé')
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
        clientId: null as string | null,
      }

      if (data.linkedClientId) {
        // Client importé via la recherche : on utilise directement son ID,
        // pas de re-recherche par nom/téléphone (fragile en cas de doublons).
        orderData.clientId = data.linkedClientId
      } else if (data.saveAsRegularClient) {
        // Saisie manuelle + "client régulier" coché : le client n'existe pas encore, on le crée.
        const newClient: Omit<IClient, 'id'> = {
          salonId: salon.id,
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail || null,
          history: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        orderData.clientId = await createDocument('clients', newClient)
      }

      const orderId = await createDocument('orders', orderData)

      await logActivity({
        salonId: salon.id,
        type: 'order_created',
        ...getCurrentActor(),
        action: 'created',
        resourceId: orderId,
        resourceType: 'order',
        resourceLabel: `Commande de ${orderData.clientName} — ${selectedService.name}`,
        metadata: { montant: `${orderData.totalPrice} XAF`, coiffeur: selectedHairDresser.name },
      })

      if (orderData.clientId) {
        const client = await fetchCollection('clients', [where('id', '==', orderData.clientId)])
        if (client.length > 0) {
          const existingHistory = client[0].history || []
          await editDocument('clients', orderData.clientId, {
            ...client[0],
            history: [...existingHistory, { id: orderId, type: 'order' }],
            updatedAt: new Date().toISOString(),
          })
        }
      }
      return orderId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['salon-clients'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Commande créée avec succès!')
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la commande')
    },
  })

  const handleClose = () => {
    setFormData({
      clientName: '',
      clientPhone: phonePrefix,
      clientEmail: '',
      linkedClientId: null,
      serviceId: '',
      hairDresserId: '',
      supplements: [],
      paymentMethod: 'cash',
      isPaid: true,
      notes: '',
      saveAsRegularClient: false,
    })
    setDuplicateClient(null)
    setStep(0)
    onOpenChange(false)
  }

  const handleSubmit = () => {
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
        : [...prev.supplements, supplementName],
    }))
  }

  // Choisir un service réinitialise le coiffeur : il peut ne pas être qualifié pour le nouveau service
  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, serviceId, supplements: [], hairDresserId: '' }))
  }

  const selectedService = salon?.services.find(s => s.id === formData.serviceId)
  const selectedHairDresser = hairDressers.find(h => h.id === formData.hairDresserId)

  // Coiffeurs qualifiés pour le service sélectionné : l'association coiffeur-salon
  // stocke des IDs de catégories de service (champ "salonServiceIds", malgré son nom),
  // donc on compare à la catégorie du service, pas à son ID direct.
  const qualifiedHairDressers = selectedService
    ? hairDressers.filter(hd => hd.associationHairdresser?.salonServiceIds?.includes(selectedService.categoryId))
    : []
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
      linkedClientId: client.id,
      saveAsRegularClient: true,
    }))
  }

  // Désassocie le client importé : les champs redeviennent vides et modifiables
  const handleRemoveImportedClient = () => {
    setFormData(prev => ({
      ...prev,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      linkedClientId: null,
      saveAsRegularClient: false,
    }))
  }

  const canProceedStep0 = !!formData.clientName && !!formData.clientPhone
  const canProceedStep1 = !!formData.serviceId && !!formData.hairDresserId

  const goNext = () => {
    if (step === 0 && !canProceedStep0) {
      toast.error('Renseignez au moins le nom et le téléphone du client')
      return
    }
    if (step === 0 && formData.saveAsRegularClient && duplicateClient) {
      toast.error(`"${duplicateClient.name}" existe déjà avec ce numéro : importez-le ou décochez "client régulier"`)
      return
    }
    if (step === 1 && !canProceedStep1) {
      toast.error('Sélectionnez un coiffeur et un service')
      return
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }
  const goBack = () => setStep(s => Math.max(s - 1, 0))

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0"
      >
        <DialogTitle className="sr-only">Nouvelle commande</DialogTitle>

        {/* type="button" partout + preventDefault ici : évite qu'une soumission native
            du <form> (ex. touche Entrée) ne crée la commande avant l'étape paiement */}
        <form onSubmit={e => e.preventDefault()}>
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-[#F0EAE4] dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                    Nouvelle commande
                  </h2>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500">
                    Étape {step + 1} sur {STEPS.length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fermer"
                className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <Stepper current={step} />
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">

            {/* ── Step 0 : Client ── */}
            {step === 0 && (
              <div className="space-y-4">
                {formData.linkedClientId ? (
                  <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Client existant importé
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImportedClient}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsClientSearchOpen(true)}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[13px] font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Importer un client existant
                  </button>
                )}

                <div>
                  <FieldLabel htmlFor="clientName">Nom complet *</FieldLabel>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Ex: Jean Dupont"
                    className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 disabled:opacity-60 disabled:bg-[#F8F4F0] dark:disabled:bg-slate-800/40"
                    disabled={!!formData.linkedClientId}
                    required
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="clientPhone">Téléphone *</FieldLabel>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="Ex: +237 6XX XX XX XX"
                    className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 disabled:opacity-60 disabled:bg-[#F8F4F0] dark:disabled:bg-slate-800/40"
                    disabled={!!formData.linkedClientId}
                    required
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="clientEmail">Email (optionnel)</FieldLabel>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={e => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="Ex: jean@example.com"
                    className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 disabled:opacity-60 disabled:bg-[#F8F4F0] dark:disabled:bg-slate-800/40"
                    disabled={!!formData.linkedClientId}
                  />
                </div>

                {!formData.linkedClientId && (
                  <div className="flex items-center justify-between px-3.5 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                    <label htmlFor="saveAsRegularClient" className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                      Enregistrer comme client régulier
                    </label>
                    <Toggle
                      id="saveAsRegularClient"
                      checked={formData.saveAsRegularClient}
                      onChange={() => setFormData(prev => ({ ...prev, saveAsRegularClient: !prev.saveAsRegularClient }))}
                    />
                  </div>
                )}

                {duplicateClient && (
                  formData.saveAsRegularClient ? (
                    // Case cochée + doublon détecté : on bloque l'étape suivante (cf. goNext)
                    // tant que ce n'est pas résolu (import, décocher, ou autre numéro).
                    <div className="space-y-1.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">Client déjà existant</p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate">
                            "{duplicateClient.name}" utilise déjà ce numéro de téléphone.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImportClient(duplicateClient)}
                          className="flex-shrink-0 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Importer ce client
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70">
                        Importez ce client ou décochez "client régulier" pour continuer sans l'importer.
                      </p>
                    </div>
                  ) : (
                    // Case non cochée : simple signal informatif, rien à résoudre, pas de blocage.
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/50">
                      <Info className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                      <p className="text-[11px] text-sky-700 dark:text-sky-400">
                        "{duplicateClient.name}" existe déjà avec ce numéro de téléphone.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── Step 1 : Service & coiffeur ── */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Sélection du service en premier, avec image */}
                <div>
                  <FieldLabel>Service *</FieldLabel>
                  {!salon?.services.length ? (
                    <p className="text-[12px] text-slate-400">Aucun service configuré pour ce salon.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {salon.services.map(service => (
                        <SelectableRow
                          key={service.id}
                          selected={formData.serviceId === service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          icon={
                            service.imageUrl ? (
                              <img
                                src={service.imageUrl}
                                alt={service.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <Scissors className="w-4 h-4 text-slate-400" />
                              </div>
                            )
                          }
                          label={service.name}
                          meta={
                            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                              {service.price.toLocaleString()} XAF
                            </span>
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Coiffeur : dépend du service choisi, filtré sur ceux qualifiés pour ce service */}
                {selectedService && (
                  <div>
                    <FieldLabel>Coiffeur *</FieldLabel>
                    {qualifiedHairDressers.length === 0 ? (
                      <div className="px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-[12px] text-amber-700 dark:text-amber-400">
                        Aucun coiffeur n'est encore associé à ce service.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {qualifiedHairDressers.map(hd => (
                          <SelectableRow
                            key={hd.id}
                            selected={formData.hairDresserId === hd.id}
                            onClick={() => setFormData(prev => ({ ...prev, hairDresserId: hd.id }))}
                            icon={
                              hd.photo ? (
                                <img
                                  src={hd.photo}
                                  alt={hd.name}
                                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold">
                                  {hd.name.charAt(0).toUpperCase()}
                                </div>
                              )
                            }
                            label={hd.name}
                            meta={<span className="text-[11px] text-slate-400">{hd.speciality}</span>}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedService?.supplements && selectedService.supplements.length > 0 && (
                  <div>
                    <FieldLabel>Suppléments (optionnels)</FieldLabel>
                    <div className="space-y-2">
                      {selectedService.supplements.map((supplement: ISalonServiceSupplement) => (
                        <SelectableRow
                          key={supplement.name}
                          selected={formData.supplements.includes(supplement.name)}
                          onClick={() => handleSupplementToggle(supplement.name)}
                          label={supplement.name}
                          meta={
                            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                              {supplement.price.toLocaleString()} XAF
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedService && (
                  <div className="px-4 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
                      <span>Prix du service</span>
                      <span>{servicePrice.toLocaleString()} XAF</span>
                    </div>
                    {supplementsPrice > 0 && (
                      <div className="flex justify-between text-[12px] text-slate-500 dark:text-slate-400">
                        <span>Suppléments</span>
                        <span>{supplementsPrice.toLocaleString()} XAF</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[14px] font-bold text-slate-800 dark:text-white pt-1.5 border-t border-[#EDE8E3] dark:border-slate-700">
                      <span>Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{totalPrice.toLocaleString()} XAF</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2 : Paiement ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <FieldLabel>Méthode de paiement *</FieldLabel>
                  <div className="space-y-2">
                    <SelectableRow
                      selected={formData.paymentMethod === 'cash'}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                      icon={<Banknote className="w-4 h-4 text-slate-400" />}
                      label="Espèces"
                    />
                    <SelectableRow
                      selected={formData.paymentMethod === 'mobile'}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'mobile' }))}
                      icon={<Smartphone className="w-4 h-4 text-slate-400" />}
                      label="Mobile Money"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-3.5 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                  <label htmlFor="isPaid" className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                    Paiement effectué
                  </label>
                  <Toggle
                    id="isPaid"
                    checked={formData.isPaid}
                    onChange={() => setFormData(prev => ({ ...prev, isPaid: !prev.isPaid }))}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="notes">Notes (optionnel)</FieldLabel>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ajoutez des notes supplémentaires..."
                    rows={2}
                    className="rounded-xl border-[#E8E0D8] dark:border-slate-700"
                  />
                </div>

                {/* Récapitulatif */}
                <div className="px-4 py-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2">
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Récapitulatif</p>
                  <div className="space-y-1 text-[12px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" /> {formData.clientName || '—'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Scissors className="w-3 h-3 text-slate-400" /> {selectedService?.name || '—'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400" /> {selectedHairDresser?.name || '—'}
                    </div>
                  </div>
                  <div className="flex justify-between text-[14px] font-bold text-slate-800 dark:text-white pt-1.5 border-t border-emerald-200 dark:border-emerald-800/50">
                    <span>Total à payer</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{totalPrice.toLocaleString()} XAF</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={createOrderMutation.isPending}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#F0EAE4] dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Précédent
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                disabled={createOrderMutation.isPending}
                className="h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-[#F0EAE4] dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Suivant
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createOrderMutation.isPending}
                className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 transition-colors"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Créer la commande
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </DialogContent>

      <ClientSearchModal
        open={isClientSearchOpen}
        onOpenChange={setIsClientSearchOpen}
        onSelectClient={handleImportClient}
      />
    </Dialog>
  )
}
