'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Alert, AlertDescription } from '@zyra/ui/components/alert'
import { CheckCircle, XCircle, Clock, Smartphone, CreditCard, AlertTriangle, Loader2 } from 'lucide-react'

export type PaymentAlertType = 
  | 'success' 
  | 'error' 
  | 'processing'
  | 'otp_required' 
  | 'pin_required' 
  | '3ds_redirect' 
  | 'mobile_instructions'
  | 'timeout'
  | 'retry_needed'

interface PaymentAlertData {
  type: PaymentAlertType
  title: string
  message: string
  transactionReference?: string
  countdown?: number
  authData?: any
  redirectUrl?: string
}

interface PaymentAlertModalProps {
  isOpen: boolean
  onClose: () => void
  alertData: PaymentAlertData | null
  onOtpSubmit?: (otp: string) => Promise<void>
  onPinSubmit?: (pin: string) => Promise<void>
  onRetry?: () => Promise<void>
  onResendOtp?: () => Promise<void>
}

export default function PaymentAlertModal({
  isOpen,
  onClose,
  alertData,
  onOtpSubmit,
  onPinSubmit,
  onRetry,
  onResendOtp
}: PaymentAlertModalProps) {
  const [otpCode, setOtpCode] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Gestion du compte à rebours
  useEffect(() => {
    if (alertData?.countdown) {
      setCountdown(alertData.countdown)
    }
  }, [alertData])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown])

  // Reset des états quand la modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setOtpCode('')
      setPinCode('')
      setCountdown(0)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleOtpSubmit = async () => {
    if (!onOtpSubmit || !otpCode || otpCode.length < 4) return
    
    setIsSubmitting(true)
    try {
      await onOtpSubmit(otpCode)
      setOtpCode('')
    } catch (error) {
      console.error('Erreur OTP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePinSubmit = async () => {
    if (!onPinSubmit || !pinCode || pinCode.length < 4) return
    
    setIsSubmitting(true)
    try {
      await onPinSubmit(pinCode)
      setPinCode('')
    } catch (error) {
      console.error('Erreur PIN:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!onResendOtp || countdown > 0) return
    
    setIsSubmitting(true)
    try {
      await onResendOtp()
      setCountdown(60) // Redémarre le compte à rebours
    } catch (error) {
      console.error('Erreur renvoi OTP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAlertIcon = (type: PaymentAlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />
      case 'error':
      case 'timeout':
        return <XCircle className="w-12 h-12 text-red-500" />
      case 'processing':
      case 'mobile_instructions':
        return <Clock className="w-12 h-12 text-blue-500" />
      case 'otp_required':
        return <Smartphone className="w-12 h-12 text-orange-500" />
      case 'pin_required':
        return <CreditCard className="w-12 h-12 text-purple-500" />
      case '3ds_redirect':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />
      case 'retry_needed':
        return <AlertTriangle className="w-12 h-12 text-orange-500" />
      default:
        return <Clock className="w-12 h-12 text-gray-500 dark:text-slate-400" />
    }
  }

  const getAlertColor = (type: PaymentAlertType) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
      case 'timeout':
        return 'border-red-200 bg-red-50'
      case 'processing':
      case 'mobile_instructions':
        return 'border-blue-200 bg-blue-50'
      case 'otp_required':
      case 'retry_needed':
        return 'border-orange-200 bg-orange-50'
      case 'pin_required':
        return 'border-purple-200 bg-purple-50'
      case '3ds_redirect':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'
    }
  }

  if (!alertData || !isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-center">
            {alertData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Icône et message principal */}
          <div className="flex flex-col items-center text-center space-y-4">
            {getAlertIcon(alertData.type)}
            
            <Alert className={`w-full ${getAlertColor(alertData.type)}`}>
              <AlertDescription className="text-center text-gray-900 dark:text-slate-100">
                {alertData.message}
              </AlertDescription>
            </Alert>
          </div>

          {/* Zone d'interaction selon le type */}
          {alertData.type === 'otp_required' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block text-center">
                  Entrez le code OTP reçu par SMS
                </label>
                <Input
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                    setOtpCode(value)
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-xl font-mono tracking-widest"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleOtpSubmit}
                  disabled={isSubmitting || otpCode.length < 4}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Valider OTP
                </Button>
                <Button
                  onClick={handleResendOtp}
                  disabled={isSubmitting || countdown > 0}
                  variant="outline"
                  className="flex-1"
                >
                  {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer OTP'}
                </Button>
              </div>

              {countdown > 0 && (
                <p className="text-xs text-center text-gray-500 dark:text-slate-400">
                  Nouveau code disponible dans {countdown} secondes
                </p>
              )}
            </div>
          )}

          {alertData.type === 'pin_required' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block text-center">
                  Entrez votre PIN de carte
                </label>
                <Input
                  value={pinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                    setPinCode(value)
                  }}
                  placeholder="****"
                  maxLength={4}
                  type="password"
                  className="text-center text-xl font-mono tracking-widest"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                onClick={handlePinSubmit}
                disabled={isSubmitting || pinCode.length < 4}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Valider PIN
              </Button>
            </div>
          )}

          {alertData.type === '3ds_redirect' && alertData.redirectUrl && (
            <div className="space-y-4">
              <Button
                onClick={() => {
                  window.location.href = alertData.redirectUrl!
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Continuer vers la vérification 3D Secure
              </Button>
            </div>
          )}

          {alertData.type === 'retry_needed' && (
            <div className="space-y-4">
              <Button
                onClick={onRetry}
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Réessayer le paiement
              </Button>
            </div>
          )}

          {alertData.type === 'processing' && (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Informations additionnelles */}
          {alertData.transactionReference && (
            <div className="text-center text-xs text-gray-500 dark:text-slate-400">
              Référence: {alertData.transactionReference}
            </div>
          )}

          {/* Bouton fermer pour certains types */}
          {['success', 'error', 'timeout', 'mobile_instructions'].includes(alertData.type) && (
            <Button
              onClick={onClose}
              variant={alertData.type === 'success' ? 'default' : 'outline'}
              className={`w-full ${
                alertData.type === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : ''
              }`}
            >
              {alertData.type === 'success' ? 'Parfait !' : 'Fermer'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Fonction utilitaire pour créer les données d'alerte
export const createAlertData = {
  success: (message: string = 'Paiement réussi !', transactionRef?: string): PaymentAlertData => ({
    type: 'success',
    title: '✅ Paiement réussi',
    message,
    transactionReference: transactionRef
  }),

  error: (message: string, transactionRef?: string): PaymentAlertData => ({
    type: 'error',
    title: '❌ Erreur de paiement',
    message,
    transactionReference: transactionRef
  }),

  processing: (message: string = 'Paiement en cours...', transactionRef?: string): PaymentAlertData => ({
    type: 'processing',
    title: '⏳ Traitement en cours',
    message,
    transactionReference: transactionRef
  }),

  otpRequired: (message: string, transactionRef: string, countdown: number = 300): PaymentAlertData => ({
    type: 'otp_required',
    title: '📱 Code OTP requis',
    message,
    transactionReference: transactionRef,
    countdown
  }),

  pinRequired: (message: string, transactionRef: string): PaymentAlertData => ({
    type: 'pin_required',
    title: '🔐 PIN requis',
    message,
    transactionReference: transactionRef
  }),

  redirect3DS: (message: string, redirectUrl: string, transactionRef?: string): PaymentAlertData => ({
    type: '3ds_redirect',
    title: '🔒 Vérification 3D Secure',
    message,
    redirectUrl,
    transactionReference: transactionRef
  }),

  mobileInstructions: (message: string, transactionRef?: string): PaymentAlertData => ({
    type: 'mobile_instructions',
    title: '📲 Instructions Mobile Money',
    message,
    transactionReference: transactionRef
  }),

  retryNeeded: (message: string, transactionRef?: string): PaymentAlertData => ({
    type: 'retry_needed',
    title: '🔄 Nouvelle tentative requise',
    message,
    transactionReference: transactionRef
  }),

  timeout: (message: string = 'La transaction a expiré', transactionRef?: string): PaymentAlertData => ({
    type: 'timeout',
    title: '⏰ Temps dépassé',
    message,
    transactionReference: transactionRef
  })
}
