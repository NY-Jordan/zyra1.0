'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Badge } from '@zyra/ui/components/badge'
import {
  Calendar,
  Search,
  Clock,
  DollarSign,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import { reservationStatusEnum, reservationPaymentMethodEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import useSalon from '@/hooks/useSalon'
import ReservationCard from './ReservationCard'

export default function ReservationsManagement() {
  const { salon } = useSalon()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | reservationStatusEnum>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  // Récupérer les réservations
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', salon?.id],
    queryFn: async (): Promise<IReservation[]> => {
      if (!salon?.id) return []
      const results = await fetchCollection('reservations', [
        where('salonId', '==', salon.id)
      ])
      // Trier par date (plus récentes en premier)
      return results.sort((a: any, b: any) => 
        b.scheduledAt.toDate().getTime() - a.scheduledAt.toDate().getTime()
      )
    },
    enabled: !!salon?.id
  })

  // Filtrage des réservations
  const filteredReservations = useMemo(() => {
    let filtered = reservations

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.clientPhone?.includes(searchTerm) ||
        reservation.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter)
    }

    // Filtrer par paiement
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(reservation => reservation.isPaid)
    } else if (paymentFilter === 'unpaid') {
      filtered = filtered.filter(reservation => !reservation.isPaid)
    }

    // Filtrer par date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(reservation => {
        const resDate = reservation.scheduledAt.toDate()
        
        switch (dateFilter) {
          case 'today':
            return resDate >= today && resDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return resDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return resDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered
  }, [reservations, searchTerm, statusFilter, paymentFilter, dateFilter])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === reservationStatusEnum.pending).length,
      confirmed: reservations.filter(r => r.status === reservationStatusEnum.confirmed).length,
      completed: reservations.filter(r => r.status === reservationStatusEnum.completed).length,
      canceled: reservations.filter(r => r.status === reservationStatusEnum.canceled).length,
      totalRevenue: reservations
        .filter(r => r.status === reservationStatusEnum.completed && r.isPaid)
        .reduce((acc, r) => acc + r.price, 0),
      unpaidRevenue: reservations
        .filter(r => r.status !== reservationStatusEnum.canceled && !r.isPaid)
        .reduce((acc, r) => acc + r.price, 0)
    }
  }, [reservations])

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
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmées</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalRevenue.toLocaleString()} XAF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Réservations ({filteredReservations.length})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value={reservationStatusEnum.pending}>En attente</option>
                <option value={reservationStatusEnum.confirmed}>Confirmées</option>
                <option value={reservationStatusEnum.completed}>Terminées</option>
                <option value={reservationStatusEnum.canceled}>Annulées</option>
              </select>

              <select 
                value={paymentFilter} 
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tous les paiements</option>
                <option value="paid">Payées</option>
                <option value="unpaid">Non payées</option>
              </select>

              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Calendar className="h-12 w-12 text-gray-400" />
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
    </div>
  )
}
