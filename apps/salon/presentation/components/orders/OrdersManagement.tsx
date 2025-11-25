'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@zyra/ui/components/select'
import {Search,Plus,ShoppingBag,DollarSign,CheckCircle,XCircle,TrendingUp,Calendar as CalendarIcon} from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { useQuery } from '@tanstack/react-query'
import { IOrder } from '@zyra/conf/domain/entities/orders.entities'
import OrderCard from './OrderCard'
import NewOrderSheet from './NewOrderSheet'
import { fetchCollection } from '@zyra/conf/lib/query'
import { Timestamp, where } from 'firebase/firestore'
import { Calendar } from '@zyra/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@zyra/ui/components/popover'

type DateFilterType = 'today' | 'week' | 'month' | 'custom'

export default function OrdersManagement() {
  const { salon } = useSalon()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [isNewOrderSheetOpen, setIsNewOrderSheetOpen] = useState(false)
  // Filtres de date
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('today')
  const [customDateStart, setCustomDateStart] = useState<Date>()
  const [customDateEnd, setCustomDateEnd] = useState<Date>()

  const formatDateRange = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  // Calculer les dates de début et fin selon le filtre
  const getDateRange = () => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    switch (dateFilterType) {
      case 'today':
        return { start: startOfDay, end: endOfDay }
      case 'week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Lundi
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // Dimanche
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        return { start: startOfMonth, end: endOfMonth }
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

  // Fetch orders avec filtrage par date dans Firestore
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

  // Statistiques basées sur les commandes fetchées
  const statistics = useMemo(() => {
    const total = orders.length
    const completed = orders.filter((o: any) => o.status === 'completed').length
    const pending = orders.filter((o: any) => o.status === 'pending').length
    const paid = orders.filter((o: any) => o.isPaid).length
    const totalRevenue = orders
      .filter((o: any) => o.isPaid)
      .reduce((sum: number, o: any) => sum + o.totalPrice, 0)

    return { total, completed, pending, paid, totalRevenue }
  }, [orders])

  // Filtrer les commandes avec les critères de recherche, statut et paiement
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

        return matchesSearch && matchesStatus && matchesPayment
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, searchTerm, statusFilter, paymentFilter])


  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            Gérez les commandes de votre salon
          </p>
        </div>
        <Button onClick={() => setIsNewOrderSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total commandes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalRevenue.toLocaleString()} XAF
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Filtre de date */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={dateFilterType === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilterType('today')}
              >
                Aujourd'hui
              </Button>
              <Button
                variant={dateFilterType === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilterType('week')}
              >
                Cette semaine
              </Button>
              <Button
                variant={dateFilterType === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilterType('month')}
              >
                Ce mois
              </Button>
              {/* Date personnalisée */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={dateFilterType === 'custom' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFilterType === 'custom' && customDateStart && customDateEnd
                      ? `${formatDateRange(customDateStart)} - ${formatDateRange(customDateEnd)}`
                      : 'Période personnalisée'}
                  </Button>
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

            {/* Autres filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client, téléphone, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtre statut */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="canceled">Annulées</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtre paiement */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les paiements</SelectItem>
                  <SelectItem value="paid">Payées</SelectItem>
                  <SelectItem value="unpaid">Non payées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Aucune commande ne correspond à vos filtres.'
                : 'Commencez par créer votre première commande.'}
            </p>
            {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
              <Button onClick={() => setIsNewOrderSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle commande
              </Button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order as IOrder} />
          ))
        )}
      </div>

      {/* Sheet pour nouvelle commande */}
      <NewOrderSheet
        open={isNewOrderSheetOpen}
        onOpenChange={setIsNewOrderSheetOpen}
      />
    </div>
  )
}
