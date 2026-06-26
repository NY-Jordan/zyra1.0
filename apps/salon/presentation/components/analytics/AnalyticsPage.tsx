'use client'

import React, { useState } from 'react'
import {
  TrendingUp, DollarSign, Calendar, ShoppingBag, Users, Scissors,
  Clock, Award, BarChart2, CreditCard, Smartphone, Banknote, Star,
  CheckCircle, XCircle,
} from 'lucide-react'
import { useAnalytics, AnalyticsPeriod, MonthlyPoint } from '@/hooks/useAnalytics'

const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

// ── Periods ───────────────────────────────────────────────────────────────────

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '3m', label: '3 mois' },
  { value: '6m', label: '6 mois' },
  { value: 'all', label: 'Tout' },
]

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Sk({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-xl ${className}`} />
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <div className={`w-9 h-9 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} mb-3`}>
        {icon}
      </div>
      <p className="text-[21px] font-extrabold text-slate-800 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────

function STitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <h3 className="text-[13px] font-extrabold text-slate-800 dark:text-white">{children}</h3>
    </div>
  )
}

// ── Bar row (horizontal) ──────────────────────────────────────────────────────

function BarRow({ label, value, max, color, right }: {
  label: string; value: number; max: number; color: string; right?: React.ReactNode
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[55%]">{label}</span>
        {right ?? <span className="font-bold text-slate-700 dark:text-slate-200 flex-shrink-0">{value}</span>}
      </div>
      <div className="h-2 bg-[#F0EAE4] dark:bg-slate-700/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }} />
      </div>
    </div>
  )
}

// ── Vertical bar chart ────────────────────────────────────────────────────────

const CHART_H = 100 // px — fixed height so percentage math works

function VerticalBars({ data, valueKey, colorClass }: {
  data: MonthlyPoint[]; valueKey: 'reservations' | 'revenue'; colorClass: string
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)

  return (
    <div className="flex items-end gap-2" style={{ height: CHART_H + 24 + 'px' }}>
      {data.map((point, i) => {
        const barH = Math.max(Math.round((point[valueKey] / max) * CHART_H), point[valueKey] > 0 ? 6 : 2)
        const tooltip = valueKey === 'revenue'
          ? `${point.month} : ${point[valueKey].toLocaleString()} XAF`
          : `${point.month} : ${point[valueKey]} RDV`
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 group" style={{ height: CHART_H + 24 + 'px' }}>
            {/* Tooltip */}
            <div className="relative w-full flex justify-center" style={{ height: CHART_H + 'px', alignItems: 'flex-end' }}>
              <div
                className={`w-full rounded-t-lg ${colorClass} transition-all duration-500 cursor-default relative group`}
                style={{ height: barH + 'px' }}
                title={tooltip}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap z-20 pointer-events-none">
                  {valueKey === 'revenue' ? `${point[valueKey].toLocaleString()} XAF` : `${point[valueKey]}`}
                </div>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium flex-shrink-0 leading-none">
              {point.shortMonth}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${color}`}>
      <span className="text-[12px] font-semibold">{label}</span>
      <span className="text-[15px] font-extrabold">{count}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [chartView, setChartView] = useState<'revenue' | 'reservations'>('revenue')
  const { data, isLoading } = useAnalytics(period)

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  // ── Skeleton ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex gap-2">
          {PERIODS.map((_, i) => <Sk key={i} className="h-8 w-20" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Sk key={i} className="h-24" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Sk className="h-52" /><Sk className="h-52" />
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Sk className="h-56" /><Sk className="h-56" /><Sk className="h-56" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const methodTotal = Math.max(data.revenueByMethod.cash + data.revenueByMethod.mobile + data.revenueByMethod.card, 1)
  const maxServiceCount = Math.max(...data.topServices.map(s => s.count), 1)
  const maxHdRes = Math.max(...data.hairdresserStats.map(h => h.reservations), 1)
  const maxDay = Math.max(...data.peakDays.map(d => d.count), 1)
  const currentPeriodLabel = PERIODS.find(p => p.value === period)?.label ?? ''

  return (
    <div className="space-y-5 pb-8">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">Statistiques</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Vue d'ensemble · {currentPeriodLabel}</p>
        </div>

        {/* Period picker */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`h-8 px-3 rounded-xl text-[12px] font-bold transition-all ${
                period === p.value
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-[#161B24] border border-[#E8E0D8] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Revenue KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Revenus totaux"
          value={`${fmt(Math.round(data.totalRevenue))} XAF`}
          sub="Résas + commandes payées"
          bg="bg-[#EEF8F0] dark:bg-emerald-950/20"
          iconColor="text-emerald-600"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Ce mois"
          value={`${fmt(Math.round(data.monthRevenue))} XAF`}
          bg="bg-[#ECF6FE] dark:bg-sky-950/20"
          iconColor="text-sky-600"
        />
        <KpiCard
          icon={<Calendar className="h-5 w-5" />}
          label="Cette semaine"
          value={`${fmt(Math.round(data.weekRevenue))} XAF`}
          bg="bg-[#F2EDFE] dark:bg-violet-950/20"
          iconColor="text-violet-600"
        />
        <KpiCard
          icon={<Award className="h-5 w-5" />}
          label="Panier moyen"
          value={`${fmt(Math.round(data.avgReservationValue))} XAF`}
          sub="Par réservation payée"
          bg="bg-[#FEF1EC] dark:bg-rose-950/20"
          iconColor="text-rose-500"
        />
      </div>

      {/* ── Activity KPIs ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={<Calendar className="h-5 w-5" />}
          label="Réservations"
          value={data.totalReservations}
          sub={`${data.reservationsThisMonth} ce mois`}
          bg="bg-[#F8F4F0] dark:bg-slate-800/40"
          iconColor="text-slate-600 dark:text-slate-300"
        />
        <KpiCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Commandes"
          value={data.totalOrders}
          sub={`${data.ordersCompleted} complétées`}
          bg="bg-[#F8F4F0] dark:bg-slate-800/40"
          iconColor="text-violet-600"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Clients"
          value={data.totalClients}
          sub={`${data.returningClients} fidèles`}
          bg="bg-[#F8F4F0] dark:bg-slate-800/40"
          iconColor="text-sky-600"
        />
        <KpiCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Taux complétion"
          value={`${data.completionRate}%`}
          sub={`Annulation : ${data.cancellationRate}%`}
          bg="bg-[#F8F4F0] dark:bg-slate-800/40"
          iconColor="text-emerald-600"
        />
      </div>

      {/* ── Trend chart + Status ─────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Monthly trend */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-5">
            <STitle icon={<BarChart2 className="h-3.5 w-3.5" />}>
              Tendance mensuelle
            </STitle>
            <div className="flex rounded-xl overflow-hidden border border-[#E8E0D8] dark:border-slate-700 text-[11px] font-bold">
              {(['revenue', 'reservations'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setChartView(v)}
                  className={`px-3 py-1.5 transition-colors ${
                    chartView === v
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-[#F5F2EF] dark:hover:bg-slate-800'
                  }`}
                >
                  {v === 'revenue' ? 'Revenus' : 'RDV'}
                </button>
              ))}
            </div>
          </div>

          {data.monthlyTrend.every(m => m[chartView] === 0) ? (
            <div className="flex items-center justify-center h-28 text-[12px] text-slate-400 dark:text-slate-500">
              Aucune donnée sur cette période
            </div>
          ) : (
            <VerticalBars
              data={data.monthlyTrend}
              valueKey={chartView}
              colorClass={chartView === 'revenue' ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-sky-400 dark:bg-sky-500'}
            />
          )}

          {/* Last 3 months summary */}
          <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50">
            {data.monthlyTrend.slice(-3).map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{m.shortMonth}</p>
                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                  {chartView === 'revenue' ? `${fmt(Math.round(m.revenue))} XAF` : `${m.reservations} RDV`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation status */}
        <div className={`${card} p-5`}>
          <STitle icon={<Calendar className="h-3.5 w-3.5" />}>
            Réservations par statut
          </STitle>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <StatusPill label="En attente" count={data.reservationsByStatus.pending}
              color="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" />
            <StatusPill label="Confirmées" count={data.reservationsByStatus.confirmed}
              color="bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/50" />
            <StatusPill label="Terminées" count={data.reservationsByStatus.completed}
              color="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" />
            <StatusPill label="Annulées" count={data.reservationsByStatus.canceled}
              color="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50" />
          </div>
          <div className="space-y-2 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50">
            {[
              { label: "Aujourd'hui", val: data.reservationsToday },
              { label: 'Cette semaine', val: data.reservationsThisWeek },
              { label: 'Ce mois', val: data.reservationsThisMonth },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-[12px]">
                <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services + Hairdressers + Top clients ───────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-5">

        <div className={`${card} p-5`}>
          <STitle icon={<Scissors className="h-3.5 w-3.5" />}>Services populaires</STitle>
          {data.topServices.length === 0
            ? <p className="text-[12px] text-slate-400 py-4 text-center">Aucune donnée</p>
            : (
              <div className="space-y-3.5">
                {data.topServices.map((s, i) => (
                  <BarRow key={i} label={s.name} value={s.count} max={maxServiceCount} color="bg-emerald-400"
                    right={
                      <div className="text-right flex-shrink-0">
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{s.count}</span>
                        {s.revenue > 0 && <p className="text-[10px] text-slate-400">{fmt(Math.round(s.revenue))} XAF</p>}
                      </div>
                    }
                  />
                ))}
              </div>
            )}
        </div>

        <div className={`${card} p-5`}>
          <STitle icon={<Scissors className="h-3.5 w-3.5" />}>Performance coiffeurs</STitle>
          {data.hairdresserStats.length === 0
            ? <p className="text-[12px] text-slate-400 py-4 text-center">Aucune donnée</p>
            : (
              <div className="space-y-3.5">
                {data.hairdresserStats.slice(0, 5).map((hd, i) => (
                  <BarRow key={i} label={hd.name} value={hd.reservations} max={maxHdRes} color="bg-violet-400"
                    right={
                      <div className="text-right flex-shrink-0">
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{hd.reservations} RDV</span>
                        {hd.revenue > 0 && <p className="text-[10px] text-slate-400">{fmt(Math.round(hd.revenue))} XAF</p>}
                      </div>
                    }
                  />
                ))}
              </div>
            )}
        </div>

        <div className={`${card} p-5`}>
          <STitle icon={<Star className="h-3.5 w-3.5" />}>Top clients</STitle>
          {data.topClients.length === 0
            ? <p className="text-[12px] text-slate-400 py-4 text-center">Aucune donnée</p>
            : (
              <div className="space-y-2">
                {data.topClients.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0 ${
                      i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-600/80' : 'bg-emerald-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.visits} visite{c.visits > 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      {fmt(Math.round(c.total))} XAF
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* ── Payment methods + Peak days + Client loyalty ─────────────────────── */}
      <div className="grid md:grid-cols-3 gap-5">

        <div className={`${card} p-5`}>
          <STitle icon={<CreditCard className="h-3.5 w-3.5" />}>Méthodes de paiement</STitle>
          <div className="space-y-4">
            {([
              { icon: <Banknote className="h-4 w-4" />, label: 'Espèces', value: data.revenueByMethod.cash, color: 'bg-emerald-400' },
              { icon: <Smartphone className="h-4 w-4" />, label: 'Mobile Money', value: data.revenueByMethod.mobile, color: 'bg-sky-400' },
              { icon: <CreditCard className="h-4 w-4" />, label: 'Carte bancaire', value: data.revenueByMethod.card, color: 'bg-violet-400' },
            ] as const).map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{m.label}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{Math.round((m.value / methodTotal) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-[#F0EAE4] dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${m.color} transition-all duration-500`}
                      style={{ width: `${Math.round((m.value / methodTotal) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{fmt(Math.round(m.value))} XAF</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <STitle icon={<Clock className="h-3.5 w-3.5" />}>Jours les plus actifs</STitle>
          <div className="flex items-end gap-1" style={{ height: '96px' }}>
            {data.peakDays.map((d, i) => {
              const barH = maxDay > 0
                ? Math.max(Math.round((d.count / maxDay) * 80), d.count > 0 ? 5 : 2)
                : 2
              const isMax = d.count > 0 && d.count === maxDay
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5" style={{ height: '96px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${isMax ? 'bg-rose-400' : 'bg-[#E8E0D8] dark:bg-slate-700'}`}
                    style={{ height: barH + 'px' }}
                    title={`${d.day} : ${d.count} RDV`}
                  />
                  <span className={`text-[9px] font-bold flex-shrink-0 ${isMax ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {d.short}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50 space-y-1.5 mt-2">
            {data.peakDays.slice().sort((a, b) => b.count - a.count).slice(0, 3).map((d, i) => (
              <div key={i} className="flex justify-between text-[12px]">
                <span className="text-slate-500 dark:text-slate-400">{d.day}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{d.count} RDV</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <STitle icon={<Users className="h-3.5 w-3.5" />}>Fidélité clients</STitle>
          <div className="space-y-4">
            {[
              { label: 'Enregistrés', val: data.totalClients, max: data.totalClients, color: 'bg-slate-300 dark:bg-slate-600' },
              { label: 'Actifs (≥1 visite)', val: data.activeClients, max: data.totalClients, color: 'bg-sky-400' },
              { label: 'Fidèles (≥2 visites)', val: data.returningClients, max: data.totalClients, color: 'bg-emerald-400' },
            ].map(row => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{row.val}</span>
                </div>
                <div className="h-2 bg-[#F0EAE4] dark:bg-slate-700/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${row.color} transition-all duration-500`}
                    style={{ width: `${row.max > 0 ? Math.round((row.val / row.max) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-[12px] pt-2 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <span className="text-slate-500 dark:text-slate-400">Nouveaux ce mois</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+{data.newClientsThisMonth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Orders summary ────────────────────────────────────────────────────── */}
      <div className={`${card} p-5`}>
        <STitle icon={<ShoppingBag className="h-3.5 w-3.5" />}>Résumé des commandes</STitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', val: data.totalOrders, cls: 'text-slate-800 dark:text-white', bg: 'bg-[#F8F4F0] dark:bg-slate-800/40' },
            { label: 'Complétées', val: data.ordersCompleted, cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Annulées', val: data.ordersCanceled, cls: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { label: 'Revenus', val: `${fmt(Math.round(data.ordersRevenue))} XAF`, cls: 'text-slate-800 dark:text-white text-[16px]', bg: 'bg-[#F8F4F0] dark:bg-slate-800/40' },
          ].map((item, i) => (
            <div key={i} className={`text-center p-4 rounded-xl ${item.bg}`}>
              <p className={`text-[22px] font-extrabold leading-none ${item.cls}`}>{item.val}</p>
              <p className="text-[11px] text-slate-400 mt-1.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
