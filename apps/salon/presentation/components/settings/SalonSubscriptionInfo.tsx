'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISubscription, SubscriptionStatus } from '@zyra/conf/domain/entities/subscriptions.entities'
import { Calendar, Zap, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

function fmtDate(ts: any): string {
  if (!ts) return '—'
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function SalonSubscriptionInfo({ salonId }: { salonId: string }) {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['salon-subscription-info', salonId],
    enabled: !!salonId,
    staleTime: 60_000,
    queryFn: async () => {
      const subs = await fetchCollection('subscriptions', [
        where('userId', '==', salonId),
      ])
      if (!subs.length) return null
      const active = subs.find((s: any) => s.status === SubscriptionStatus.ACTIVE)
      if (active) return active as ISubscription
      const sorted = [...subs].sort(
        (a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      )
      return sorted[0] as ISubscription
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-500">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-[14px] font-semibold">Aucun forfait actif</p>
        <p className="text-[12px] text-center max-w-xs">
          Votre salon ne dispose pas encore d'un forfait. Contactez l'équipe Zyra pour en configurer un.
        </p>
      </div>
    )
  }

  const start = subscription.startDate?.seconds
    ? new Date(subscription.startDate.seconds * 1000)
    : null
  const end = subscription.endDate?.seconds
    ? new Date(subscription.endDate.seconds * 1000)
    : null

  const now = new Date()
  const isExpired = end ? end < now : false
  const daysLeft = end ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000)) : null
  const pct = start && end
    ? Math.min(100, Math.max(0, Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)))
    : 0

  const expiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 14

  return (
    <div className="max-w-lg mx-auto space-y-4">

      {/* Header card */}
      <div className="rounded-2xl border border-[#E8E0D8] dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-50 to-[#F8F4F0] dark:from-emerald-950/20 dark:to-slate-900 px-5 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Forfait actuel</p>
              </div>
              <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white">
                {subscription.packageName}
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                {subscription.amount > 0
                  ? `${subscription.amount.toLocaleString('fr-FR')} ${subscription.currency}`
                  : 'Gratuit'}
              </p>
            </div>

            {/* Status badge */}
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
              isExpired
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50'
                : expiringSoon
                  ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50'
            }`}>
              {isExpired ? 'Expiré' : expiringSoon ? 'Expire bientôt' : 'Actif'}
            </span>
          </div>

          {/* Progress bar */}
          {start && end && (
            <div className="mt-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">{fmtDate(subscription.startDate)}</span>
                <span className="text-[11px] text-slate-400">{fmtDate(subscription.endDate)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/60 dark:bg-slate-700/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isExpired ? 'bg-rose-400' : expiringSoon ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Days remaining strip */}
        {daysLeft !== null && (
          <div className="px-5 py-3 bg-white dark:bg-slate-800/50 border-t border-[#F0EAE4] dark:border-slate-700 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              {isExpired
                ? 'Abonnement expiré'
                : daysLeft === 0
                  ? "Expire aujourd'hui"
                  : `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Dates detail */}
      <div className="rounded-2xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800/50 divide-y divide-[#F0EAE4] dark:divide-slate-700">
        <div className="px-5 py-3.5 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Début</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{fmtDate(subscription.startDate)}</p>
          </div>
        </div>
        <div className="px-5 py-3.5 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Fin</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{fmtDate(subscription.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      {subscription.packageFeatures?.length > 0 && (
        <div className="rounded-2xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
            Inclus dans ce forfait
          </p>
          <ul className="space-y-2">
            {subscription.packageFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pb-2">
        Pour modifier votre forfait, contactez l'équipe Zyra.
      </p>
    </div>
  )
}
