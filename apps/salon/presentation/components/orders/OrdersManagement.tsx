'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@zyra/ui/components/input'
import {
  Search,
  Plus,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingUp,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useHasPermission } from '@/hooks/useHasPermission'
import { useHairDressers } from '@zyra/core/usecases/useHairDressers'
import { useQuery } from '@tanstack/react-query'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'
import { orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum'
import OrderCard from './OrderCard'
import NewOrderModal from './NewOrderModal'
import { fetchCollection } from '@zyra/conf/lib/query'
import { Timestamp, where } from 'firebase/firestore'
import { Calendar } from '@zyra/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@zyra/ui/components/popover'

type DateFilterType = 'today' | 'week' | 'month' | 'custom'

const DATE_FILTERS: { key: DateFilterType; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
]

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[20px] font-extrabold text-slate-800 dark:text-white leading-none truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function OrdersManagement() {
  const { salon } = useSalon()
  const { hairDressers } = useHairDressers()
  const { hasPermission } = useHasPermission()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [hairDresserFilter, setHairDresserFilter] = useState<string>('all')
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false)
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('today')
  const [customDateStart, setCustomDateStart] = useState<Date>()
  const [customDateEnd, setCustomDateEnd] = useState<Date>()

  const formatDateRange = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  const getDateRange = () => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    switch (dateFilterType) {
      case 'today':
        return { start: startOfDay, end: endOfDay }
      case 'week': {
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay() + 1)
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        return { start: startOfMonth, end: endOfMonth }
      }
      case 'custom':
        if (customDateStart && customDateEnd) {
          const start = new Date(customDateStart)
          start.setHours(0, 0, 0, 0)
          const end = new Date(customDateEnd)
          end.setHours(23, 59, 59, 999)
          return { start, end }
        }
        return { start: startOfDay, end: endOfDay }
      default:
        return { start: startOfDay, end: endOfDay }
    }
  }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', salon?.id, dateFilterType, customDateStart, customDateEnd],
    queryFn: () => {
      if (!salon?.id) return []
      const { start, end } = getDateRange()
      return fetchCollection('orders', [
        where('salonId', '==', salon.id),
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
      ])
    },
    enabled: !!salon?.id,
  })

  const statistics = useMemo(() => {
    const total = orders.length
    const completed = orders.filter((o: any) => o.status === orderStatusEnum.completed).length
    const pending = orders.filter((o: any) => o.status === orderStatusEnum.pending).length
    const paid = orders.filter((o: any) => o.isPaid).length
    const totalRevenue = orders
      .filter((o: any) => o.isPaid)
      .reduce((sum: number, o: any) => sum + o.totalPrice, 0)

    return { total, completed, pending, paid, totalRevenue }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order: any) => {
        const matchesSearch =
          order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.clientPhone.includes(searchTerm) ||
          order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.hairDresserName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        const matchesPayment =
          paymentFilter === 'all' ||
          (paymentFilter === 'paid' && order.isPaid) ||
          (paymentFilter === 'unpaid' && !order.isPaid)

        const matchesHairDresser =
          hairDresserFilter === 'all' || order.hairDresserId === hairDresserFilter

        return matchesSearch && matchesStatus && matchesPayment && matchesHairDresser
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, searchTerm, statusFilter, paymentFilter, hairDresserFilter])

  const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">Commandes</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez les commandes de votre salon
          </p>
        </div>
        {hasPermission('orders.create') && (
          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle commande
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          icon={<ShoppingBag className="h-5 w-5" />} label="Total commandes"
          value={statistics.total}
          bg="bg-[#ECF6FE] dark:bg-sky-950/20" iconColor="text-sky-600"
        />
        <KpiCard
          icon={<CheckCircle className="h-5 w-5" />} label="Terminées"
          value={statistics.completed}
          bg="bg-[#EEF8F0] dark:bg-emerald-950/20" iconColor="text-emerald-600"
        />
        <KpiCard
          icon={<XCircle className="h-5 w-5" />} label="En attente"
          value={statistics.pending}
          bg="bg-[#FDF3E3] dark:bg-amber-950/20" iconColor="text-amber-600"
        />
        <KpiCard
          icon={<Wallet className="h-5 w-5" />} label="Payées"
          value={statistics.paid}
          bg="bg-[#F2EDFE] dark:bg-violet-950/20" iconColor="text-violet-600"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />} label="Revenu total"
          value={`${statistics.totalRevenue.toLocaleString()} XAF`}
          bg="bg-[#FEF1EC] dark:bg-rose-950/20" iconColor="text-rose-500"
        />
      </div>

      {/* Filtres */}
      <div className={`${card} p-4 space-y-3`}>
        {/* Filtre de date */}
        <div className="flex flex-wrap items-center gap-2">
          {DATE_FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setDateFilterType(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                dateFilterType === f.key
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-[#EDE8E3] dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => setDateFilterType('custom')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                  dateFilterType === 'custom'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-[#EDE8E3] dark:hover:bg-slate-700'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateFilterType === 'custom' && customDateStart && customDateEnd
                  ? `${formatDateRange(customDateStart)} - ${formatDateRange(customDateEnd)}`
                  : 'Période personnalisée'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 flex space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de début</label>
                  <Calendar
                    mode="single"
                    selected={customDateStart}
                    onSelect={(date) => {
                      setCustomDateStart(date)
                      if (date) setDateFilterType('custom')
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de fin</label>
                  <Calendar
                    mode="single"
                    selected={customDateEnd}
                    onSelect={(date) => {
                      setCustomDateEnd(date)
                      if (date && customDateStart) setDateFilterType('custom')
                    }}
                    disabled={(date) => customDateStart ? date < customDateStart : false}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Recherche + filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par client, téléphone, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
            />
          </div>

          <select
            aria-label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          >
            <option value="all">Tous les statuts</option>
            <option value={orderStatusEnum.pending}>En attente</option>
            <option value={orderStatusEnum.completed}>Terminées</option>
            <option value={orderStatusEnum.canceled}>Annulées</option>
          </select>

          <select
            aria-label="Filtrer par paiement"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          >
            <option value="all">Tous les paiements</option>
            <option value="paid">Payées</option>
            <option value="unpaid">Non payées</option>
          </select>

          <select
            aria-label="Filtrer par coiffeur"
            value={hairDresserFilter}
            onChange={(e) => setHairDresserFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          >
            <option value="all">Tous les coiffeurs</option>
            {hairDressers.map(hd => (
              <option key={hd.id} value={hd.id}>{hd.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-[13px] text-slate-400">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${card}`}>
            <ShoppingBag className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-[14px] font-bold text-slate-700 dark:text-slate-300 mb-1">Aucune commande</h3>
            <p className="text-[13px] text-slate-400 mb-4">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || hairDresserFilter !== 'all'
                ? 'Aucune commande ne correspond à vos filtres.'
                : 'Commencez par créer votre première commande.'}
            </p>
            {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && hairDresserFilter === 'all' && hasPermission('orders.create') && (
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouvelle commande
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order as IOrder} />
          ))
        )}
      </div>

      <NewOrderModal
        open={isNewOrderModalOpen}
        onOpenChange={setIsNewOrderModalOpen}
      />
    </div>
  )
}
