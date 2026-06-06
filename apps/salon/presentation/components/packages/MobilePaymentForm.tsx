'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Smartphone } from 'lucide-react'
import { ChargeResponse, KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'
import { formatPrice } from '@zyra/conf/lib/utils'
import { getCurrentConfig } from '@zyra/conf/lib/korapay-config'
import { useMobilePayment } from '../../../hooks/useMobilePayment'
import PaymentAlertModal, { createAlertData } from './PaymentAlertModal'
import MobileOtpForm from './MobileOtpForm'
import { TransactionService } from '@/services/TransactionService'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'

interface MobilePaymentFormProps {
  amount: number
  currency: string
  packageData: PackageData
  billingPeriod: string
  userId: string
  userEmail?: string
  userName?: string
  onSuccess: () => void
  onError: (error: string) => void
  onBack: () => void
}

interface MobileData {
  number: string
}

export default function MobilePaymentForm({
  amount,
  currency,
  packageData,
  billingPeriod,
  userId,
  userEmail,
  userName,
  onSuccess,
  onError,
  onBack
}: MobilePaymentFormProps) {
  const [mobileData, setMobileData] = useState<MobileData>({
    number: '+254700000000'
  })

  const [alertData, setAlertData] = useState<any>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const korapayService = new KoraPaymentService(getCurrentConfig())

  const mobilePayment = useMobilePayment({
    korapayService,
    callbacks: {
      onSuccess: () => {
        setAlertData(createAlertData.success(
          'Votre paiement mobile a été confirmé avec succès. Vous allez être redirigé vers votre tableau de bord.'
        ))
        console.log('update transation ', transactionId)
        transactionId && TransactionService.markTransactionAsSuccess(transactionId)
        onSuccess()
      },
      onError: (error: string) => {
        console.error('Mobile money payment error:', error);
        transactionId && TransactionService.markTransactionAsFailed(transactionId)
        onError(error)
      },
      onProcessing: (data: ChargeResponse) => {
        console.log('Mobile money payment processing:', data)
        setAlertData(createAlertData.processing(
          data.response_message || data.message || 'Votre paiement mobile est en cours de traitement...'
        ))
        setIsAlertOpen(true)
      },
      onShowUssdInstructions: (data: ChargeResponse) => {
        console.log('Mobile money USSD instructions:', data)
        setAlertData(createAlertData.mobileInstructions(
          data.response_message || data.message || 'Instructions: Composez le code USSD affiché pour finaliser le paiement'
        ))
        setIsAlertOpen(true)
      }
    }
  })

  const handleMobilePayment = async () => {
    try {
      if (!KoraPaymentService.validatePhoneNumber(mobileData.number)) {
        onError('Numéro de téléphone invalide')
        return
      }
      const paymentData  = await mobilePayment.initiateMobilePayment({
        reference: korapayService.generateReference('ZYRA'),
        mobile_money: mobileData,
        amount: amount,
        currency,
        description: `Abonnement ${packageData.name} - ${billingPeriod === 'yearly' ? 'Annuel' : 'Mensuel'}`,
        notification_url: `${window.location.origin}/api/webhooks/korapay`,
        redirect_url: `${window.location.origin}/dashboard?payment=success`,
        merchant_bears_cost: true,
        customer: {
          name: userName || 'Utilisateur Zyra',
          email: userEmail || 'guest@zyra.app'
        },
        metadata: {
          userId,
          packageId: packageData.id,
          billingPeriod,
          packageName: packageData.name
        }
      })
      if(!paymentData) return;
      const data = {
        reference: paymentData.transaction_reference,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: "mobile_money" as "mobile_money",
        userId: userId,
        userEmail: userEmail,
        userName: userName ?? '',
        packageId: String(packageData.id),
        packageName: packageData.name,
        billingPeriod: billingPeriod,
        korapayTransactionId: paymentData.payment_reference,
        korapayReference: paymentData.payment_reference,
        metadata: {}
      }
      const transactionId = await  TransactionService.createTransaction(data)
      setTransactionId(transactionId)
    } catch (error: any) {
      console.error('Erreur paiement mobile:', error)
      onError(error.message || 'Erreur lors du paiement mobile')
    }
  }

  // Gestionnaires pour le formulaire OTP mobile
  const handleMobileOtpSubmit = async (otp: string) => {
    try {
      await mobilePayment.validateOtp(otp)
    } catch (error: any) {
      console.error('Mobile OTP submission error:', error)
      onError(error.message || 'Erreur lors de la validation OTP mobile')
    }
  }

  const handleMobileOtpBack = () => {
    mobilePayment.closeOtpForm()
  }

  const handleMobileOtpResend = async () => {
    try {
      await mobilePayment.resendOtp()
    } catch (error: any) {
      onError(error.message || 'Erreur lors du renvoi OTP')
    }
  }

  const handleCloseAlert = () => {
    setIsAlertOpen(false)
    setAlertData(null)
  }

  const formatPhoneNumber = (value: string) => {
    // Enlever tout sauf les chiffres et le +
    let cleaned = value.replace(/[^\d+]/g, '')
    // S'assurer que ça commence par +
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    return cleaned
  }

  return (
    <>
      {/* Formulaire OTP Mobile Money */}
      {mobilePayment.isOtpRequired && mobilePayment.state.otpData && (
        <MobileOtpForm
          message={mobilePayment.getOtpMessage()}
          transactionReference={mobilePayment.state.otpData.transaction_reference}
          onSubmit={handleMobileOtpSubmit}
          onBack={handleMobileOtpBack}
          onResend={handleMobileOtpResend}
          countdown={300}
          korapayService={korapayService}
        />
      )}

      {/* Interface normale si pas d'OTP mobile */}
      {!mobilePayment.isOtpRequired && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Mobile Money
            </h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white border-gray-300 dark:border-slate-600"
            >
              ← Retour
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                Numéro de téléphone
              </label>
              <Input
                placeholder="+225 XX XX XX XX XX"
                defaultValue={'+254700000000'}
                value={mobileData.number}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value)
                  setMobileData({...mobileData, number: formatted})
                }}
                className="text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400"
                disabled={mobilePayment.isLoading}
                type="tel"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Format international requis (ex: +225123456789)
              </p>
            </div>
          </div>

          <Button
            onClick={handleMobilePayment}
            disabled={mobilePayment.isLoading || !mobileData.number || mobileData.number.length < 10}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mobilePayment.isLoading ? 'Traitement...' : `Payer ${formatPrice(amount, currency)}`}
          </Button>
          {/* Message d'aide pour Mobile Money */}
          <div className="text-xs text-gray-500 dark:text-slate-400 text-center mt-2 space-y-1">
            <p>📱 Vous recevrez un SMS avec les instructions de paiement</p>
            <p>💡 Supporté: MTN, Orange, Moov Money</p>
          </div>
        </div>
      )}

      {/* Modal d'alerte pour les différents types de notifications */}
      <PaymentAlertModal
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        alertData={alertData}
      />
    </>
  )
}
