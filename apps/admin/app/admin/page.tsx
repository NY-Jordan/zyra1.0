'use client'
import { useEffect, useState } from 'react'
import {
  collection, query, where, onSnapshot, orderBy, limit,
  Timestamp, getCountFromServer
} from 'firebase/firestore'
import { db } from '@zyra/conf/lib/firebase'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import PageHeader from '@/presentation/components/common/PageHeader'
import {
  Building2, Scissors, Calendar, CreditCard,
  TrendingUp, TrendingDown, ArrowUpRight, Activity
} from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { SalonStatusEnum } from '@zyra/conf/domain/enums/statusEnum'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

// ── helpers ──────────────────────────────────────────────────────────────────

function sod(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function eod(d: Date) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }

function last14(): Date[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d
  })
}

function timeAgo(ts: any): string {
  const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts || 0)
  const m = Math.floor((Date.now() - d.getTime()) / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

function toMs(v: any): number {
  if (!v) return 0
  if (v?.seconds) return v.seconds * 1000
  return new Date(v).getTime()
}

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(Math.round(n)) }

// ── tiny components ───────────────────────────────────────────────────────────

const RES_STYLES: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmée',  cls: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  completed: { label: 'Terminée',   cls: 'bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  canceled:  { label: 'Annulée',    cls: 'bg-rose-100/80 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
}

function ResBadge({ status }: { status: string }) {
  const s = RES_STYLES[status] || { label: status, cls: 'bg-slate-100 text-slate-500' }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
}

function SalonDot({ status }: { status?: SalonStatusEnum }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-400', suspended: 'bg-rose-400',
    payment: 'bg-amber-400', deleted: 'bg-slate-300'
  }
  const label: Record<string, string> = {
    active: 'Actif', suspended: 'Suspendu', payment: 'Paiement', deleted: 'Supprimé'
  }
  const k = status || 'deleted'
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${map[k] || map.deleted}`} />
      {label[k] || k}
    </span>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse ${className}`} />
}

// ── KPI card ─────────────────────────────────────────────────────────────────

type CardColor = 'mint' | 'salmon' | 'sky' | 'violet'

const CARD_COLORS: Record<CardColor, { bg: string; iconBg: string; icon: string; trend: string }> = {
  mint:   { bg: 'bg-[#EEF8F0] dark:bg-emerald-950/30', iconBg: 'bg-emerald-500/20 dark:bg-emerald-900/40', icon: 'text-emerald-600 dark:text-emerald-400', trend: 'text-emerald-600 dark:text-emerald-400' },
  salmon: { bg: 'bg-[#FEF1EC] dark:bg-rose-950/30',    iconBg: 'bg-rose-400/15 dark:bg-rose-900/40',       icon: 'text-rose-500 dark:text-rose-400',       trend: 'text-rose-500 dark:text-rose-400' },
  sky:    { bg: 'bg-[#ECF6FE] dark:bg-sky-950/30',     iconBg: 'bg-sky-400/15 dark:bg-sky-900/40',         icon: 'text-sky-600 dark:text-sky-400',         trend: 'text-sky-600 dark:text-sky-400' },
  violet: { bg: 'bg-[#F2EDFE] dark:bg-violet-950/30',  iconBg: 'bg-violet-400/15 dark:bg-violet-900/40',   icon: 'text-violet-600 dark:text-violet-400',   trend: 'text-violet-600 dark:text-violet-400' },
}

function KpiCard({
  icon: Icon, label, value, sub, trend, color = 'mint', loading
}: {
  icon: any, label: string, value: string | number
  sub?: string, trend?: 'up' | 'down', color?: CardColor, loading?: boolean
}) {
  const c = CARD_COLORS[color]
  return (
    <div className={`${c.bg} rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${c.trend}`}>
            {trend === 'up'
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />
            }
          </div>
        )}
      </div>
      {loading
        ? <Skeleton className="h-8 w-24 mb-2" />
        : <p className="text-[26px] font-bold tracking-tight text-slate-800 dark:text-white leading-none">{value}</p>
      }
      <p className="mt-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {sub && !loading && (
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{sub}</p>
      )}
    </div>
  )
}

// ── dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {

  // Live: today's count
  const [todayCount, setTodayCount] = useState<number | null>(null)
  useEffect(() => {
    const q = query(
      collection(db, 'reservations'),
      where('createdAt', '>=', Timestamp.fromDate(sod(new Date()))),
      where('createdAt', '<=', Timestamp.fromDate(eod(new Date())))
    )
    return onSnapshot(q, s => setTodayCount(s.size))
  }, [])

  // Live: last 10 reservations
  const [feed, setFeed] = useState<IReservation[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(10))
    return onSnapshot(q, s => {
      setFeed(s.docs.map(d => ({ id: d.id, ...d.data() }) as IReservation))
      setFeedLoading(false)
    })
  }, [])

  // Salons
  const { data: salons = [], isLoading: salonsLoading } = useQuery<ISalon[]>({
    queryKey: ['dash-salons'],
    queryFn: () => fetchCollection('salons') as Promise<ISalon[]>,
    staleTime: 60_000, refetchInterval: 60_000,
  })

  // Hairdressers count
  const { data: hdCount, isLoading: hdLoading } = useQuery<number>({
    queryKey: ['dash-hd'],
    queryFn: async () => (await getCountFromServer(collection(db, 'hair_dressers'))).data().count,
    staleTime: 60_000, refetchInterval: 60_000,
  })

  // Revenue this month
  const { data: revenue } = useQuery<number>({
    queryKey: ['dash-rev'],
    queryFn: async () => {
      const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
      const docs = await fetchCollection('transactions', [
        where('status', '==', 'success'),
        where('createdAt', '>=', Timestamp.fromDate(start)),
      ])
      return docs.reduce((s, t: any) => s + (Number(t.amount) || 0), 0)
    },
    staleTime: 60_000, refetchInterval: 60_000,
  })

  // Subscriptions stats
  const { data: subStats } = useQuery({
    queryKey: ['dash-subscriptions'],
    queryFn: async () => {
      const in30 = new Date(); in30.setDate(in30.getDate() + 30)
      const [active, expired, expiring] = await Promise.all([
        getCountFromServer(query(collection(db, 'subscriptions'), where('status', '==', 'active'))),
        getCountFromServer(query(collection(db, 'subscriptions'), where('status', '==', 'expired'))),
        getCountFromServer(query(collection(db, 'subscriptions'),
          where('status', '==', 'active'),
          where('endDate', '<=', Timestamp.fromDate(in30))
        )),
      ])
      return {
        active: active.data().count,
        expired: expired.data().count,
        expiring: expiring.data().count,
      }
    },
    staleTime: 60_000, refetchInterval: 60_000,
  })

  // Chart: last 14 days
  const { data: chartDocs = [] } = useQuery<IReservation[]>({
    queryKey: ['dash-chart'],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 13); since.setHours(0, 0, 0, 0)
      return fetchCollection('reservations', [
        where('createdAt', '>=', Timestamp.fromDate(since)),
        orderBy('createdAt', 'asc'),
      ]) as Promise<IReservation[]>
    },
    staleTime: 300_000, refetchInterval: 300_000,
  })

  // Derived
  const active    = salons.filter(s => s.status?.name === SalonStatusEnum.active)
  const suspended = salons.filter(s => s.status?.name === SalonStatusEnum.suspended)
  const payment   = salons.filter(s => s.status?.name === SalonStatusEnum.payment)

  const recentSalons = [...salons]
    .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
    .slice(0, 6)

  const days = last14()
  const byDay = days.map(day => {
    const key = day.toDateString()
    return chartDocs.filter(r => {
      const d = (r.createdAt as any) instanceof Timestamp
        ? (r.createdAt as any).toDate()
        : new Date((r.createdAt as any) || 0)
      return d.toDateString() === key
    }).length
  })
  const total14 = byDay.reduce((a, b) => a + b, 0)

  const barData = {
    labels: days.map(d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
    datasets: [{
      data: byDay,
      backgroundColor: byDay.map((v, i) => i === byDay.length - 1 ? '#10B981' : '#D1FAE5'),
      hoverBackgroundColor: '#059669',
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#94A3B8',
        bodyColor: '#F1F5F9',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          title: (items: any[]) => items[0].label,
          label: (item: any) => `${item.raw} réservation${item.raw > 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8', font: { size: 10 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#94A3B8', font: { size: 10 }, stepSize: 1 },
        grid: { color: '#F1F5F9', drawBorder: false },
        border: { display: false },
      },
    },
  }

  // Status distribution for mini donut (css only)
  const total = salons.length || 1
  const activeP = Math.round((active.length / total) * 100)
  const paymentP = Math.round((payment.length / total) * 100)
  const suspendedP = Math.round((suspended.length / total) * 100)

  const card = "bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl"

  return (
    <>
      <PageHeader title="Tableau de bord" breadcrumbs={[{ label: 'Dashboard', isCurrent: true }]} />

      <div className="space-y-5">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            icon={CreditCard} color="salmon" label="Revenus ce mois"
            value={revenue !== undefined ? `${fmt(revenue)} F` : '—'}
            sub="Transactions validées"
            trend="up" loading={revenue === undefined}
          />
          <KpiCard
            icon={Building2} color="mint" label="Salons actifs"
            value={salonsLoading ? '—' : active.length}
            sub={salonsLoading ? undefined : `${salons.length} au total`}
            trend="up" loading={salonsLoading}
          />
          <KpiCard
            icon={Calendar} color="sky" label="Réservations aujourd'hui"
            value={todayCount ?? '—'}
            sub={total14 > 0 ? `${total14} sur 14 jours` : 'Temps réel'}
            trend={todayCount ? 'up' : undefined} loading={todayCount === null}
          />
          <KpiCard
            icon={Scissors} color="violet" label="Coiffeurs"
            value={hdLoading ? '—' : (hdCount ?? '—')}
            sub="Enregistrés sur la plateforme"
            loading={hdLoading}
          />
        </div>

        {/* ── Chart + Feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Bar chart */}
          <div className={`${card} lg:col-span-3 p-6`}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">Réservations</h2>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">14 derniers jours</p>
              </div>
              <div className="flex items-center gap-2 bg-[#F8F4F0] dark:bg-slate-800/50 rounded-xl px-3 py-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{total14}</span>
              </div>
            </div>
            <Bar data={barData} options={barOptions} />
          </div>

          {/* Live feed */}
          <div className={`${card} lg:col-span-2 p-5 flex flex-col`}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">Activité récente</h2>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex-1 space-y-0 divide-y divide-[#F8F4F0] dark:divide-slate-800/60">
              {feedLoading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))
                : feed.map(r => (
                    <div key={r.id} className="flex items-center gap-3 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#F8F4F0] dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {r.clientName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate leading-tight">
                          {r.clientName || 'Client'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ResBadge status={r.status} />
                          <span className="text-[10px] text-slate-400">{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>
                      {r.totalPrice > 0 && (
                        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          {fmt(r.totalPrice)}
                        </span>
                      )}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent salons */}
          <div className={`${card} lg:col-span-2 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">Salons récents</h2>
              <a href="/admin/salons" className="flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                Voir tous <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="divide-y divide-[#F8F4F0] dark:divide-slate-800/60">
              {salonsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5">
                      <Skeleton className="w-9 h-9 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2.5 w-1/3" />
                      </div>
                    </div>
                  ))
                : recentSalons.map(s => (
                    <div key={s.id} className="flex items-center gap-3 py-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#EEF8F0] dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {s.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{s.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {[s.city, s.country].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {s.reservationsCount > 0 && (
                          <span className="text-[11px] font-medium text-slate-400">{s.reservationsCount} rés.</span>
                        )}
                        <SalonDot status={s.status?.name} />
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Forfaits */}
          <div className={`${card} p-5`}>
            <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white mb-5">Forfaits salons</h2>
            <div className="space-y-3">
              {[
                { label: 'Actifs',              value: subStats?.active   ?? '—', bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20', txt: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Expirés',             value: subStats?.expired  ?? '—', bg: 'bg-[#FEF1EC] dark:bg-rose-950/20',    txt: 'text-rose-500 dark:text-rose-400' },
                { label: 'Expirent dans 30j',   value: subStats?.expiring ?? '—', bg: 'bg-[#FFF8EC] dark:bg-amber-950/20',   txt: 'text-amber-600 dark:text-amber-400' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-xl px-4 py-3 flex items-center justify-between`}>
                  <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                  <span className={`text-[18px] font-extrabold ${item.txt}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform health */}
          <div className={`${card} p-5`}>
            <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white mb-5">Plateforme</h2>

            {/* Distribution bars */}
            <div className="space-y-4">
              {[
                { label: 'Salons actifs',      count: active.length,    pct: activeP,    color: 'bg-emerald-400', light: 'bg-emerald-100 dark:bg-emerald-950/40' },
                { label: 'Attente paiement',   count: payment.length,   pct: paymentP,   color: 'bg-amber-400',   light: 'bg-amber-100 dark:bg-amber-950/40' },
                { label: 'Suspendus',          count: suspended.length, pct: suspendedP, color: 'bg-rose-400',    light: 'bg-rose-100 dark:bg-rose-950/40' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{item.count}</span>
                  </div>
                  <div className={`h-2 ${item.light} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mini stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: 'Total salons',    value: salons.length,                                             bg: 'bg-[#F8F4F0] dark:bg-slate-800/50' },
                { label: 'Taux activation', value: `${Math.round((active.length / (salons.length || 1)) * 100)}%`, bg: 'bg-[#EEF8F0] dark:bg-emerald-950/30' },
                { label: "Aujourd'hui",     value: todayCount ?? '—',                                         bg: 'bg-[#ECF6FE] dark:bg-sky-950/30' },
                { label: 'Coiffeurs',       value: hdCount ?? '—',                                            bg: 'bg-[#F2EDFE] dark:bg-violet-950/30' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} rounded-xl p-3`}>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-[16px] font-bold text-slate-700 dark:text-slate-200">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
