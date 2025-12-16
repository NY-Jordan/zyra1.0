'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import QRCodeDialog from '@/presentation/components/dashboard/QRCodeDialog'
import { useSalon } from '@/hooks/useSalon'
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
  QrCode
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const { salon, isConnected } = useSalon()
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

  // Données mockées pour la démo
  const stats = [
    {
      title: "Rendez-vous aujourd'hui",
      value: "12",
      icon: <Calendar className="h-4 w-4" />,
      change: "+2 depuis hier"
    },
    {
      title: "Revenus du mois",
      value: "€2,340",
      icon: <DollarSign className="h-4 w-4" />,
      change: "+12% ce mois"
    },
    {
      title: "Clients actifs",
      value: "156",
      icon: <Users className="h-4 w-4" />,
      change: "+8 nouveaux"
    },
    {
      title: "Taux d'occupation",
      value: "78%",
      icon: <TrendingUp className="h-4 w-4" />,
      change: "+5% cette semaine"
    }
  ]

  const recentAppointments = [
    { time: "09:00", client: "Marie Dupont", service: "Coupe + Couleur", duration: "2h" },
    { time: "11:30", client: "Sophie Martin", service: "Brushing", duration: "1h" },
    { time: "14:00", client: "Claire Bernard", service: "Coupe", duration: "45min" },
    { time: "16:15", client: "Anna Rousseau", service: "Mèches", duration: "2h30" }
  ]

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
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
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
                {stats.map((stat, index) => (
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
                ))}
              </div>

              {/* Rendez-vous récents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rendez-vous d'aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAppointments.map((appointment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.time}</span>
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
                        className="w-full justify-start bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
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
                  <CardTitle className="text-sm">Réservations en ligne</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cette semaine</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ce mois</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taux de conversion</span>
                    <span className="font-medium text-green-600">67%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
