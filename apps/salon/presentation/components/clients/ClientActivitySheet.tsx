'use client'

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import { fetchCollection } from '@zyra/conf/lib/query'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Scissors,
  ShoppingBag,
  User,
  X,
  Banknote,
  Smartphone,
  AlertCircle,
} from 'lucide-react'
import { ClientHistoryEntry, IClient } from '@zyra/conf/domain/entities/clients.entities'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityItem =
  | { kind: 'order'; data: IOrder; sortDate: number }
  | { kind: 'reservation'; data: IReservation; sortDate: number }

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function fmtDateTime(d: Date) {
  return `${fmtDate(d)} à ${fmtTime(d)}`
}

function orderStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: 'Terminée', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    canceled:  { label: 'Annulée', cls: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
  }
  const m = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.cls}`}>{m.label}</span>
}

function reservationStatusBadge(status: reservationStatusEnum) {
  const map: Record<string, { label: string; cls: string }> = {
    [reservationStatusEnum.confirmed]:  { label: 'Confirmée',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    [reservationStatusEnum.pending]:    { label: 'En attente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    [reservationStatusEnum.completed]:  { label: 'Terminée',   cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    [reservationStatusEnum.canceled]:   { label: 'Annulée',    cls: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
  }
  const m = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.cls}`}>{m.label}</span>
}

function paymentIcon(method: string) {
  if (method === 'mobile') return <Smartphone className="w-3 h-3" />
  if (method === 'card') return <CreditCard className="w-3 h-3" />
  return <Banknote className="w-3 h-3" />
}

// ── Order activity card ───────────────────────────────────────────────────────

function OrderCard({ order }: { order: IOrder }) {
  const createdAt = new Date(order.createdAt)
  return (
    <div className="flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <ShoppingBag className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="w-px flex-1 bg-[#F0EAE4] dark:bg-slate-700/60 mt-1.5" />
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Commande</span>
            {orderStatusBadge(order.status)}
          </div>
          <span className="text-[11px] text-slate-400 flex-shrink-0">{fmtDate(createdAt)}</span>
        </div>

        <div className="px-3 py-2.5 rounded-xl border border-[#F0EAE4] dark:border-slate-700 bg-[#FAFAF9] dark:bg-slate-800/30 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200">
            <Scissors className="w-3 h-3 text-slate-400 flex-shrink-0" />
            {order.serviceName}
            {order.supplements?.length > 0 && (
              <span className="text-slate-400 font-normal">+{order.supplements.length} suppl.</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
            <User className="w-3 h-3 flex-shrink-0" />
            {order.hairDresserName}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#EDE8E3] dark:border-slate-700/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              {paymentIcon(order.paymentMethod)}
              <span>{order.isPaid ? 'Payé' : 'Non payé'}</span>
            </div>
            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
              {order.totalPrice.toLocaleString()} XAF
            </span>
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          {fmtDateTime(createdAt)}
        </div>
      </div>
    </div>
  )
}

// ── Reservation activity card ─────────────────────────────────────────────────

function ReservationCard({ reservation }: { reservation: IReservation }) {
  const createdAt = reservation.createdAt.toDate()
  const firstPerson = reservation.people[0]
  const scheduledAt = firstPerson?.scheduledAt?.toDate()

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="w-px flex-1 bg-[#F0EAE4] dark:bg-slate-700/60 mt-1.5" />
      </div>

      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              Réservation #{reservation.reservationNumber}
            </span>
            {reservationStatusBadge(reservation.status)}
          </div>
          <span className="text-[11px] text-slate-400 flex-shrink-0">{fmtDate(createdAt)}</span>
        </div>

        <div className="px-3 py-2.5 rounded-xl border border-[#F0EAE4] dark:border-slate-700 bg-[#FAFAF9] dark:bg-slate-800/30 space-y-1.5">
          {reservation.people.map((person, i) => (
            <div key={i} className="space-y-1">
              {reservation.people.length > 1 && (
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Personne {person.personNumber}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200">
                <Scissors className="w-3 h-3 text-slate-400 flex-shrink-0" />
                {person.serviceName}
              </div>
              {person.hairdresserName && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                  <User className="w-3 h-3 flex-shrink-0" />
                  {person.hairdresserName}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {person.scheduledAt?.toDate().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })} à {person.scheduledAt?.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1.5 border-t border-[#EDE8E3] dark:border-slate-700/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              {paymentIcon(reservation.paymentMethod)}
              <span>{reservation.isPaid ? 'Payé' : 'Non payé'}</span>
            </div>
            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
              {reservation.totalPrice.toLocaleString()} XAF
            </span>
          </div>
        </div>

        <div className="mt-1.5 space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            Créée le {fmtDateTime(createdAt)}
          </div>
          {reservation.status === reservationStatusEnum.confirmed && scheduledAt && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              RDV confirmé pour le {fmtDateTime(scheduledAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface ClientActivitySheetProps {
  client: IClient | null
  salonId: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientActivitySheet({ client, salonId, open, onOpenChange }: ClientActivitySheetProps) {
  // Split history entries by type — plain strings (legacy) are ignored
  const { orderIds, reservationIds } = useMemo(() => {
    const entries = (client?.history ?? []).filter(
      (e): e is ClientHistoryEntry => typeof e === 'object' && 'type' in e
    )
    return {
      orderIds: entries.filter(e => e.type === 'order').map(e => e.id),
      reservationIds: entries.filter(e => e.type === 'reservation').map(e => e.id),
    }
  }, [client?.history])

  const { data: orders = [] } = useQuery({
    queryKey: ['client-orders-by-id', orderIds],
    queryFn: () => fetchCollection('orders', [
      where('id', 'in', orderIds),
    ]) as Promise<IOrder[]>,
    enabled: open && orderIds.length > 0,
  })

  const { data: reservations = [] } = useQuery({
    queryKey: ['client-reservations-by-id', reservationIds],
    queryFn: () => fetchCollection('reservations', [
      where('id', 'in', reservationIds),
    ]) as Promise<IReservation[]>,
    enabled: open && reservationIds.length > 0,
  })

  const timeline = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...orders.map(o => ({
        kind: 'order' as const,
        data: o,
        sortDate: new Date(o.createdAt).getTime(),
      })),
      ...reservations.map(r => ({
        kind: 'reservation' as const,
        data: r,
        sortDate: r.createdAt.toDate().getTime(),
      })),
    ]
    return items.sort((a, b) => b.sortDate - a.sortDate)
  }, [orders, reservations])

  const totalSpent = useMemo(() =>
    [...orders, ...reservations].reduce((sum, item) => sum + item.totalPrice, 0),
    [orders, reservations],
  )

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg w-full p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0"
      >
        <DialogTitle className="sr-only">Activité de {client.name}</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[17px] font-bold flex-shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight truncate">
                  {client.name}
                </h2>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {client.phone}
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {client.email}
                    </div>
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

          {/* Stats strip */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Activités', value: timeline.length },
              { label: 'Commandes', value: orders.length },
              { label: 'Réservations', value: reservations.length },
            ].map(stat => (
              <div key={stat.label} className="px-3 py-2 rounded-xl bg-[#F8F4F0] dark:bg-slate-800/40 text-center">
                <p className="text-[18px] font-extrabold text-slate-800 dark:text-white leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {totalSpent > 0 && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Total dépensé</span>
              <span className="text-[14px] font-extrabold text-emerald-600 dark:text-emerald-400">
                {totalSpent.toLocaleString()} XAF
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">Aucune activité</p>
              <p className="text-[12px] text-slate-400 mt-1">Ce client n&apos;a pas encore de commande ni de réservation.</p>
            </div>
          ) : (
            <div>
              {timeline.map((item, idx) => (
                <div key={idx} className={idx === timeline.length - 1 ? '[&_.w-px]:hidden' : ''}>
                  {item.kind === 'order'
                    ? <OrderCard order={item.data} />
                    : <ReservationCard reservation={item.data} />
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
