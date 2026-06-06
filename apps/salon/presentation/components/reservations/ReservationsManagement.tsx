'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Input } from '@zyra/ui/components/input'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import {
  Calendar,
  Search,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import useSalon from '@/hooks/useSalon'
import ReservationCard from './ReservationCard'
import Pagination from '../common/Pagination'
import ConfirmReservationModal from './ConfirmReservationModal'
import CalendarReservationsModal from './CalendarReservationsModal'
import NewReservationSheet from './NewReservationSheet'
import { useReservations } from '@/usecases/useReservations'

export default function ReservationsManagement() {
  const { salon } = useSalon()
  const [searchTerm, setSearchTerm] = useState('')
  const [reservationNumberFilter, setReservationNumberFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | reservationStatusEnum>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | boolean>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showNewReservationSheet, setShowNewReservationSheet] = useState(false)
  const PAGE_SIZE = 10

  // Utiliser le useCase pour récupérer les réservations
  const { data: queryData = { data: [], total: 0 }, isLoading } = useReservations({
    salonId: salon?.id || '',
    page: currentPage,
    pageSize: PAGE_SIZE,
    status: statusFilter,
    isPaid: paymentFilter === 'all' ? 'all' : paymentFilter === true,
    dateFilter,
    searchTerm,
    reservationNumber: reservationNumberFilter.length === 5 ? reservationNumberFilter : ''
  });

  const reservations = (queryData.data || []) as IReservation[]
  const totalReservations = queryData.total || 0
  // Statistiques (basées sur la page actuelle)
  const stats = useMemo(() => {
    return {
      total: totalReservations,
      pending: reservations.filter(r => r.status === reservationStatusEnum.pending).length,
      confirmed: reservations.filter(r => r.status === reservationStatusEnum.confirmed).length,
      completed: reservations.filter(r => r.status === reservationStatusEnum.completed).length,
      canceled: reservations.filter(r => r.status === reservationStatusEnum.canceled).length,
      totalRevenue: reservations
        .filter(r => r.status === reservationStatusEnum.completed && r.isPaid)
        .reduce((acc, r) => acc + r.totalPrice, 0),
      unpaidRevenue: reservations
        .filter(r => r.status !== reservationStatusEnum.canceled && !r.isPaid)
        .reduce((acc, r) => acc + r.totalPrice, 0)
    }
  }, [reservations, totalReservations])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des réservations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-100 p-2.5 dark:bg-sky-950/50">
                <Calendar className="h-6 w-6 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-950/50">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-950/50">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmées</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2.5 dark:bg-violet-950/50">
                <DollarSign className="h-6 w-6 text-violet-600 dark:text-violet-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-300">
                  {stats.totalRevenue.toLocaleString()} XAF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start gap-4">
        <Button
          onClick={() => setShowNewReservationSheet(true)}
          size="lg"
          className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
        <Button
          onClick={() => setShowConfirmModal(true)}
          className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirmer une réservation
        </Button>
        <Button
          onClick={() => setShowCalendarModal(true)}
          className="bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
          size="lg"
          variant="default"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Voir le calendrier
        </Button>
      </div>

      <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 dark:text-slate-100">Réservations ({reservations.length} sur {totalReservations})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, téléphone, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 border-slate-200 bg-white/80 pl-10 dark:border-slate-700 dark:bg-slate-900/70"
                />
              </div>

              <div className="relative">
                <Input
                  placeholder="N° de réservation (5 chiffres)"
                  value={reservationNumberFilter}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 5)
                    setReservationNumberFilter(value)
                    // Réinitialiser la page seulement quand on atteint 5 chiffres
                    if (value.length === 5) {
                      setCurrentPage(1)
                    }
                  }}
                  maxLength={5}
                  className="w-40 border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70"
                />
              </div>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              >
                <option value="all">Tous les statuts</option>
                <option value={reservationStatusEnum.pending}>En attente</option>
                <option value={reservationStatusEnum.confirmed}>Confirmées</option>
                <option value={reservationStatusEnum.completed}>Terminées</option>
                <option value={reservationStatusEnum.canceled}>Annulées</option>
              </select>

              <select 
                value={paymentFilter === 'all' ? 'all' : paymentFilter.toString()} 
                onChange={(e) => setPaymentFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
                className="rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              >
                <option value="all">Tous les paiements</option>
                <option value="true">Payées</option>
                <option value="false">Non payées</option>
              </select>

              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reservations.length > 0 ? (
            <>
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={currentPage}
                pageSize={PAGE_SIZE}
                total={totalReservations}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full">
                  <Calendar className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all'
                      ? 'Aucune réservation trouvée'
                      : 'Aucune réservation'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all'
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Les réservations apparaîtront ici'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NewReservationSheet
        open={showNewReservationSheet}
        onOpenChange={setShowNewReservationSheet}
      />
      <ConfirmReservationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
      />
      <CalendarReservationsModal
        open={showCalendarModal}
        onOpenChange={setShowCalendarModal}
      />
    </div>
  )
}
