export type Locale = 'fr' | 'en'

export const LOCALES: Locale[] = ['fr', 'en']

interface TitledPoint {
  title: string
  description: string
}

interface Testimonial {
  name: string
  role: string
  quote: string
}

interface ProductColumn {
  title: string
  links: [string, string, string]
}

interface AccountColumn {
  title: string
  links: [string, string]
}

interface SupportColumn {
  title: string
  links: [string, string]
}

export interface LandingDictionary {
  nav: {
    features: string
    pricing: string
    testimonials: string
    login: string
    cta: string
    openMenu: string
    closeMenu: string
  }
  hero: {
    titleLine1: string
    titleAccent: string
    description: string
    ctaPrimary: string
    ctaSecondary: string
    note: string
  }
  problem: {
    eyebrow: string
    titlePre: string
    titleAccent: string
    titlePost: string
    description: string
    points: [TitledPoint, TitledPoint, TitledPoint]
  }
  solution: {
    eyebrow: string
    titlePre: string
    titleAccent: string
    titlePost: string
    description: string
    points: [string, string, string, string]
  }
  features: {
    titlePre: string
    titleAccent: string
    titlePost: string
    description: string
    items: [TitledPoint, TitledPoint, TitledPoint, TitledPoint]
  }
  demo: {
    titlePre: string
    titleAccent: string
    titlePost: string
    description: string
    tabs: [string, string, string]
  }
  mobileApp: {
    eyebrow: string
    titlePre: string
    titleAccent: string
    titlePost: string
    description: string
    points: [string, string, string]
  }
  pricing: {
    titlePre: string
    titleAccent: string
    titlePost: string
    description: string
    planName: string
    priceSuffix: string
    planDescription: string
    features: [string, string, string, string, string]
    cta: string
  }
  testimonials: {
    titlePre: string
    titleAccent: string
    titlePost: string
    items: [Testimonial, Testimonial, Testimonial]
  }
  contact: {
    titlePre: string
    titleAccent: string
    description: string
    form: {
      name: string
      namePlaceholder: string
      email: string
      emailPlaceholder: string
      phone: string
      phoneOptional: string
      phonePlaceholder: string
      message: string
      messagePlaceholder: string
      submit: string
      success: string
      errorGeneric: string
      nameRequired: string
      emailRequired: string
      emailInvalid: string
      messageRequired: string
    }
  }
  footer: {
    description: string
    columns: [ProductColumn, AccountColumn, SupportColumn]
    copyright: string
    privacy: string
    terms: string
  }
}

export const dictionary: Record<Locale, LandingDictionary> = {
  fr: {
    nav: {
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      testimonials: 'Témoignages',
      login: 'Se connecter',
      cta: 'Essayer gratuitement',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
    },
    hero: {
      titleLine1: 'Votre salon géré simplement,',
      titleAccent: 'Vos clients toujours satisfaits.',
      description:
        "Rendez-vous, équipe, paiements et statistiques dans une seule application. Zyraa remplace le carnet, les appels manqués et les tableurs — pour de bon.",
      ctaPrimary: 'Créer mon espace gratuitement',
      ctaSecondary: 'Voir les fonctionnalités',
      note: 'Aucune carte bancaire requise · Configuré en 5 minutes',
    },
    problem: {
      eyebrow: 'Le problème',
      titlePre: 'Les salons perdent des ',
      titleAccent: 'clients',
      titlePost: ' à cause des réservations manuelles',
      description: "Sans un vrai système, chaque créneau dépend d'un appel décroché au bon moment.",
      points: [
        {
          title: 'Appels manqués',
          description: 'Chaque appel raté pendant une coupe est un rendez-vous — et un client — perdu.',
        },
        {
          title: 'Carnet papier ou tableur',
          description: "Double réservations, écriture illisible, aucune vue d'ensemble sur la journée.",
        },
        {
          title: 'Temps perdu en gestion',
          description: 'Des heures par semaine passées à confirmer, relancer et recompter les caisses à la main.',
        },
      ],
    },
    solution: {
      eyebrow: 'La solution',
      titlePre: 'Gérez vos rendez-vous en quelques ',
      titleAccent: 'clics',
      titlePost: '',
      description:
        "Zyraa centralise la prise de rendez-vous, la gestion de l'équipe et le suivi des paiements dans une seule application, pensée pour aller vite entre deux clients.",
      points: [
        'Réservation en ligne 24h/24, sans appel',
        'Rappels automatiques pour réduire les absences',
        'Caisse et paiements suivis en temps réel',
        "Toute l'équipe sur la même agenda, à jour partout",
      ],
    },
    features: {
      titlePre: "Tout ce qu'il faut pour faire tourner votre ",
      titleAccent: 'salon',
      titlePost: '',
      description: 'Quatre outils essentiels, réunis dans une interface simple à prendre en main dès le premier jour.',
      items: [
        {
          title: 'Calendrier',
          description:
            "Un agenda partagé par toute l'équipe, avec créneaux, coiffeurs et services synchronisés en temps réel.",
        },
        {
          title: 'Gestion clients',
          description: 'Historique complet, coordonnées et préférences de chaque client, accessibles en un instant.',
        },
        {
          title: 'Notifications',
          description: 'Rappels automatiques par SMS et email pour réduire les absences et les annulations tardives.',
        },
        {
          title: 'Statistiques',
          description:
            "Revenus, taux d'occupation et services les plus demandés — pour piloter le salon au jour le jour.",
        },
      ],
    },
    demo: {
      titlePre: 'Voyez Zyraa en ',
      titleAccent: 'action',
      titlePost: '',
      description: 'Un aperçu des écrans que votre équipe utilise chaque jour.',
      tabs: ['Dashboard', 'Réservations', 'Clients'],
    },
    mobileApp: {
      eyebrow: 'Application mobile',
      titlePre: 'Votre salon dans votre ',
      titleAccent: 'poche',
      titlePost: '',
      description:
        "Suivez votre salon depuis votre téléphone, partout où vous êtes. L'app Zyraa n'est pas réservée aux propriétaires : toute votre équipe peut l'utiliser au quotidien.",
      points: [
        'Agenda, commandes et clients synchronisés en temps réel, où que vous soyez',
        "Accès sécurisé pour toute l'équipe, selon le rôle de chacun",
        'Notifications instantanées pour ne jamais rater un rendez-vous',
      ],
    },
    pricing: {
      titlePre: 'Un tarif ',
      titleAccent: 'simple',
      titlePost: ', sans surprise',
      description: 'Un seul forfait, tout inclus. Sans engagement.',
      planName: 'Zyraa Pro',
      priceSuffix: 'XAF / mois',
      planDescription: "Pour un salon, sans limite d'équipe.",
      features: [
        'Salon et équipe illimités',
        'Réservations en ligne 24h/24',
        'Rappels automatiques par SMS et email',
        'Statistiques et suivi des paiements',
        'Support prioritaire',
      ],
      cta: 'Créer mon espace',
    },
    testimonials: {
      titlePre: 'Ils gèrent leur salon avec ',
      titleAccent: 'Zyraa',
      titlePost: '',
      items: [
        {
          name: 'Awa Zogo',
          role: 'Propriétaire, Zyraa Coiffure — Douala',
          quote:
            "Depuis Zyraa, on ne perd plus un seul rendez-vous. Les clientes réservent seules le soir, et je vois tout d'un coup d'œil le matin.",
        },
        {
          name: 'Junior Foka',
          role: 'Coiffeur indépendant — Yaoundé',
          quote:
            "L'app mobile me permet de voir mon planning et mes clients où que je sois. Fini les allers-retours au salon pour vérifier l'agenda.",
        },
        {
          name: 'Clarisse Ebogo',
          role: 'Manager, salon multi-sites',
          quote:
            'La gestion des rôles et des permissions nous a fait gagner un temps fou avec une équipe de 12 personnes réparties sur 3 salons.',
        },
      ],
    },
    contact: {
      titlePre: 'Essayez Zyraa ',
      titleAccent: 'gratuitement',
      description:
        'Laissez-nous vos coordonnées, on vous crée votre espace et on vous accompagne au démarrage.',
      form: {
        name: 'Nom complet',
        namePlaceholder: 'Ex: Awa Zogo',
        email: 'Adresse e-mail',
        emailPlaceholder: 'exemple@domaine.com',
        phone: 'Téléphone',
        phoneOptional: '(optionnel)',
        phonePlaceholder: '+237 6 90 00 00 00',
        message: 'Votre salon, en quelques mots',
        messagePlaceholder: 'Nom du salon, nombre de coiffeurs, ville...',
        submit: 'Envoyer ma demande',
        success: 'Message envoyé — nous revenons vers vous rapidement.',
        errorGeneric: 'Une erreur est survenue. Réessayez.',
        nameRequired: 'Le nom est requis',
        emailRequired: "L'adresse e-mail est requise",
        emailInvalid: "L'adresse e-mail est invalide",
        messageRequired: 'Un petit message nous aide à mieux vous accompagner',
      },
    },
    footer: {
      description:
        "La plateforme tout-en-un pour gérer les rendez-vous, l'équipe et les paiements de votre salon.",
      columns: [
        { title: 'Produit', links: ['Fonctionnalités', 'Tarifs', 'Témoignages'] },
        { title: 'Compte', links: ['Se connecter', 'Créer mon espace'] },
        { title: 'Support', links: ["Centre d'aide", 'Contact'] },
      ],
      copyright: 'Tous droits réservés',
      privacy: 'Confidentialité',
      terms: 'CGU',
    },
  },
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      testimonials: 'Testimonials',
      login: 'Log in',
      cta: 'Try for free',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    hero: {
      titleLine1: 'Your salon, managed simply,',
      titleAccent: 'Your clients, always happy.',
      description:
        'Appointments, team, payments and stats in a single app. Zyraa replaces the notebook, missed calls and spreadsheets — for good.',
      ctaPrimary: 'Create my free space',
      ctaSecondary: 'See the features',
      note: 'No credit card required · Set up in 5 minutes',
    },
    problem: {
      eyebrow: 'The problem',
      titlePre: 'Salons lose ',
      titleAccent: 'clients',
      titlePost: ' because of manual bookings',
      description: 'Without a real system, every time slot depends on a call answered at just the right moment.',
      points: [
        {
          title: 'Missed calls',
          description: 'Every missed call during a haircut is a lost appointment — and a lost client.',
        },
        {
          title: 'Paper book or spreadsheet',
          description: 'Double bookings, illegible handwriting, no overview of the day.',
        },
        {
          title: 'Time lost on admin',
          description: 'Hours every week spent confirming, following up, and recounting the till by hand.',
        },
      ],
    },
    solution: {
      eyebrow: 'The solution',
      titlePre: 'Manage your appointments in a few ',
      titleAccent: 'clicks',
      titlePost: '',
      description:
        "Zyraa centralizes booking, team management and payment tracking in a single app, built to move fast between two clients.",
      points: [
        'Online booking 24/7, no phone calls',
        'Automatic reminders to reduce no-shows',
        'Till and payments tracked in real time',
        'The whole team on the same up-to-date schedule, everywhere',
      ],
    },
    features: {
      titlePre: 'Everything you need to run your ',
      titleAccent: 'salon',
      titlePost: '',
      description: "Four essential tools, brought together in an interface that's easy to pick up from day one.",
      items: [
        {
          title: 'Calendar',
          description: 'A schedule shared by the whole team, with slots, stylists and services synced in real time.',
        },
        {
          title: 'Client management',
          description: 'Full history, contact details and preferences for every client, available instantly.',
        },
        {
          title: 'Notifications',
          description: 'Automatic SMS and email reminders to reduce no-shows and late cancellations.',
        },
        {
          title: 'Statistics',
          description: 'Revenue, occupancy rate and most requested services — to run the salon day to day.',
        },
      ],
    },
    demo: {
      titlePre: 'See Zyraa in ',
      titleAccent: 'action',
      titlePost: '',
      description: 'A look at the screens your team uses every day.',
      tabs: ['Dashboard', 'Bookings', 'Clients'],
    },
    mobileApp: {
      eyebrow: 'Mobile app',
      titlePre: 'Your salon in your ',
      titleAccent: 'pocket',
      titlePost: '',
      description:
        "Keep track of your salon from your phone, wherever you are. The Zyraa app isn't just for owners: your whole team can use it every day.",
      points: [
        'Schedule, orders and clients synced in real time, wherever you are',
        "Secure access for the whole team, based on each person's role",
        'Instant notifications so you never miss an appointment',
      ],
    },
    pricing: {
      titlePre: 'One ',
      titleAccent: 'simple',
      titlePost: ' price, no surprises',
      description: 'A single plan, all included. No commitment.',
      planName: 'Zyraa Pro',
      priceSuffix: 'XAF / month',
      planDescription: 'For one salon, with no team size limit.',
      features: [
        'Unlimited salon and team',
        'Online booking 24/7',
        'Automatic SMS and email reminders',
        'Stats and payment tracking',
        'Priority support',
      ],
      cta: 'Create my space',
    },
    testimonials: {
      titlePre: 'They run their salon with ',
      titleAccent: 'Zyraa',
      titlePost: '',
      items: [
        {
          name: 'Awa Zogo',
          role: 'Owner, Zyraa Coiffure — Douala',
          quote:
            "Since Zyraa, we haven't missed a single appointment. Clients book by themselves in the evening, and I see everything at a glance in the morning.",
        },
        {
          name: 'Junior Foka',
          role: 'Independent stylist — Yaoundé',
          quote:
            'The mobile app lets me see my schedule and my clients wherever I am. No more trips back to the salon to check the calendar.',
        },
        {
          name: 'Clarisse Ebogo',
          role: 'Manager, multi-site salon',
          quote:
            'Role and permission management saved us a huge amount of time with a 12-person team spread across 3 salons.',
        },
      ],
    },
    contact: {
      titlePre: 'Try Zyraa ',
      titleAccent: 'for free',
      description: "Leave us your details, we'll set up your space and help you get started.",
      form: {
        name: 'Full name',
        namePlaceholder: 'E.g. Awa Zogo',
        email: 'Email address',
        emailPlaceholder: 'example@domain.com',
        phone: 'Phone',
        phoneOptional: '(optional)',
        phonePlaceholder: '+237 6 90 00 00 00',
        message: 'Your salon, in a few words',
        messagePlaceholder: 'Salon name, number of stylists, city...',
        submit: 'Send my request',
        success: "Message sent — we'll get back to you shortly.",
        errorGeneric: 'Something went wrong. Please try again.',
        nameRequired: 'Name is required',
        emailRequired: 'Email address is required',
        emailInvalid: 'Email address is invalid',
        messageRequired: 'A short message helps us support you better',
      },
    },
    footer: {
      description: 'The all-in-one platform to manage appointments, your team and payments for your salon.',
      columns: [
        { title: 'Product', links: ['Features', 'Pricing', 'Testimonials'] },
        { title: 'Account', links: ['Log in', 'Create my space'] },
        { title: 'Support', links: ['Help center', 'Contact'] },
      ],
      copyright: 'All rights reserved',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },
}
