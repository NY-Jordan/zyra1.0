'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Alert, AlertDescription } from '@zyra/ui/components/alert'
import { Smartphone, ArrowLeft, RefreshCw, Clock } from 'lucide-react'

interface MobileOtpFormProps {
  message: string
  transactionReference: string
  onSubmit: (otp: string) => Promise<void>
  onBack: () => void
  onResend?: () => Promise<void>
  countdown?: number
  korapayService?: any // Service Korapay pour validation directe
}

export default function MobileOtpForm({
  message,
  transactionReference,
  onSubmit,
  onBack,
  onResend,
  countdown = 300, // 5 minutes par défaut
  korapayService
}: MobileOtpFormProps) {
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(countdown)
  const [error, setError] = useState('')

  // Gestion du compte à rebours
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  // Formatage du temps restant
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 4) {
      setError('Veuillez entrer un code OTP valide (au moins 4 chiffres)')
      return
    }
    setIsSubmitting(true)
    setError('')
    onSubmit(otp);
  }

  const handleResend = async () => {
    if (!onResend || timeLeft > 0) return
    setIsSubmitting(true)
    try {
      await onResend()
      setTimeLeft(countdown) // Reset countdown
      setError('')
    } catch (error: any) {
      setError(error.message || 'Erreur lors du renvoi du code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpChange = (value: string) => {
    // Ne garder que les chiffres
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6)
    setOtp(numericValue)
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
          <Clock className="w-4 h-4 mr-1" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Title et icône */}
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Smartphone className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Validation Mobile Money
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-300 max-w-md mx-auto">
          {message}
        </p>
      </div>

      {/* Alert d'information */}
      <Alert className="border-blue-200 bg-blue-50">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Un code OTP a été envoyé à votre numéro de téléphone. 
          Entrez-le ci-dessous pour finaliser votre paiement.
        </AlertDescription>
      </Alert>

      {/* Formulaire OTP */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
            Code OTP
          </label>
          <Input
            id="otp"
            type="tel"
            placeholder="123456"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            className="text-center text-black dark:text-white text-xl font-mono tracking-widest bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500"
            disabled={isSubmitting}
            maxLength={6}
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-center">
            Code à 4-6 chiffres reçu par SMS
          </p>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Boutons d'action */}
        <div className="space-y-3">
          <Button
            type="submit"
            disabled={isSubmitting || !otp || otp.length < 4}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold disabled:opacity-50"
          >
            {isSubmitting ? 'Validation...' : 'Valider le code OTP'}
          </Button>

          {/* Bouton renvoyer */}
          {onResend && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={isSubmitting || timeLeft > 0}
              className="w-full h-10 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {timeLeft > 0 
                ? `Renvoyer dans ${formatTime(timeLeft)}`
                : 'Renvoyer le code OTP'
              }
            </Button>
          )}
        </div>
      </form>

      {/* Informations sur la transaction */}
      <div className="text-center pt-4 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Référence: {transactionReference}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
          🔒 Transaction sécurisée via Korapay
        </p>
      </div>
    </div>
  )
}
