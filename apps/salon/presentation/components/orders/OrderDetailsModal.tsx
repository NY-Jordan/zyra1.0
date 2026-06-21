'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Banknote,
  Smartphone,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Receipt,
} from 'lucide-react'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'
import { useHairDressers } from '@/usecases/useHairDressers'

interface OrderDetailsModalProps {
  order: IOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: {
    label: 'En attente',
    cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  },
  completed: {
    label: 'Terminée',
    cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  },
  canceled: {
    label: 'Annulée',
    cls: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

export default function OrderDetailsModal({ order, open, onOpenChange }: OrderDetailsModalProps) {
  const { hairDressers } = useHairDressers()
  const hairdresser = hairDressers.find(hd => hd.id === order?.hairDresserId)

  if (!order) return null

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces'
      case 'mobile':
        return 'Mobile Money'
      default:
        return method
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0 max-h-[88vh]"
      >
        <DialogTitle className="sr-only">Détails de la commande</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                  Détails de la commande
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={order.status} />
                  {order.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle className="h-3 w-3" />
                      Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">
                      <XCircle className="h-3 w-3" />
                      Non payé
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 px-4 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-white">{order.serviceName}</p>
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mt-0.5">
                <Clock className="h-3 w-3" />
                <span className="text-[11px] font-medium">{formatTime(order.createdAt)}</span>
              </div>
            </div>
            <p className="text-[22px] font-extrabold text-emerald-600 dark:text-emerald-400">
              {order.totalPrice.toLocaleString()} XAF
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">

          {/* Client */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Nom" value={order.clientName} />
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={order.clientPhone} />
              {order.clientEmail && (
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={order.clientEmail} />
              )}
            </div>
          </div>

          {/* Coiffeur */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Coiffeur</h3>
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
              {hairdresser?.photo ? (
                <img
                  src={hairdresser.photo}
                  alt={order.hairDresserName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white text-[14px] font-bold">
                  {order.hairDresserName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{order.hairDresserName}</p>
                {hairdresser?.speciality && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{hairdresser.speciality}</p>
                )}
              </div>
            </div>
          </div>

          {/* Détails des prix */}
          <div className="space-y-3 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Détails des prix</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 dark:text-slate-400">Prix du service</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{order.price.toLocaleString()} XAF</span>
              </div>
              {order.supplementsPrice > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500 dark:text-slate-400">Suppléments:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{order.supplementsPrice.toLocaleString()} XAF</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] pt-1.5 border-t border-[#F0EAE4] dark:border-slate-800/50">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{order.totalPrice.toLocaleString()} XAF</span>
              </div>
            </div>

            {order.supplements && order.supplements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {order.supplements.map((supplement, index) => (
                  <span
                    key={index}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F5F2EF] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#EDE8E3] dark:border-slate-700"
                  >
                    {supplement}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Paiement */}
          <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Méthode de paiement</h3>
          </div>
          <div className="flex items-center gap-2 -mt-3">
            <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
              {getPaymentMethodIcon(order.paymentMethod)}
            </div>
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">Notes</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Date de création */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
            <div className="flex items-center gap-2 pt-3">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
