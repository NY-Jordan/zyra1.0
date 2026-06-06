'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import QRCodeDialog from '@/presentation/components/dashboard/QRCodeDialog'
import { useSalon } from '@/hooks/useSalon'
import { useDashboard } from '@/hooks/useDashboard'
import {
  Store,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Share2,
  Copy,
  Eye,
  ExternalLink,
  MessageCircle,
  QrCode,
  Loader
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const { salon, isConnected } = useSalon()
  const { data: dashboardData, isLoading, error } = useDashboard()
  const [copied, setCopied] = useState(false)

  // Générer le lien de réservation
  const getBookingLink = () => {
    if (!salon?.id) return ''
    const baseUrl = process.env.NEXT_PUBLIC_MARKETPLACE_URL
    return `${baseUrl}/booking/${salon.id}`
  }

  const bookingLink = getBookingLink()

  // Copier le lien
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink)
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erreur lors de la copie')
    }
  }

  // Partager sur WhatsApp
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🎯 Réservez votre rendez-vous chez ${salon?.name || 'notre salon'} !\n\n` +
      `📅 Réservation en ligne : ${bookingLink}\n\n` +
      `✨ Simple, rapide et disponible 24h/24`
    )
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  // Prévisualiser la page de réservation
  const handlePreview = () => {
    window.open(bookingLink, '_blank')
  }

  // Construire les statistiques à partir des vraies données
  const stats = dashboardData ? [
    {
      title: "Rendez-vous aujourd'hui",
      value: dashboardData.stats.appointmentsToday.toString(),
      icon: <Calendar className="h-4 w-4" />,
      change: `${dashboardData.stats.appointmentsToday > 0 ? '+' : ''}${dashboardData.stats.appointmentsToday}`
    },
    {
      title: "Revenus du mois",
      value: `XAF ${(dashboardData.stats.monthlyRevenue).toFixed(2)}`,
      icon: <DollarSign className="h-4 w-4" />,
      change: "Ce mois"
    },
    {
      title: "Clients actifs",
      value: dashboardData.stats.activeClients.toString(),
      icon: <Users className="h-4 w-4" />,
      change: "Ce mois"
    },
    {
      title: "Taux d'occupation",
      value: `${Math.round(dashboardData.stats.occupancyRate)}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      change: "Estimation"
    }
  ] : []

  // Formater les réservations récentes (les 5 dernières)
  const recentAppointments = dashboardData ? dashboardData.recentReservations
    .map((res) => {
      const firstPerson = res.people?.[0]
      if (!firstPerson) return null
      
      const scheduledTime = firstPerson.scheduledAt.toDate()
      const timeString = scheduledTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      
      // Formater la date au format "25 - Mai 2026"
      const day = scheduledTime.getDate()
      const monthName = scheduledTime.toLocaleDateString('fr-FR', { month: 'long' })
      const year = scheduledTime.getFullYear()
      const dateString = `${day} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
      
      const durationMinutes = firstPerson.totalDuration
      const durationString = durationMinutes >= 60 
        ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 > 0 ? durationMinutes % 60 : ''}`
        : `${durationMinutes}min`

      return {
        date: dateString,
        time: timeString,
        client: res.clientName,
        service: firstPerson.serviceName,
        duration: durationString,
        status: res.status
      }
    })
    .filter((apt): apt is NonNullable<typeof apt> => apt !== null) : []

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={salon ? `Dashboard - ${salon.name}` : "Dashboard"}
          breadcrumbs={[
            { label: 'Salon', href: '/salon' },
            { label: 'Dashboard', isCurrent: true }
          ]}
        />

        <div className="space-y-6">
          {/* Informations du salon */}
          {salon && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Salon connecté
                  </CardTitle>
                  <a
                    href={`${process.env.NEXT_PUBLIC_MARKETPLACE_URL}/salon/details/${salon.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir la page du salon
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="font-medium">{salon.name}</p>
                    </div>
                  </div>
                  {salon.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">{salon.address}</p>
                      </div>
                    </div>
                  )}

                  {salon.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{salon.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Statistiques */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                  // Skeleton de chargement
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-7 w-16 bg-slate-200 rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-slate-100 rounded animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : error ? (
                  <div className="col-span-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Erreur lors du chargement des statistiques</p>
                  </div>
                ) : (
                  stats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </h3>
                          {stat.icon}
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">
                            {stat.change}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Rendez-vous récents (5 dernières réservations) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    5 dernières réservations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-16 bg-slate-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-600">Erreur lors du chargement des réservations</p>
                  ) : recentAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">Aucune réservation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentAppointments.map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-2 pl-6">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{appointment.time}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{appointment.client}</p>
                              <p className="text-sm text-muted-foreground">{appointment.service}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section de partage du lien de réservation */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Lien de réservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Votre lien de réservation
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={bookingLink}
                        readOnly
                        className="text-xs"
                        placeholder="Aucun salon connecté"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        disabled={!bookingLink}
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          "Copié!"
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Actions</p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handlePreview}
                        disabled={!bookingLink}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>

                      {salon && bookingLink && (
                        <div className="w-full">
                          <QRCodeDialog 
                            bookingUrl={bookingLink} 
                            salonName={salon.name}
                          />
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400"
                        onClick={handleWhatsAppShare}
                        disabled={!bookingLink}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Partager sur WhatsApp
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleCopyLink}
                        disabled={!bookingLink}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? "Lien copié!" : "Copier le lien"}
                      </Button>
                    </div>
                  </div>

                  {salon && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Partagez votre lien
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Vos clients peuvent réserver 24h/24 via ce lien. 
                            Partagez-le sur vos réseaux sociaux, votre site web ou par message.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistiques de réservation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Réservations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                          <div className="h-4 w-8 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cette semaine</span>
                        <span className="font-medium">{dashboardData?.stats.reservationsThisWeek || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Ce mois</span>
                        <span className="font-medium">{dashboardData?.stats.reservationsThisMonth || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Payas aujourd'hui</span>
                        <span className="font-medium text-green-600">
                          XAF {dashboardData ? (dashboardData.recentReservations
                            .filter(res => {
                              const firstPerson = res.people?.[0]
                              if (!firstPerson) return false
                              const scheduledDate = firstPerson.scheduledAt.toDate()
                              const today = new Date()
                              const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                              const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                              return scheduledDate >= startOfToday && scheduledDate < endOfToday && res.isPaid
                            })
                            .reduce((sum, res) => sum + res.totalPrice, 0)).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
