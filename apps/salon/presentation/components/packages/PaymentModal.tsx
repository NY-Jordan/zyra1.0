'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@zyra/ui/components/dialog'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'
import { auth } from '@zyra/conf/lib/firebase'
import { Button } from '@zyra/ui/components/button'
import { CreditCard, Smartphone, Loader2, CheckCircle } from 'lucide-react'
import { Badge } from '@zyra/ui/components/badge'
import { KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'
import { getCurrentConfig } from '@zyra/conf/lib/korapay-config'
import { formatPrice } from '@zyra/conf/lib/utils'
import CardPaymentForm from './CardPaymentForm'
import MobilePaymentForm from './MobilePaymentForm'
import { SubscriptionService } from '@/services/SubscriptionService'
import { useRouter } from 'next/navigation'
import { BillingPeriod } from '@zyra/conf/domain/entities/subscriptions.entities'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  pkg: PackageData | null
  billingPeriod: BillingPeriod
  yearlyDiscount: number
}

type PaymentMethod = 'card' | 'mobile' | null

export default function PaymentModal({
  isOpen,
  onClose,
  pkg,
  billingPeriod,
  yearlyDiscount
}: PaymentModalProps) {
  const user = auth.currentUser
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [paymentIsSuccess, setPaymentIsSuccess] = useState(false)
  // Calculs des prix
  const basePrice = pkg?.price || 0
  const yearlyPrice = basePrice * 12 * (1 - yearlyDiscount / 100)
  const totalAmount = billingPeriod === 'yearly' ? yearlyPrice : basePrice

  // Gestionnaires d'événements simplifiés
  const handlePaymentSuccess = () => {
    setPaymentIsSuccess(true);
    if(!pkg) return ;
    SubscriptionService.createSubscription({
      userId: String(user?.uid),
      packageId: String(pkg?.id),
      packageName: pkg?.name,
      packageFeatures: pkg.features,
      amount: totalAmount,
      currency: pkg?.currency,
      billingPeriod,
      autoRenew: true,
    });
    setTimeout(() => {
      router.push('/salon/dashboard');
    }, 5000);
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    // Vous pouvez ajouter une notification toast ici si nécessaire
  }

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const handleBack = () => {
    setSelectedMethod(null)
  }

  if (!pkg) return null

  return (
    <>
      {/* Loader full-page quand le paiement est réussi */}
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
                />
              )}

              {/* Composant de paiement mobile */}
              {selectedMethod === 'mobile' && pkg.id && (
                <MobilePaymentForm
                  amount={totalAmount}
                  currency={pkg.currency}
                  packageData={pkg}
                  billingPeriod={billingPeriod}
                  userId={String(user?.uid)}
                  userEmail={user?.email || undefined}
                  userName={user?.displayName || undefined}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onBack={handleBack}
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
    </>
  )
}
