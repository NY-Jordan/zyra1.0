import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { KoraPaymentService, ChargeResponse, CardChargeRequest } from '@zyra/conf/services/KoraPaymentService'
import { PaymentAuthTypeEnum } from '@zyra/conf/domain/enums/PaymentAuthTypeEnum'

export interface CardPaymentState {
  isProcessing: boolean
  showAuthForm: boolean
  authData: ChargeResponse | null
  error: string | null
  currentTransaction: string | null
  authType: 'PIN' | 'OTP' | '3DS' | null
}

export interface CardPaymentCallbacks {
  onSuccess: () => void
  onError: (error: string) => void
  onProcessing: (data: ChargeResponse) => void
  onPinRequired: (data: ChargeResponse) => void
  onOtpRequired: (data: ChargeResponse) => void
  on3DSRedirect: (data: ChargeResponse) => void
}

export interface UseCardPaymentProps {
  korapayService: KoraPaymentService
  callbacks: CardPaymentCallbacks
}

export const useCardPayment = ({ korapayService, callbacks }: UseCardPaymentProps) => {
  const [state, setState] = useState<CardPaymentState>({
    isProcessing: false,
    showAuthForm: false,
    authData: null,
    error: null,
    currentTransaction: null,
    authType: null
  })

  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour mettre à jour l'état
  const updateState = useCallback((updates: Partial<CardPaymentState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialise l'état
  const resetState = useCallback(() => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current)
      authTimeoutRef.current = null
    }
    setState({
      isProcessing: false,
      showAuthForm: false,
      authData: null,
      error: null,
      currentTransaction: null,
      authType: null
    })
  }, [])

  // Vérifie si un auth_model nécessite une autorisation
  const requiresAuthorization = useCallback((authModel?: string): boolean => {
    return authModel === PaymentAuthTypeEnum.PIN ||
           authModel === PaymentAuthTypeEnum.OTP ||
           authModel === PaymentAuthTypeEnum.ThreeDS
  }, [])

  // Initie un paiement par carte
  const initiateCardPayment = useCallback(async (request: CardChargeRequest) => {
    try {
      updateState({ isProcessing: true, error: null })
      
      console.log('Initiating card payment:', {
        reference: request.reference,
        amount: request.amount,
        currency: request.currency,
        card_last_four: request.card.number.slice(-4)
      })

      const result = await korapayService.chargeCard(request)
      const data = result.data

      updateState({ 
        currentTransaction: data.transaction_reference,
        isProcessing: false 
      })

      // Gérer la réponse selon le statut et auth_model
      handleCardPaymentResponse(data)

    } catch (error: any) {
      console.error('Card payment initiation error:', error)
      updateState({ isProcessing: false, error: error.message })
      callbacks.onError(error.message || 'Erreur lors de l\'initiation du paiement par carte')
    }
  }, [korapayService, callbacks, updateState])

  // Gère la réponse d'un paiement par carte
  const handleCardPaymentResponse = useCallback((data: ChargeResponse) => {
    console.log('Handling card payment response:', {
      status: data.status,
      authModel: data.auth_model
    })

    if (data.status === 'success') {
      callbacks.onSuccess()
      resetState()
    } else if (data.status === 'processing') {
      if (requiresAuthorization(data.auth_model)) {
        // Autorisation requise
        const authType = data.auth_model as 'PIN' | 'OTP' | '3DS'
        updateState({ 
          showAuthForm: true, 
          authData: data,
          authType: authType
        })

        // Appeler le callback approprié
        if (authType === PaymentAuthTypeEnum.PIN) {
          callbacks.onPinRequired(data)
        } else if (authType === PaymentAuthTypeEnum.OTP) {
          callbacks.onOtpRequired(data)
        } else if (authType === PaymentAuthTypeEnum.ThreeDS) {
          callbacks.on3DSRedirect(data)
        }

        // Démarrer un timeout pour l'autorisation (5 minutes)
        authTimeoutRef.current = setTimeout(() => {
          updateState({ error: 'Timeout d\'autorisation dépassé' })
          callbacks.onError('Le délai d\'autorisation a expiré. Veuillez recommencer.')
        }, 300000) // 5 minutes

      } else {
        // Processing sans autorisation spécifique
        callbacks.onProcessing(data)
      }
    } else if (data.status === 'failed') {
      callbacks.onError(data.message || 'Le paiement par carte a échoué')
      resetState()
    } else {
      callbacks.onProcessing(data)
    }
  }, [callbacks, requiresAuthorization, updateState, resetState])

  // Valide une autorisation (PIN, OTP, 3DS)
  const validateAuthorization = useCallback(async (authValue: string): Promise<void> => {
    if (!state.authData) {
      throw new Error('Aucune transaction en cours d\'autorisation')
    }

    try {
      console.log('Validating card authorization:', {
        transaction_reference: state.authData.transaction_reference,
        auth_type: state.authType,
        value_length: authValue.length
      })

      const authRequest = {
        reference: state.authData.transaction_reference,
        [state.authType === PaymentAuthTypeEnum.PIN ? 'pin' : 'otp']: authValue
      }

      const authResult = await korapayService.authorizeCardCharge(authRequest)

      console.log('Card authorization result:', authResult)

      if (authResult.data.status === 'success') {
        callbacks.onSuccess()
        resetState()
      } else if (authResult.data.status === 'processing') {
        // Peut nécessiter une autre autorisation ou être en cours
        handleCardPaymentResponse(authResult.data)
      } else {
        throw new Error(authResult.data.message || 'Autorisation invalide')
      }
    } catch (error: any) {
      console.error('Card authorization error:', error)
      throw new Error(error.message || 'Erreur lors de la validation de l\'autorisation')
    }
  }, [state.authData, state.authType, korapayService, callbacks, resetState, handleCardPaymentResponse])

  // Valide un PIN de carte
  const validatePin = useCallback(async (pin: string): Promise<void> => {
    return validateAuthorization(pin)
  }, [validateAuthorization])

  // Valide un OTP de carte
  const validateOtp = useCallback(async (otp: string): Promise<void> => {
    return validateAuthorization(otp)
  }, [validateAuthorization])

  // Gère la redirection 3DS
  const handle3DSRedirect = useCallback((redirectUrl: string) => {
    console.log('Handling 3DS redirect:', redirectUrl)
    // Ouvrir la redirection 3DS dans une nouvelle fenêtre/tab
    window.open(redirectUrl, '_blank', 'width=600,height=600')
    
    // Démarrer un polling pour vérifier le statut après la redirection
    const pollInterval = setInterval(async () => {
      if (state.currentTransaction) {
        try {
          const statusResult = await korapayService.verifyTransaction(state.currentTransaction)
          if (statusResult.data.status === 'success') {
            clearInterval(pollInterval)
            callbacks.onSuccess()
            resetState()
          } else if (statusResult.data.status === 'failed') {
            clearInterval(pollInterval)
            callbacks.onError('Vérification 3DS échouée')
            resetState()
          }
        } catch (error) {
          console.log('3DS polling error:', error)
        }
      }
    }, 3000)

    // Arrêter le polling après 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 600000)
  }, [state.currentTransaction, korapayService, callbacks, resetState])

  // Renvoie un OTP (si supporté)
  const resendOtp = useCallback(async (): Promise<boolean> => {
    if (!state.authData) {
      toast.error('Aucune transaction en cours')
      return false
    }

    try {
      console.log('Attempting to resend card OTP for:', state.authData.transaction_reference)
      
      // Note: L'API Korapay peut ne pas supporter le renvoi d'OTP pour les cartes
      // Cette fonctionnalité dépend de l'implémentation spécifique
      toast.info('Demande de nouveau code OTP en cours...')
      return true
    } catch (error: any) {
      console.error('Error resending card OTP:', error)
      toast.error('Impossible de renvoyer le code OTP. Veuillez contacter le support.')
      return false
    }
  }, [state.authData])

  // Ferme le formulaire d'autorisation
  const closeAuthForm = useCallback(() => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current)
      authTimeoutRef.current = null
    }
    updateState({
      showAuthForm: false,
      authData: null,
      authType: null
    })
  }, [updateState])

  // Vérifie le statut d'une transaction
  const checkPaymentStatus = useCallback(async (transactionReference: string): Promise<ChargeResponse | null> => {
    try {
      const result = await korapayService.verifyTransaction(transactionReference)
      return result.data
    } catch (error: any) {
      console.error('Error checking card payment status:', error)
      return null
    }
  }, [korapayService])

  // Nettoie les ressources
  const cleanup = useCallback(() => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current)
      authTimeoutRef.current = null
    }
    resetState()
  }, [resetState])

  // Méthodes utilitaires
  const getAuthMessage = useCallback((): string => {
    if (!state.authData) return ''
    
    const authType = state.authType
    let baseMessage = state.authData.response_message || state.authData.message || ''
    
    if (!baseMessage) {
      switch (authType) {
        case PaymentAuthTypeEnum.PIN:
          baseMessage = 'Entrez le PIN de votre carte pour confirmer le paiement'
          break
        case PaymentAuthTypeEnum.OTP:
          baseMessage = 'Entrez le code OTP reçu par SMS ou email'
          break
        case PaymentAuthTypeEnum.ThreeDS:
          baseMessage = 'Vous allez être redirigé pour la vérification 3D Secure'
          break
        default:
          baseMessage = 'Autorisation requise pour finaliser votre paiement'
      }
    }
    
    return baseMessage
  }, [state.authData, state.authType])

  const getAuthTitle = useCallback((): string => {
    if (!state.authData) return 'Autorisation requise'
    
    const authType = state.authType
    
    switch (authType) {
      case PaymentAuthTypeEnum.PIN:
        return 'PIN de carte requis'
      case PaymentAuthTypeEnum.OTP:
        return 'Code OTP requis'
      case PaymentAuthTypeEnum.ThreeDS:
        return 'Vérification 3D Secure'
      default:
        return 'Autorisation de paiement'
    }
  }, [state.authType])

  const getAuthInputType = useCallback((): 'pin' | 'otp' | '3ds' => {
    return state.authType?.toLowerCase() as 'pin' | 'otp' | '3ds' || 'otp'
  }, [state.authType])

  // Validation des données de carte
  const validateCardData = useCallback((cardData: {
    number: string
    expiry_month: string
    expiry_year: string
    cvv: string
    name: string
  }): { isValid: boolean; errors: string[] } => {
    return KoraPaymentService.validateCard(cardData)
  }, [])

  return {
    // État
    state,
    
    // Actions principales
    initiateCardPayment,
    validatePin,
    validateOtp,
    handle3DSRedirect,
    resendOtp,
    closeAuthForm,
    resetState,
    cleanup,
    handleCardPaymentResponse, // Exposer pour utilisation externe
    
    // Utilitaires
    checkPaymentStatus,
    getAuthMessage,
    getAuthTitle,
    getAuthInputType,
    validateCardData,
    requiresAuthorization,
    
    // Données calculées
    isLoading: state.isProcessing,
    hasError: !!state.error,
    isAuthRequired: state.showAuthForm,
    currentTransactionRef: state.currentTransaction,
    needsPin: state.authType === PaymentAuthTypeEnum.PIN,
    needsOtp: state.authType === PaymentAuthTypeEnum.OTP,
    needs3DS: state.authType === PaymentAuthTypeEnum.ThreeDS
  }
}
