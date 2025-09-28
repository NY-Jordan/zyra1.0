'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@zyra/ui/components/dialog'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'
import { Button } from '@zyra/ui/components/button'
import { CreditCard, Smartphone } from 'lucide-react'
import { Badge } from '@zyra/ui/components/badge'
import { ChargeResponse, KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'
import { getCurrentConfig } from '@zyra/conf/lib/korapay-config'
import { formatPrice } from '@zyra/conf/lib/utils'
import CardPaymentForm from './CardPaymentForm'
import MobilePaymentForm from './MobilePaymentForm'
import PaymentAlertModal, { createAlertData } from './PaymentAlertModal'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  pkg: PackageData | null
  billingPeriod: 'monthly' | 'yearly'
  yearlyDiscount: number
}

type PaymentMethod = 'card' | 'mobile' | null

interface PaymentAlertData {
  type: 'success' | 'error' | 'processing' | 'otp_required' | 'pin_required' | '3ds_redirect' | 'mobile_instructions' | 'timeout' | 'retry_needed'
  title: string
  message: string
  transactionReference?: string
  countdown?: number
  authData?: any
  redirectUrl?: string
}

export default function PaymentModal({
  isOpen,
  onClose,
  pkg,
  billingPeriod,
  yearlyDiscount
}: PaymentModalProps) {
  const user = auth.currentUser
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [alertData, setAlertData] = useState<PaymentAlertData | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  // Calculs des prix
  const basePrice = pkg?.price || 0
  const yearlyPrice = basePrice * 12 * (1 - yearlyDiscount / 100)
  const totalAmount = billingPeriod === 'yearly' ? yearlyPrice : basePrice

  // Initialiser le service Korapay
  const korapayService = new KoraPaymentService(getCurrentConfig())

  // Gestionnaires d'événements pour les composants de paiement
  const handlePaymentSuccess = () => {
    setAlertData(createAlertData.success('Paiement effectué avec succès ! 🎉'))
    setIsAlertOpen(true)
    // Fermer la modal de paiement après 2 secondes
    setTimeout(() => {
      onClose()
      setIsAlertOpen(false)
      setAlertData(null)
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    setAlertData(createAlertData.error(error))
    setIsAlertOpen(true)
  }

  const handleMobileProcessing = (data: ChargeResponse) => {
    setAlertData(createAlertData.mobileInstructions(data.message))
    setIsAlertOpen(true)
  }

  const handleAuthRequired = async (authData: any) => {
    const authType = authData.auth_model
    if (authType === 'OTP') {
      setAlertData(createAlertData.otpRequired(
        authData.response_message || 'Entrez le code OTP reçu par SMS',
        authData.transaction_reference,
        300 // 5 minutes
      ))
      setIsAlertOpen(true)
    } else if (authType === 'PIN') {
      setAlertData(createAlertData.pinRequired(
        authData.response_message || 'Entrez votre PIN de carte',
        authData.transaction_reference
      ))
      setIsAlertOpen(true)
    } else if (authType === '3DS') {
      if (authData.authorization?.redirect_url) {
        setAlertData(createAlertData.redirect3DS(
          'Vous allez être redirigé pour la vérification 3D Secure',
          authData.authorization.redirect_url,
          authData.transaction_reference
        ))
        setIsAlertOpen(true)
      }
    }
  }

  // Gestion des soumissions d'autorisation
  const handleOtpSubmit = async (otp: string) => {
    try {
      const authResult = await korapayService.authorizeCardCharge({
        transaction_reference: alertData?.transactionReference!,
        authorization: { otp }
      })

      if (authResult.data.status === 'success') {
        handlePaymentSuccess()
      } else {
        throw new Error('Code OTP invalide ou expiré')
      }
    } catch (error: any) {
      handlePaymentError(error.message || 'Erreur lors de la validation OTP')
    }
  }

  const handlePinSubmit = async (pin: string) => {
    try {
      const authResult = await korapayService.authorizeCardCharge({
        transaction_reference: alertData?.transactionReference!,
        authorization: { pin }
      })

      if (authResult.data.status === 'success') {
        handlePaymentSuccess()
      } else {
        throw new Error('PIN invalide')
      }
    } catch (error: any) {
      handlePaymentError(error.message || 'Erreur lors de la validation PIN')
    }
  }

  const handleResendOtp = async () => {
    // Logic to resend OTP if needed
    toast.info('Nouveau code OTP envoyé')
  }

  // Reset quand on change de méthode
  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const handleBack = () => {
    setSelectedMethod(null)
  }

  const handleCloseAlert = () => {
    setIsAlertOpen(false)
    setAlertData(null)
  }

  if (!pkg) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              Finaliser votre abonnement
            </DialogTitle>

            {pkg && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {billingPeriod === 'yearly' ? 'Annuel' : 'Mensuel'}
                    </Badge>

                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Smartphone className="w-3 h-3 mr-1" />
                      {pkg.currency}
                    </Badge>
                  </div>

                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(totalAmount, pkg.currency)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {billingPeriod === 'yearly' ? 'par an' : 'par mois'}
                  </p>

                  {billingPeriod === 'yearly' && yearlyDiscount > 0 && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🎉 Économisez {yearlyDiscount}% !
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Package {pkg.name} - {pkg.features.length} fonctionnalités incluses
                  </p>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="pt-6">
            <div className="space-y-6">
              {/* Sélection de la méthode de paiement */}
              {!selectedMethod && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Choisissez votre méthode de paiement
                    </p>
                  </div>
                  
                  {/* Bouton Carte */}
                  <Button
                    onClick={() => handleMethodChange('card')}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    Payer par Carte Bancaire
                  </Button>

                  {/* Bouton Mobile Money */}
                  <Button
                    onClick={() => handleMethodChange('mobile')}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Smartphone className="w-5 h-5 mr-3" />
                    Payer par Mobile Money
                  </Button>
                </div>
              )}

              {/* Composant de paiement par carte */}
              {selectedMethod === 'card' && pkg.id && (
                <CardPaymentForm
                  amount={totalAmount}
                  currency={pkg.currency}
                  packageName={pkg.name}
                  packageId={pkg.id}
                  billingPeriod={billingPeriod}
                  userId={user?.uid}
                  userEmail={user?.email || undefined}
                  userName={user?.displayName || undefined}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onBack={handleBack}
                  onAuthRequired={handleAuthRequired}
                  korapayService={korapayService}
                />
              )}

              {/* Composant de paiement mobile */}
              {selectedMethod === 'mobile' && pkg.id && (
                <MobilePaymentForm
                  amount={totalAmount}
                  currency={pkg.currency}
                  packageName={pkg.name}
                  packageId={pkg.id}
                  billingPeriod={billingPeriod}
                  userId={user?.uid}
                  userEmail={user?.email || undefined}
                  userName={user?.displayName || undefined}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onBack={handleBack}
                  onProcessing={handleMobileProcessing}
                  korapayService={korapayService}
                />
              )}

              {/* Informations de sécurité */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>🔒 Paiement sécurisé via Korapay</p>
                <p>Vos données bancaires ne sont jamais stockées</p>
              </div>

              {/* Bouton annuler */}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-3 border border-gray-300 hover:bg-gray-50"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'alerte pour les différents types de notifications */}
      <PaymentAlertModal
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        alertData={alertData}
        onOtpSubmit={handleOtpSubmit}
        onPinSubmit={handlePinSubmit}
        onResendOtp={handleResendOtp}
      />
    </>
  )
}
