export interface CookieBannerCopy {
  title: string
  description: string
  acceptAll: string
  rejectAll: string
  customize: string
}

export interface CookieSettingsCopy {
  title: string
  description: string
  necessary: { title: string; description: string }
  preferences: { title: string; description: string }
  alwaysActive: string
  save: string
  acceptAll: string
  cancel: string
}

export interface CookieCopy {
  banner: CookieBannerCopy
  settings: CookieSettingsCopy
  manage: string
}

/**
 * The cookie banner/modal render from the root layout, above where the
 * landing's LanguageProvider is mounted (it's only wrapped around the
 * homepage), so it can't consume that context. This tiny standalone
 * dictionary keeps it bilingual anyway without coupling the two systems.
 */
export const cookieCopy: Record<'fr' | 'en', CookieCopy> = {
  fr: {
    banner: {
      title: 'Nous respectons votre vie privée',
      description:
        "Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de préférences pour mémoriser votre langue et vos réglages d'affichage. Aucun cookie publicitaire.",
      acceptAll: 'Tout accepter',
      rejectAll: 'Refuser',
      customize: 'Personnaliser',
    },
    settings: {
      title: 'Préférences de cookies',
      description: 'Choisissez les catégories de cookies que vous autorisez. Vous pouvez changer d’avis à tout moment depuis "Gérer mes cookies".',
      necessary: {
        title: 'Cookies nécessaires',
        description: 'Indispensables au fonctionnement du site (mémorisation de votre consentement). Toujours actifs.',
      },
      preferences: {
        title: 'Cookies de préférences',
        description: "Mémorisent votre langue, votre thème et vos réglages d'affichage d'une visite à l'autre.",
      },
      alwaysActive: 'Toujours actif',
      save: 'Enregistrer mes choix',
      acceptAll: 'Tout accepter',
      cancel: 'Annuler',
    },
    manage: 'Gérer les cookies',
  },
  en: {
    banner: {
      title: 'We respect your privacy',
      description:
        "We use cookies necessary for the site to work and, with your consent, preference cookies to remember your language and display settings. No advertising cookies.",
      acceptAll: 'Accept all',
      rejectAll: 'Reject',
      customize: 'Customize',
    },
    settings: {
      title: 'Cookie preferences',
      description: 'Choose which categories of cookies you allow. You can change your mind anytime from "Manage cookies".',
      necessary: {
        title: 'Necessary cookies',
        description: 'Required for the site to work (remembering your consent choice). Always active.',
      },
      preferences: {
        title: 'Preference cookies',
        description: 'Remember your language, theme and display settings between visits.',
      },
      alwaysActive: 'Always active',
      save: 'Save my choices',
      acceptAll: 'Accept all',
      cancel: 'Cancel',
    },
    manage: 'Manage cookies',
  },
}

export type CookieLocale = keyof typeof cookieCopy
