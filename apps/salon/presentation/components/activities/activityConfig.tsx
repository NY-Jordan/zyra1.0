import React from 'react'
import {
  Calendar, CheckCircle, XCircle, Award, Scissors, ShoppingBag,
  UserPlus, User, UserMinus, Store, Wrench, Plus, Clock, CreditCard,
  Trash2, ToggleLeft, Tag, MapPin, Image, Info, Send, Bell,
} from 'lucide-react'
import { ActivityType, ResourceType } from '@zyra/core/types/notifications.types'

interface ActivityConfig {
  icon: React.ReactNode
  dotColor: string
  bgColor: string
  label: string
  actionVerb: string
}

export const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  // ── Reservations ────────────────────────────────────────────────────────────
  reservation_created: {
    icon: <Calendar className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Réservation créée',
    actionVerb: 'a créé',
  },
  reservation_confirmed: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    label: 'Réservation confirmée',
    actionVerb: 'a confirmé',
  },
  reservation_canceled: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Réservation annulée',
    actionVerb: 'a annulé',
  },
  reservation_completed: {
    icon: <Award className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Réservation terminée',
    actionVerb: 'a terminé',
  },
  reservation_hairdresser_changed: {
    icon: <Scissors className="h-3.5 w-3.5" />,
    dotColor: 'bg-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    label: 'Coiffeur modifié',
    actionVerb: 'a changé le coiffeur de',
  },
  reservation_paid: {
    icon: <CreditCard className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Réservation payée',
    actionVerb: 'a marqué comme payée',
  },
  reservation_checked_in: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Client arrivé',
    actionVerb: 'a marqué présent',
  },
  reservation_no_show: {
    icon: <UserMinus className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Client absent',
    actionVerb: 'a marqué absent',
  },
  reservation_rescheduled: {
    icon: <Clock className="h-3.5 w-3.5" />,
    dotColor: 'bg-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    label: 'Réservation reprogrammée',
    actionVerb: 'a reprogrammé',
  },
  reservation_person_status_changed: {
    icon: <User className="h-3.5 w-3.5" />,
    dotColor: 'bg-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    label: 'Statut d\'une personne modifié',
    actionVerb: 'a modifié le statut de',
  },

  // ── Orders ───────────────────────────────────────────────────────────────────
  order_created: {
    icon: <ShoppingBag className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    label: 'Commande créée',
    actionVerb: 'a créé',
  },
  order_completed: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Commande complétée',
    actionVerb: 'a complété',
  },
  order_canceled: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Commande annulée',
    actionVerb: 'a annulé',
  },
  order_paid: {
    icon: <CreditCard className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Commande payée',
    actionVerb: 'a marqué comme payée',
  },
  order_deleted: {
    icon: <Trash2 className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Commande supprimée',
    actionVerb: 'a supprimé',
  },

  // ── Clients ──────────────────────────────────────────────────────────────────
  client_created: {
    icon: <UserPlus className="h-3.5 w-3.5" />,
    dotColor: 'bg-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    label: 'Nouveau client',
    actionVerb: 'a enregistré',
  },
  client_updated: {
    icon: <User className="h-3.5 w-3.5" />,
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
    label: 'Client modifié',
    actionVerb: 'a mis à jour',
  },
  client_deleted: {
    icon: <UserMinus className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Client supprimé',
    actionVerb: 'a supprimé',
  },

  // ── Hairdressers ─────────────────────────────────────────────────────────────
  hairdresser_updated: {
    icon: <Scissors className="h-3.5 w-3.5" />,
    dotColor: 'bg-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    label: 'Coiffeur mis à jour',
    actionVerb: 'a mis à jour',
  },
  hairdresser_status_changed: {
    icon: <ToggleLeft className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    label: 'Statut coiffeur modifié',
    actionVerb: 'a modifié le statut de',
  },
  hairdresser_removed: {
    icon: <UserMinus className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Coiffeur retiré',
    actionVerb: 'a retiré',
  },
  hairdresser_invitation_created: {
    icon: <Send className="h-3.5 w-3.5" />,
    dotColor: 'bg-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    label: 'Invitation envoyée',
    actionVerb: 'a invité',
  },

  // ── Services ─────────────────────────────────────────────────────────────────
  service_created: {
    icon: <Plus className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Service créé',
    actionVerb: 'a créé le service',
  },
  service_updated: {
    icon: <Wrench className="h-3.5 w-3.5" />,
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
    label: 'Service modifié',
    actionVerb: 'a modifié le service',
  },
  service_deleted: {
    icon: <Trash2 className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Service supprimé',
    actionVerb: 'a supprimé le service',
  },
  service_toggled: {
    icon: <ToggleLeft className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    label: 'Service activé/désactivé',
    actionVerb: 'a modifié la visibilité du service',
  },

  // ── Categories ───────────────────────────────────────────────────────────────
  category_created: {
    icon: <Tag className="h-3.5 w-3.5" />,
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    label: 'Catégorie créée',
    actionVerb: 'a créé la catégorie',
  },
  category_updated: {
    icon: <Tag className="h-3.5 w-3.5" />,
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
    label: 'Catégorie modifiée',
    actionVerb: 'a modifié la catégorie',
  },
  category_deleted: {
    icon: <Trash2 className="h-3.5 w-3.5" />,
    dotColor: 'bg-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    label: 'Catégorie supprimée',
    actionVerb: 'a supprimé la catégorie',
  },
  category_toggled: {
    icon: <ToggleLeft className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    label: 'Catégorie activée/désactivée',
    actionVerb: 'a modifié la visibilité de la catégorie',
  },

  // ── Salon ────────────────────────────────────────────────────────────────────
  salon_updated: {
    icon: <Store className="h-3.5 w-3.5" />,
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
    label: 'Salon mis à jour',
    actionVerb: 'a mis à jour',
  },
  salon_info_updated: {
    icon: <Info className="h-3.5 w-3.5" />,
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
    label: 'Infos salon mises à jour',
    actionVerb: 'a mis à jour les informations de',
  },
  salon_location_updated: {
    icon: <MapPin className="h-3.5 w-3.5" />,
    dotColor: 'bg-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    label: 'Adresse mise à jour',
    actionVerb: 'a mis à jour l\'adresse de',
  },
  salon_hours_updated: {
    icon: <Clock className="h-3.5 w-3.5" />,
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    label: 'Horaires mis à jour',
    actionVerb: 'a modifié les horaires de',
  },
  salon_gallery_updated: {
    icon: <Image className="h-3.5 w-3.5" />,
    dotColor: 'bg-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    label: 'Galerie mise à jour',
    actionVerb: 'a mis à jour la galerie de',
  },
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType | 'all', string> = {
  all: 'Tout',
  reservation: 'Réservations',
  order: 'Commandes',
  client: 'Clients',
  hairdresser: 'Coiffeurs',
  service: 'Services',
  category: 'Catégories',
  salon: 'Salon',
  invitation: 'Invitations',
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const secs = Math.floor(diff / 1000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (secs < 60) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  if (hours < 24) return `il y a ${hours}h`
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days} j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function getDefaultFallback() {
  return {
    icon: <Clock className="h-3.5 w-3.5" />,
    dotColor: 'bg-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    label: 'Activité',
    actionVerb: 'a effectué une action',
  }
}
