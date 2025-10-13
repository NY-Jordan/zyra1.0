export interface KoraPayConfig {
  publicKey: string
  secretKey: string
  baseUrl?: string
}

export interface CustomerInfo {
  name: string
  email: string
}

export interface CardInfo {
  name: string
  number: string
  cvv: string
  expiry_month: string
  expiry_year: string
  pin?: string
}

export interface BankTransferInfo {
  bank_code: string
  account_number: string
}

export interface MobileMoneyInfo {
  number: string // Numéro de téléphone au format international
}

export interface ChargeRequest {
  reference: string
  amount: number
  currency: string
  description?: string
  notification_url?: string
  redirect_url?: string
  customer: CustomerInfo
  merchant_bears_cost?: boolean
  metadata?: Record<string, any>
}

export interface CardChargeRequest extends ChargeRequest {
  card: CardInfo
}

export interface BankTransferChargeRequest extends ChargeRequest {
  bank_transfer: BankTransferInfo
}

export interface MobileMoneyChargeRequest extends ChargeRequest {
  mobile_money: MobileMoneyInfo
}

export interface AuthorizationRequest {
  reference: string
    pin?: string
    token?: string
    otp?: string
    avs?: {
      state: string
      city: string
      country: string
      address: string
      zip_codes: string
    }
}



export interface KoraPayResponse<T = any> {
  status: boolean
  message: string
  data: T
}

export interface ChargeResponse {
  amount: number
  amount_charged: number
  auth_model?: 'PIN' | 'OTP' | '3DS' | 'STK' | 'NONE' | 'STK_PROMPT' | 'USSD' | 'BANK_TRANSFER' // Types d'autorisation spécifiques pour tous les paiements
  currency: string
  fee: number
  vat: number
  message: string
  payment_reference: string
  transaction_reference: string
  status: 'success' | 'processing' | 'failed' | 'pending'
  response_message?: string // Message d'instruction pour l'utilisateur
  payment_method?: 'card' | 'mobile_money' | 'bank_transfer' // Type de méthode de paiement utilisée
  provider?: string // Fournisseur du service (MTN, Orange, Moov, etc.)
  card?: {
    card_type: string
    first_six: string
    last_four: string
    expiry: string
  }
  mobile_money?: {
    provider: string
    number: string
  }
  authorization?: {
    required_fields?: string[]
    redirect_url?: string
  }
  metadata?: Record<string, any>
}

export class KoraPaymentService {
  private config: KoraPayConfig
  private baseUrl: string

  constructor(config: KoraPayConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.korapay.com/merchant/api/v1'
  }

  /**
   * Génère une référence unique pour les transactions
   */
  generateReference(prefix: string = 'ZYRA'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Effectue une requête HTTP vers l'API Korapay
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    useSecretKey: boolean = true
  ): Promise<KoraPayResponse<T>> {

    const url = `${this.baseUrl}${endpoint}`

    const token = useSecretKey ? this.config.secretKey : this.config.publicKey

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }).catch((error) => {
        console.log(error);
      throw new Error(`Network Error: ${error}`)
    } );

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Korapay API Error: ${result.message || 'Unknown error'}`)
    }

    return result
  }

  /**
   * Charge une carte bancaire - Étape 1
   */
  async chargeCard(request: CardChargeRequest): Promise<KoraPayResponse<ChargeResponse>> {
    // Validation de la référence (au moins 8 caractères)
    if (request.reference.length < 8) {
      throw new Error('La référence doit avoir au moins 8 caractères')
    }

    // Note: Dans un vrai scénario, vous devriez chiffrer les données de carte
    // Voir la documentation Korapay pour l'implémentation du chiffrement
    const payload = {
      reference: request.reference,
      card: {
        name: request.card.name,
        number: request.card.number,
        cvv: request.card.cvv,
        expiry_month: request.card.expiry_month,
        expiry_year: request.card.expiry_year,
        pin: request.card.pin || '0000'
      },
      amount: request.amount,
      currency: request.currency,
      redirect_url: request.redirect_url,
      customer: request.customer,
      metadata: request.metadata
    }

    return this.makeRequest<ChargeResponse>('/charges/card', 'POST', payload)
  }

  /**
   * Autorise une charge de carte - Étape 2
   */
  async authorizeCardCharge(request: AuthorizationRequest): Promise<KoraPayResponse<ChargeResponse>> {
    return this.makeRequest<ChargeResponse>('/charges/card/authorize', 'POST', request)
  }

  /**
   * Autorise une charge mobile money - Étape 2
   * Utilisé pour valider l'OTP des paiements STK et Mobile Money
   */
  async authorizeMobileMoneyCharge(request: AuthorizationRequest): Promise<KoraPayResponse<ChargeResponse>> {
    console.log('Authorizing mobile money charge with OTP:', {
      reference: request.reference,
      pin: request.pin
    })

    return this.makeRequest<ChargeResponse>('/charges/mobile-money/authorize', 'POST', request)
  }

  async authorizeMobileMoneyChargeWithSTK(request: AuthorizationRequest): Promise<KoraPayResponse<ChargeResponse>> {
    console.log('Authorizing mobile money charge with OTP:', {
      reference: request.reference,
      pin: request.pin
    })

    return this.makeRequest<ChargeResponse>('/charges/mobile-money/sandbox/authorize-stk', 'POST', request)
  }

  /**
   * Valide spécifiquement un OTP pour un paiement mobile money (STK Push, Mobile Money)
   * Cette méthode est optimisée pour les paiements mobiles nécessitant une validation OTP
   */
  async validateMobileMoneyOtp(transactionReference: string, otp: string): Promise<KoraPayResponse<ChargeResponse>> {
    const authRequest : AuthorizationRequest = {
      reference: transactionReference,
      token: otp
    }

    try {
      const result = await this.authorizeMobileMoneyCharge(authRequest)
      console.log('Mobile Money OTP validation result:', {
        status: result.data.status,
        auth_model: result.data.auth_model,
        message: result.data.message
      })

      return result
    } catch (error: any) {
      console.error('Mobile Money OTP validation error:', error)
      throw error
    }
  }


  /**
   * Valide spécifiquement un OTP pour un paiement mobile money (STK Push, Mobile Money)
   * Cette méthode est optimisée pour les paiements mobiles nécessitant une validation OTP
   */
  async validateMobileMoneyOtpWithSTK(transactionReference: string, otp: string): Promise<KoraPayResponse<ChargeResponse>> {
    const authRequest = {
      reference: transactionReference,
      pin : otp
    }
    try {
      const result = await this.authorizeMobileMoneyChargeWithSTK(authRequest)
      return result
    } catch (error: any) {
      console.error('Mobile Money USSD validation error:', error)
      throw error
    }
  }

  /**
   * Demande un nouveau code OTP pour un paiement mobile money
   * Note: Cette fonctionnalité dépend de l'API Korapay et du fournisseur mobile
   */
  async resendMobileMoneyOtp(transactionReference: string): Promise<KoraPayResponse<any>> {
    try {
      // Note: Vérifiez la documentation Korapay pour l'endpoint exact de renvoi d'OTP
      // Certains fournisseurs peuvent ne pas supporter cette fonctionnalité
      const result = await this.makeRequest<any>('/charges/mobile-money/resend-otp', 'POST', {
        transaction_reference: transactionReference
      })
      return result
    } catch (error: any) {
      throw new Error('Impossible de renvoyer le code OTP. Veuillez contacter le service client.')
    }
  }

  /**
   * Vérifie le statut d'un paiement mobile money avec polling automatique
   * Utile pour vérifier l'état d'un paiement STK ou Mobile Money en cours
   */
  async pollMobileMoneyPaymentStatus(
    transactionReference: string, 
    maxAttempts: number = 10,
    intervalMs: number = 3000
  ): Promise<KoraPayResponse<ChargeResponse>> {
 for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const statusResult = await this.getTransaction(transactionReference)
        console.log(`Polling attempt ${attempt}/${maxAttempts}:`, {
          status: statusResult.data.status,
          auth_model: statusResult.data.auth_model
        })

        // Si le paiement est terminé (succès ou échec), retourner le résultat
        if (statusResult.data.status === 'success' || statusResult.data.status === 'failed') {
          return statusResult
        }

        // Si c'est le dernier essai et toujours en traitement
        if (attempt === maxAttempts && statusResult.data.status === 'processing') {
          throw new Error('Le paiement mobile est toujours en traitement. Veuillez réessayer plus tard.')
        }

        // Attendre avant la prochaine vérification
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs))
        }
      } catch (error: any) {
        if (attempt === maxAttempts) {
          throw error
        }
        console.log(`Polling attempt ${attempt} failed, retrying...`, error)
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    }

    throw new Error('Timeout lors de la vérification du statut du paiement mobile')
  }

  /**
   * Charge via transfert bancaire
   */
  async chargeBankTransfer(request: BankTransferChargeRequest): Promise<KoraPayResponse<ChargeResponse>> {
    if (request.reference.length < 8) {
      throw new Error('La référence doit avoir au moins 8 caractères')
    }

    const payload = {
      reference: request.reference,
      bank_transfer: request.bank_transfer,
      amount: request.amount,
      currency: request.currency,
      redirect_url: request.redirect_url,
      customer: request.customer,
      metadata: request.metadata
    }

    return this.makeRequest<ChargeResponse>('/charges/bank_transfer', 'POST', payload)
  }

  /**
   * Charge via mobile money
   */
  async chargeMobileMoney(request: MobileMoneyChargeRequest): Promise<KoraPayResponse<ChargeResponse>> {
    if (request.reference.length < 8) {
      throw new Error('La référence doit avoir au moins 8 caractères')
    }

    const payload = {
      amount: request.amount,
      currency: request.currency,
      reference: request.reference,
      description: request.description || `Paiement ${request.reference}`,
      /* notification_url: request.notification_url,
      redirect_url: request.redirect_url, */
      customer: {
        name: request.customer.name,
        email: request.customer.email
      },
      merchant_bears_cost: request.merchant_bears_cost || true,
      mobile_money: {
        number: request.mobile_money.number
      }
    }

    console.log('Korapay Mobile Money Payload:', payload);

    return this.makeRequest<ChargeResponse>('/charges/mobile-money', 'POST', payload)
  }

  /**
   * Vérifie le statut d'une transaction
   */
  async verifyTransaction(reference: string): Promise<KoraPayResponse<ChargeResponse>> {
    return this.makeRequest<ChargeResponse>(`/charges/${reference}/status`, 'GET')
  }

  /**
   * Récupère les détails d'une transaction
   */
  async getTransaction(reference: string): Promise<KoraPayResponse<ChargeResponse>> {
    return this.makeRequest<ChargeResponse>(`/charges/${reference}`, 'GET')
  }

  /**
   * Récupère la liste des banques supportées
   */
  async getBanks(): Promise<KoraPayResponse<Array<{ name: string, code: string, country: string }>>> {
    return this.makeRequest('/misc/banks', 'GET', null, false) // Utilise la clé publique
  }

  /**
   * Vérifie un numéro de compte bancaire
   */
  async verifyBankAccount(bankCode: string, accountNumber: string): Promise<KoraPayResponse<{
    account_name: string
    account_number: string
    bank_code: string
  }>> {
    const payload = {
      bank: bankCode,
      account: accountNumber
    }

    return this.makeRequest('/misc/banks/resolve', 'POST', payload, false) // Utilise la clé publique
  }

  /**
   * Récupère le solde du compte marchand
   */
  async getBalance(): Promise<KoraPayResponse<{
    balance: number
    currency: string
  }>> {
    return this.makeRequest('/balances', 'GET')
  }

  /**
   * Méthode utilitaire pour traiter les paiements avec retry automatique
   */
  async processCardPaymentWithRetry(
    request: CardChargeRequest,
    maxRetries: number = 3
  ): Promise<KoraPayResponse<ChargeResponse>> {
    return this.retryPayment(() => this.chargeCard(request), maxRetries)
  }

  async processBankTransferPaymentWithRetry(
    request: BankTransferChargeRequest,
    maxRetries: number = 3
  ): Promise<KoraPayResponse<ChargeResponse>> {
    return this.retryPayment(() => this.chargeBankTransfer(request), maxRetries)
  }

  async processMobileMoneyPaymentWithRetry(
    request: MobileMoneyChargeRequest,
    maxRetries: number = 3
  ): Promise<KoraPayResponse<ChargeResponse>> {
    return this.retryPayment(() => this.chargeMobileMoney(request), maxRetries)
  }

  /**
   * Méthode privée pour gérer les tentatives avec backoff exponentiel
   */
  private async retryPayment(
    paymentFunction: () => Promise<KoraPayResponse<ChargeResponse>>,
    maxRetries: number
  ): Promise<KoraPayResponse<ChargeResponse>> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await paymentFunction()
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Échec du paiement après plusieurs tentatives')
  }

  /**
   * Valide les données de carte
   */
  static validateCard(card: CardInfo): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validation du numéro de carte (algorithme de Luhn simplifié)
    const cardNumber = card.number.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(cardNumber)) {
      errors.push('Numéro de carte invalide')
    }

    // Validation CVV
    if (!/^\d{3,4}$/.test(card.cvv)) {
      errors.push('CVV invalide')
    }

    // Validation de la date d'expiration
    const month = parseInt(card.expiry_month)
    const year = parseInt(card.expiry_year)
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1

    if (month < 1 || month > 12) {
      errors.push('Mois d\'expiration invalide')
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push('Date d\'expiration invalide')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Valide un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valide un numéro de téléphone (format international)
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
}
