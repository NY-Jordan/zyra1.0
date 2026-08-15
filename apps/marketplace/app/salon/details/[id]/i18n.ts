'use client'

import { useSearchParams } from 'next/navigation'

export type SalonDetailsLocale = 'fr' | 'en'

interface SalonDetailsDictionary {
  breadcrumb: { home: string; category: string }
  notFound: { title: string; back: string }
  status: { open: string; closedToday: string; until: string; closed: string }
  actions: { showDirections: string; book: string }
  gallery: { onePhotoAlt: string; mainPhotoAlt: string; photoAlt: (n: number) => string; showAll: string; showAllCount: (n: number) => string }
  services: {
    title: string
    allCategories: string
    from: string
    book: string
    showMore: (n: number) => string
    showLess: string
    empty: string
    duration: { minutes: (m: number) => string; hours: (h: number) => string; hoursAndMinutes: (h: number, m: number) => string }
  }
  about: { title: string }
  team: { title: string }
  location: { title: string; mapTitle: string; directions: string }
  footer: { rights: string; poweredBy: string }
  days: Record<string, string>
}

const dayNamesEn: Record<string, string> = {
  Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday',
  Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
}

const dayNamesFr: Record<string, string> = {
  Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi',
  Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche',
}

export const salonDetailsDictionary: Record<SalonDetailsLocale, SalonDetailsDictionary> = {
  fr: {
    breadcrumb: { home: 'Accueil', category: 'Salon de coiffure' },
    notFound: { title: 'Salon introuvable', back: 'Retour' },
    status: { open: 'Ouvert', closedToday: "fermé aujourd'hui", until: "jusqu'à", closed: 'Fermé' },
    actions: { showDirections: "Afficher l'itinéraire", book: 'Réserver' },
    gallery: {
      onePhotoAlt: 'Photo',
      mainPhotoAlt: 'Photo principale',
      photoAlt: (n) => `Photo ${n}`,
      showAll: 'Afficher toutes les images',
      showAllCount: (n) => `Afficher toutes les images (${n})`,
    },
    services: {
      title: 'Prestations',
      allCategories: 'Toutes les catégories',
      from: 'à partir de',
      book: 'Réserver',
      showMore: (n) => `Afficher tout (${n})`,
      showLess: 'Voir moins',
      empty: 'Aucun service dans cette catégorie.',
      duration: {
        minutes: (m) => `${m} min`,
        hours: (h) => `${h}h`,
        hoursAndMinutes: (h, m) => `${h} h et ${m} min`,
      },
    },
    about: { title: 'À propos' },
    team: { title: 'Notre équipe' },
    location: { title: 'Localisation', mapTitle: 'Carte du salon', directions: 'Itinéraire' },
    footer: { rights: 'Tous droits réservés.', poweredBy: 'Propulsé par Zyraa' },
    days: dayNamesFr,
  },
  en: {
    breadcrumb: { home: 'Home', category: 'Hair salon' },
    notFound: { title: 'Salon not found', back: 'Back' },
    status: { open: 'Open', closedToday: 'closed today', until: 'until', closed: 'Closed' },
    actions: { showDirections: 'Get directions', book: 'Book now' },
    gallery: {
      onePhotoAlt: 'Photo',
      mainPhotoAlt: 'Main photo',
      photoAlt: (n) => `Photo ${n}`,
      showAll: 'Show all photos',
      showAllCount: (n) => `Show all photos (${n})`,
    },
    services: {
      title: 'Services',
      allCategories: 'All categories',
      from: 'from',
      book: 'Book now',
      showMore: (n) => `Show all (${n})`,
      showLess: 'Show less',
      empty: 'No services in this category.',
      duration: {
        minutes: (m) => `${m} min`,
        hours: (h) => `${h}h`,
        hoursAndMinutes: (h, m) => `${h}h ${m}min`,
      },
    },
    about: { title: 'About' },
    team: { title: 'Our team' },
    location: { title: 'Location', mapTitle: 'Salon map', directions: 'Directions' },
    footer: { rights: 'All rights reserved.', poweredBy: 'Powered by Zyraa' },
    days: dayNamesEn,
  },
}

/** Locale is picked purely from the `?lang=en` URL param — no cookie, no
 *  toggle UI. Anything not `en` (including absent) falls back to French. */
export function useSalonDetailsLocale(): { locale: SalonDetailsLocale; t: SalonDetailsDictionary } {
  const searchParams = useSearchParams()
  const locale: SalonDetailsLocale = searchParams.get('lang')?.toLowerCase() === 'en' ? 'en' : 'fr'
  return { locale, t: salonDetailsDictionary[locale] }
}
