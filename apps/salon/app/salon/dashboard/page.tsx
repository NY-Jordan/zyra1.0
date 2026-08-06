'use client'
import React, { useState } from 'react'
import { Input } from '@zyra/ui/components/input'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import QRCodeDialog from '@/presentation/components/dashboard/QRCodeDialog'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useDashboard } from '@/hooks/useDashboard'
import { useBookingAccess } from '@/hooks/useBookingAccess'
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
  Lock,
  Scissors,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminAuth } from '@zyra/conf/lib/firebase-admin'
import { unknown } from 'zod'

const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

// ── Locked overlay ────────────────────────────────────────────────────────────

function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-[#F0EAE4] dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm">
        <Lock className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Service + coiffeur requis
        </span>
      </div>
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, change, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; change?: string; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[19px] font-extrabold text-slate-800 dark:text-white leading-none truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">{label}</p>
      </div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">{title}</h3>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { salon } = useSalon()
  const { data: dashboardData, isLoading, error } = useDashboard()
  const { isReady } = useBookingAccess()
  const [copied, setCopied] = useState(false)

  const getBookingLink = () => {
    if (!salon?.id) return ''
    return `${process.env.NEXT_PUBLIC_MARKETPLACE_URL}/booking/${salon.id}`
  }
  const bookingLink = getBookingLink()

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink)
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🎯 Réservez votre rendez-vous chez ${salon?.name || 'notre salon'} !\n\n` +
      `📅 Réservation en ligne : ${bookingLink}\n\n` +
      `✨ Simple, rapide et disponible 24h/24`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const stats = dashboardData ? [
    {
      title: "Rendez-vous aujourd'hui",
      value: dashboardData.stats.appointmentsToday.toString(),
      icon: <Calendar className="h-5 w-5" />,
      bg: 'bg-[#ECF6FE] dark:bg-sky-950/20',
      iconColor: 'text-sky-600',
      locked: true,
    },
    {
      title: 'Revenus du mois',
      value: `${dashboardData.stats.monthlyRevenue.toFixed(2)} XAF`,
      icon: <DollarSign className="h-5 w-5" />,
      bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600',
      locked: true,
    },
    {
      title: 'Clients actifs',
      value: dashboardData.stats.activeClients.toString(),
      icon: <Users className="h-5 w-5" />,
      bg: 'bg-[#F2EDFE] dark:bg-violet-950/20',
      iconColor: 'text-violet-600',
      locked: true,
    },
    {
      title: "Taux d'occupation",
      value: `${Math.round(dashboardData.stats.occupancyRate)}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      bg: 'bg-[#FEF1EC] dark:bg-rose-950/20',
      iconColor: 'text-rose-500',
      locked: true,
    },
  ] : []

  const recentAppointments = dashboardData
    ? dashboardData.recentReservations
        .map((res) => {
          const firstPerson = res.people?.[0]
          if (!firstPerson) return null
          const scheduledTime = firstPerson.scheduledAt.toDate()
          const timeString = scheduledTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          const day = scheduledTime.getDate()
          const monthName = scheduledTime.toLocaleDateString('fr-FR', { month: 'long' })
          const year = scheduledTime.getFullYear()
          const dateString = `${day} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
          const durationMinutes = firstPerson.totalDuration
          const durationString = durationMinutes >= 60
            ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 > 0 ? durationMinutes % 60 : ''}`
            : `${durationMinutes}min`
          return { date: dateString, time: timeString, client: res.clientName, service: firstPerson.serviceName, duration: durationString, status: res.status }
        })
        .filter((a): a is NonNullable<typeof a> => a !== null)
    : []

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={salon ? `Dashboard - ${salon.name}` : 'Dashboard'}
          breadcrumbs={[
            { label: 'Salon', href: '/salon' },
            { label: 'Dashboard', isCurrent: true },
          ]}
        />

        <div className="space-y-5">

          {/* Salon info card */}
          {salon && (
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden shadow-sm shadow-emerald-500/20 flex-shrink-0">
                  {salon?.logo
                    ? <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
                    : <>
                      <img src="/images/icon-light.png" alt="Zyraa" className="relative w-44 h-auto dark:hidden" />
                      <img src="/images/icon-dark.png" alt="Zyraa" className="relative hidden w-44 h-auto dark:block" />
                    </>
                  }
                </div>
                  <h3 className="text-[14px] font-extrabold text-slate-800 dark:text-white">Salon connecté</h3>
                </div>
                {isReady ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_MARKETPLACE_URL}/salon/details/${salon.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Voir la page du salon
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold text-slate-400 dark:text-slate-600 rounded-xl cursor-not-allowed select-none">
                    <Lock className="h-3.5 w-3.5" />
                    Voir la page du salon
                  </div>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Nom</p>
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{salon.name}</p>
                  </div>
                </div>
                {salon.address && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Adresse</p>
                      <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{salon.address}</p>
                    </div>
                  </div>
                )}
                {salon.phone && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Téléphone</p>
                      <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{salon.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">

              {/* Stats cards */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`${card} p-4`}>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </div>
                    ))
                  : error
                  ? (
                    <div className="col-span-4 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl">
                      <p className="text-[13px] text-rose-600 dark:text-rose-400">Erreur lors du chargement des statistiques</p>
                    </div>
                  )
                  : stats.map((stat, i) => (
                    <div key={i} className="relative">
                      <div className={!isReady && stat.locked ? 'opacity-50 select-none' : ''}>
                        <KpiCard icon={stat.icon} label={stat.title} value={stat.value} bg={stat.bg} iconColor={stat.iconColor} />
                      </div>
                      {!isReady && stat.locked && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                          <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>

              {/* Réservations récentes */}
              <div className="relative">
                <div className={`${card} p-5 ${!isReady ? 'opacity-50 select-none pointer-events-none' : ''}`}>
                  <SectionHeader icon={<Calendar className="h-3.5 w-3.5" />} title="5 dernières réservations" />
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : error ? (
                    <p className="text-[13px] text-rose-500">Erreur lors du chargement des réservations</p>
                  ) : recentAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-[13px] text-slate-400">Aucune réservation</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentAppointments.map((apt, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                <Calendar className="h-3 w-3" />
                                <span className="text-[11px] font-medium">{apt.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 pl-[18px]">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{apt.time}</span>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{apt.client}</p>
                              <p className="text-[12px] text-slate-400 truncate">{apt.service}</p>
                            </div>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400 flex-shrink-0">{apt.duration}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!isReady && <LockedOverlay />}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Lien de réservation */}
              <div className="relative">
                <div className={`${card} p-5 ${!isReady ? 'opacity-50 select-none pointer-events-none' : ''}`}>
                  <SectionHeader icon={<Share2 className="h-3.5 w-3.5" />} title="Lien de réservation" />
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
                        Votre lien de réservation
                      </label>
                      <div className="flex gap-2">
                        <Input value={bookingLink} readOnly className="text-[11px] h-9 rounded-xl border-[#E8E0D8] dark:border-slate-700" placeholder="Aucun salon connecté" />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          disabled={!bookingLink}
                          className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl border border-[#E8E0D8] dark:border-slate-700 text-slate-500 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                        >
                          {copied ? <span className="text-[10px] font-bold text-emerald-600">OK</span> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Actions</p>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => window.open(bookingLink, '_blank')}
                          disabled={!bookingLink}
                          className="w-full flex items-center gap-2 h-9 px-3 rounded-xl border border-[#E8E0D8] dark:border-slate-700 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Prévisualiser
                        </button>
                        {salon && bookingLink && (
                          <div className="w-full">
                            <QRCodeDialog bookingUrl={bookingLink} salonName={salon.name} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleWhatsAppShare}
                          disabled={!bookingLink}
                          className="w-full flex items-center gap-2 h-9 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 disabled:opacity-40 transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Partager sur WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          disabled={!bookingLink}
                          className="w-full flex items-center gap-2 h-9 px-3 rounded-xl border border-[#E8E0D8] dark:border-slate-700 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copied ? 'Lien copié!' : 'Copier le lien'}
                        </button>
                      </div>
                    </div>
                    {salon && (
                      <div className="flex items-start gap-2.5 px-3.5 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
                        <ExternalLink className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Partagez votre lien</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                            Vos clients peuvent réserver 24h/24 via ce lien. Partagez-le sur vos réseaux sociaux, votre site web ou par message.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {!isReady && <LockedOverlay />}
              </div>

              {/* Statistiques de réservation */}
              <div className="relative">
                <div className={`${card} p-5 ${!isReady ? 'opacity-50 select-none pointer-events-none' : ''}`}>
                  <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-3">Réservations</h3>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-slate-500 dark:text-slate-400">Cette semaine</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{dashboardData?.stats.reservationsThisWeek || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-slate-500 dark:text-slate-400">Ce mois</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{dashboardData?.stats.reservationsThisMonth || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-[13px] pt-2 border-t border-[#F0EAE4] dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400">Payés aujourd'hui</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {dashboardData
                            ? dashboardData.recentReservations
                                .filter((res) => {
                                  const first = res.people?.[0]
                                  if (!first) return false
                                  const d = first.scheduledAt.toDate()
                                  const today = new Date()
                                  return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
                                    && d < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                                    && res.isPaid
                                })
                                .reduce((s, r) => s + r.totalPrice, 0)
                                .toFixed(2)
                            : '0.00'} XAF
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {!isReady && <LockedOverlay />}

                {/* Setup prompt when not ready */}
                {!isReady && (
                  <div className="mt-3 flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3">
                    <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        Complétez la configuration
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                        Créez au moins un <span className="font-semibold">service</span> et associez un <span className="font-semibold">coiffeur</span> pour débloquer les réservations.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <a href="/salon/services" className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2 flex items-center gap-1">
                          <Scissors className="w-3 h-3" /> Services
                        </a>
                        <span className="text-amber-400">·</span>
                        <a href="/salon/hair-dressers" className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Coiffeurs
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
