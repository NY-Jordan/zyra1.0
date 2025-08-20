// Traductions pour les features en français
export const featuresTranslations = {
  fr: {
    analytics: {
      name: "Statistiques avancées",
      description: "Accès aux rapports détaillés et analyses avancées"
    },
    booking_limit: {
      name: "Limite de réservations",
      description: "Nombre maximum de réservations par mois"
    },
    custom_branding: {
      name: "Personnalisation de marque",
      description: "Possibilité de personnaliser l'interface avec sa marque"
    },
    email_notifications: {
      name: "Notifications par email",
      description: "Système de notifications automatiques par email"
    },
    staff_management: {
      name: "Gestion du personnel",
      description: "Gestion avancée des employés et horaires"
    },
    max_services: {
      name: "Nombre maximum de services",
      description: "Limite du nombre de services proposés"
    },
    online_payment: {
      name: "Paiement en ligne",
      description: "Accepter les paiements en ligne via la plateforme"
    },
    appointment_reminder: {
      name: "Rappels de rendez-vous",
      description: "Envoyer des rappels automatiques aux clients"
    },
    multi_location: {
      name: "Multi-emplacements",
      description: "Gérer plusieurs salons depuis un seul compte"
    },
    storage_limit: {
      name: "Limite de stockage",
      description: "Espace de stockage pour les images et documents (en GB)"
    }
  },
  en: {
    analytics: {
      name: "Advanced Analytics",
      description: "Access to detailed reports and advanced analytics"
    },
    booking_limit: {
      name: "Booking Limit",
      description: "Maximum number of bookings per month"
    },
    custom_branding: {
      name: "Custom Branding",
      description: "Ability to customize the interface with your brand"
    },
    email_notifications: {
      name: "Email Notifications",
      description: "Automatic email notification system"
    },
    staff_management: {
      name: "Staff Management",
      description: "Advanced employee and schedule management"
    },
    max_services: {
      name: "Maximum Services",
      description: "Limit on the number of services offered"
    },
    online_payment: {
      name: "Online Payment",
      description: "Accept online payments through the platform"
    },
    appointment_reminder: {
      name: "Appointment Reminders",
      description: "Send automatic reminders to clients"
    },
    multi_location: {
      name: "Multi-Location",
      description: "Manage multiple salons from one account"
    },
    storage_limit: {
      name: "Storage Limit",
      description: "Storage space for images and documents (in GB)"
    }
  }
}

export type LanguageCode = keyof typeof featuresTranslations
export type FeatureKey = keyof typeof featuresTranslations.fr

// Fonction utilitaire pour obtenir les traductions
export const getFeatureTranslation = (
  key: string,
  language: LanguageCode = 'fr'
): { name: string; description: string } => {
  const translations = featuresTranslations[language]
  const translation = translations[key as FeatureKey]
  
  if (!translation) {
    // Fallback vers le français si la traduction n'existe pas
    return featuresTranslations.fr[key as FeatureKey] || {
      name: key,
      description: key
    }
  }
  
  return translation
}
