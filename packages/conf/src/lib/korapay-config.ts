/**
 * Configuration Korapay pour l'environnement de développement et production
 */

export const korapayConfig = {
  // URLs des environnements
  sandbox: {
    baseUrl: 'https://api.korapay.com/merchant/api/v1',
    publicKey:  'pk_test_o2a9zh9TRXDFL39FFUpWaWd8RPsovpcppUm55jLq',
    secretKey: 'sk_test_b7thsTWddLG7haWqscPmMLM35QhLPPQB1Q22Ycsa',
  },
  production: {
    baseUrl: 'https://api.korapay.com/merchant/api/v1',
    publicKey:  'pk_test_o2a9zh9TRXDFL39FFUpWaWd8RPsovpcppUm55jLq',
    secretKey: 'sk_test_b7thsTWddLG7haWqscPmMLM35QhLPPQB1Q22Ycsa',
  },

  // Configuration courante basée sur l'environnement
  current: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',

  // Devises supportées
  supportedCurrencies: ['NGN', 'USD', 'GHS', 'KES', 'UGX'],

  // Méthodes de paiement supportées
  paymentMethods: {
    card: {
      enabled: true,
      supportedTypes: ['visa', 'mastercard', 'verve'],
      requiresEncryption: true
    },
    bankTransfer: {
      enabled: true,
      supportedCountries: ['NG', 'GH', 'KE', 'UG']
    },
    mobileMoney: {
      enabled: true,
      providers: ['mtn', 'airtel', 'vodafone', '9mobile']
    }
  },

  // Limites de transaction
  limits: {
    minimum: 100, // 1.00 NGN en kobo
    maximum: 10000000, // 100,000.00 NGN en kobo
    dailyLimit: 50000000 // 500,000.00 NGN en kobo
  },

  // Configuration des webhooks
  webhooks: {
    events: [
      'charge.success',
      'charge.failed',
      'transfer.success',
      'transfer.failed'
    ]
  },

  // Messages d'erreur personnalisés
  errorMessages: {
    'insufficient_funds': 'Fonds insuffisants sur votre compte',
    'invalid_card': 'Informations de carte invalides',
    'expired_card': 'Carte expirée',
    'declined': 'Transaction refusée par votre banque',
    'network_error': 'Erreur de réseau, veuillez réessayer',
    'invalid_otp': 'Code OTP invalide',
    'invalid_pin': 'PIN invalide',
  },

  // Timeout des requêtes (en millisecondes)
  requestTimeout: 30000,

  // Nombre de tentatives par défaut
  defaultRetries: 3,
}

/**
 * Récupère la configuration actuelle basée sur l'environnement
 */
export const getCurrentConfig = () => {
  const env = korapayConfig.current as keyof typeof korapayConfig
  if (env === 'production') {
    return korapayConfig.production
  }
  return korapayConfig.sandbox
}

/**
 * Vérifie si les clés API sont configurées
 */
export const validateKorapayConfig = () => {
  const config = getCurrentConfig()
  if (!config.publicKey) {
    throw new Error('KORAPAY_PUBLIC_KEY manquante dans les variables d\'environnement')
  }
  
  if (!config.secretKey) {
    throw new Error('KORAPAY_SECRET_KEY manquante dans les variables d\'environnement')
  }
  
  return true
}

/**
 * Convertit un montant en kobo (plus petite unité monétaire)
 */
export const toKobo = (amount: number): number => {
  return Math.round(amount * 100)
}

/**
 * Convertit un montant de kobo en devise principale
 */
export const fromKobo = (amount: number): number => {
  return amount / 100
}

/**
 * Formate un montant pour l'affichage
 */
export const formatAmount = (amount: number, currency: string = 'NGN'): string => {
  const formattedAmount = fromKobo(amount)
  
  switch (currency) {
    case 'NGN':
      return `₦${formattedAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    case 'USD':
      return `$${formattedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    case 'GHS':
      return `₵${formattedAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    default:
      return `${formattedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
  }
}

/**
 * Valide si un montant est dans les limites autorisées
 */
export const validateAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (amount < korapayConfig.limits.minimum) {
    return { 
      isValid: false, 
      error: `Le montant minimum est de ${formatAmount(korapayConfig.limits.minimum)}` 
    }
  }
  
  if (amount > korapayConfig.limits.maximum) {
    return { 
      isValid: false, 
      error: `Le montant maximum est de ${formatAmount(korapayConfig.limits.maximum)}` 
    }
  }
  
  return { isValid: true }
}
