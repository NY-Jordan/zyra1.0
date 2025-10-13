import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { KoraPaymentService, ChargeResponse, MobileMoneyChargeRequest } from '@zyra/conf/services/KoraPaymentService'
import { PaymentAuthTypeEnum } from '@zyra/conf/domain/enums/PaymentAuthTypeEnum'
import { TransactionService } from '@/services/TransactionService'
import { auth } from '@zyra/conf/lib/firebase'

export interface MobilePaymentState {
  isProcessing: boolean
  showOtpForm: boolean
  otpData: ChargeResponse | null
  error: string | null
  currentTransaction: string | null
}

export interface MobilePaymentCallbacks {
  onSuccess: () => void
  onError: (error: string) => void
  onProcessing: (data: ChargeResponse) => void
  onShowUssdInstructions: (data: ChargeResponse) => void
}

export interface UseMobilePaymentProps {
  korapayService: KoraPaymentService
  callbacks: MobilePaymentCallbacks
}

export const useMobilePayment = ({ korapayService, callbacks }: UseMobilePaymentProps) => {

  const [state, setState] = useState<MobilePaymentState>({
    isProcessing: false,
    showOtpForm: false,
    otpData: null,
    error: null,
    currentTransaction: null
  })

  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const user = auth.currentUser
  // Fonction pour mettre à jour l'état
  const updateState = useCallback((updates: Partial<MobilePaymentState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialise l'état
  const resetState = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    console.log('Resetting mobile payment state')
    setState({
      isProcessing: false,
      showOtpForm: false,
      otpData: null,
      error: null,
      currentTransaction: null
    })
  }, [])

  // Vérifie si un auth_model nécessite une saisie OTP
  const requiresOtpInput = useCallback((authModel?: string): boolean => {
    return authModel === PaymentAuthTypeEnum.PIN ||
           authModel === PaymentAuthTypeEnum.OTP ||
           authModel === PaymentAuthTypeEnum.USSD ||
           authModel === '3DS'
  }, [])

  // Initie un paiement mobile money
  const initiateMobilePayment = useCallback(async (request: MobileMoneyChargeRequest) => {
    try {
        updateState({ isProcessing: true, error: null })
        const result = await korapayService.chargeMobileMoney(request);
        const data = result.data
        updateState({
          currentTransaction: data.payment_reference,
          isProcessing: false
        });
        handleMobilePaymentResponse(data);
        return data;
    } catch (error: any) {
      console.error('Mobile money payment initiation error:', error)
      updateState({ isProcessing: false, error: error.message })
      callbacks.onError(error.message)
    }
  }, [korapayService, callbacks, updateState])

  // Gère la réponse d'un paiement mobile money
  const handleMobilePaymentResponse = useCallback((data: ChargeResponse) => {
    if (data.status === 'success') {
      callbacks.onSuccess()
      resetState()
    } else if (data.status === 'processing') {
      if (requiresOtpInput(data.auth_model)) {
        updateState({
          showOtpForm: true,
          otpData: data
        })
      } else {
        // for payment test
        if (data.auth_model === PaymentAuthTypeEnum.STK_PROMPT) {
          callbacks.onShowUssdInstructions(data)
          startPolling(data.payment_reference)
          setTimeout(async () => {
            const result  = await korapayService.validateMobileMoneyOtpWithSTK(data.transaction_reference, '1234');
            console.log(result)
          }, 5000);
        }
        if (data.auth_model === PaymentAuthTypeEnum.USSD || data.auth_model === PaymentAuthTypeEnum.STK) {
          callbacks.onShowUssdInstructions(data)
          startPolling(data.payment_reference)
        } else {
          callbacks.onProcessing(data)
        }
      }
    } else if (data.status === 'failed') {
      callbacks.onError(data.message)
      resetState()
    } else {
      callbacks.onProcessing(data)
    }
  }, [callbacks, requiresOtpInput, updateState, resetState])

  // Valide un OTP mobile money
  const validateOtp = useCallback(async (otp: string): Promise<void> => {
    if (!state.otpData) {
      throw new Error('Aucune transaction en cours')
    }
    try {
      let authResult: any
      console.log(state.otpData)
      authResult = await korapayService.validateMobileMoneyOtp(
        state.otpData.transaction_reference,
        otp
      )
      console.log(authResult)
      if (authResult.status === true) {
        handleMobilePaymentResponse(authResult.data)
      } else if (authResult.data.status === 'processing') {
        throw new Error('Paiement en cours de traitement. Veuillez patienter quelques instants.')
      } else {
        throw new Error(authResult.data.message)
      }
    } catch (error: any) {
      console.error('Mobile OTP validation error:', error)
      throw new Error(error.message)
    }
  }, [state.otpData, korapayService, callbacks, resetState])

  // Renvoie un OTP
  const resendOtp = useCallback(async (): Promise<boolean> => {
    if (!state.otpData) {
      toast.error('Aucune transaction en cours')
      return false
    }
    try {
      if (korapayService.resendMobileMoneyOtp) {
        await korapayService.resendMobileMoneyOtp(state.otpData.payment_reference)
        toast.success('Nouveau code OTP mobile envoyé avec succès')
        return true
      } else {
        toast.info('Demande de nouveau code OTP mobile en cours...')
        return true
      }
    } catch (error: any) {
      console.error('Error resending mobile OTP:', error)
      toast.error('Impossible de renvoyer le code OTP. Veuillez réessayer plus tard.')
      return false
    }
  }, [state.otpData, korapayService])

  // Démarre le polling automatique pour vérifier le statut
  const startPolling = useCallback((transactionReference: string) => {
    pollingTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await korapayService.pollMobileMoneyPaymentStatus(
          transactionReference,
          8,
          2000
        )
        if (result.data.status === 'success') {
          callbacks.onSuccess()
          resetState()
        } else if (result.data.status === 'failed') {
          callbacks.onError(result.data.message || 'Le paiement mobile a échoué')
          resetState()
        }
      } catch (error: any) {
        console.log('Mobile payment polling completed without definitive result:', error.message)
      }
    }, 10000)
  }, [korapayService, callbacks, resetState])

  // Ferme le formulaire OTP
  const closeOtpForm = useCallback(() => {
    updateState({
      showOtpForm: false,
      otpData: null
    })
  }, [updateState])

  // Vérifie le statut d'une transaction
  const checkPaymentStatus = useCallback(async (transactionReference: string): Promise<ChargeResponse | null> => {
    try {
      const result = await korapayService.verifyTransaction(transactionReference)
      return result.data
    } catch (error: any) {
      console.error('Error checking payment status:', error)
      return null
    }
  }, [korapayService])

  // Nettoie les ressources
  const cleanup = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    resetState()
  }, [resetState])

  // Méthodes utilitaires
  const getOtpMessage = useCallback((): string => {
    if (!state.otpData) return ''
    const authModel = state.otpData.auth_model
    let baseMessage = state.otpData.response_message || state.otpData.message || ''
    if (!baseMessage) {
      switch (authModel) {
        case PaymentAuthTypeEnum.PIN:
          baseMessage = 'Entrez votre PIN pour finaliser le paiement'
          break
        case PaymentAuthTypeEnum.OTP:
          baseMessage = 'Entrez le code OTP reçu par SMS'
          break
        case PaymentAuthTypeEnum.STK_PROMPT:
          baseMessage = 'Entrez le code PIN de votre mobile money'
          break
        case PaymentAuthTypeEnum.USSD:
          baseMessage = 'Entrez le code affiché sur votre téléphone'
          break
        case '3DS':
          baseMessage = 'Entrez le code de vérification 3D Secure'
          break
        default:
          baseMessage = 'Entrez le code de validation pour finaliser votre paiement mobile'
      }
    }
    return baseMessage
  }, [state.otpData])

  const getOtpTitle = useCallback((): string => {
    if (!state.otpData) return 'Validation requise'
    const authModel = state.otpData.auth_model
    switch (authModel) {
      case PaymentAuthTypeEnum.PIN:
        return 'Validation PIN'
      case PaymentAuthTypeEnum.OTP:
        return 'Validation OTP'
      case PaymentAuthTypeEnum.STK_PROMPT:
        return 'Validation Mobile Money'
      case PaymentAuthTypeEnum.USSD:
        return 'Code USSD'
      case '3DS':
        return 'Vérification 3D Secure'
      default:
        return 'Validation Mobile Money'
    }
  }, [state.otpData])

  return {
    // État
    state,
    // Actions principales
    initiateMobilePayment,
    validateOtp,
    resendOtp,
    closeOtpForm,
    resetState,
    cleanup,
    handleMobilePaymentResponse,
    // Utilitaires
    checkPaymentStatus,
    getOtpMessage,
    getOtpTitle,
    requiresOtpInput,
    // Données calculées
    isLoading: state.isProcessing,
    hasError: !!state.error,
    isOtpRequired: state.showOtpForm,
    currentTransactionRef: state.currentTransaction
  }
}
