import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Loader, Check, AlertCircle } from 'lucide-react'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities'

type PaymentStep = 'processing' | 'success' | 'payment-confirmed' | 'error'
type PaymentMethod = 'CARD' | 'MOBILE_MONEY'

interface PaymentStatusStepsProps {
  currentStep: PaymentStep
  selectedMethod: PaymentMethod | null
  paymentData: any
  error: string
  isPolling: boolean
  pkg: PackageData
  onClose: () => void
  onRetry: () => void
}

export default function PaymentStatusSteps({
  currentStep,
  selectedMethod,
  paymentData,
  error,
  isPolling,
  pkg,
  onClose,
  onRetry
}: PaymentStatusStepsProps) {
  
  if (currentStep === 'processing') {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Loader className="h-10 w-10 animate-spin text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">Traitement en cours</h3>
          <p className="text-gray-600 max-w-sm mx-auto leading-relaxed px-4">
            Nous traitons votre paiement. Veuillez patienter...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'success' && paymentData) {
    return (
      <div className="text-center space-y-6 py-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Check className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-green-700">🎉 Paiement initié!</h3>
          <p className="text-green-600 max-w-sm mx-auto leading-relaxed px-4">
            {selectedMethod === 'MOBILE_MONEY' 
              ? 'Composez le code USSD sur votre téléphone pour finaliser'
              : 'Votre paiement est en cours de traitement'
            }
          </p>
          {isPolling && (
            <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-green-50 rounded-lg border border-green-200 mx-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm text-green-700 font-medium">Vérification automatique...</span>
            </div>
          )}
        </div>
        
        {paymentData.ussdCode && selectedMethod === 'MOBILE_MONEY' && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">📱 Code USSD à composer:</p>
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider break-all">
                {paymentData.ussdCode}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              Composez ce code sur votre téléphone et suivez les instructions
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-600 border border-gray-200">
          <div className="flex justify-between items-center">
            <span>Référence:</span>
            <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 break-all ml-2">
              {paymentData.reference}
            </span>
          </div>
          {paymentData.operator && (
            <div className="flex justify-between items-center">
              <span>Opérateur:</span>
              <span className="font-semibold uppercase text-gray-700">{paymentData.operator}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={onClose} 
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
        >
          ✅ Fermer
        </Button>
      </div>
    )
  }

  if (currentStep === 'payment-confirmed') {
    return (
      <div className="text-center space-y-6 py-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Check className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-green-700">✅ Paiement confirmé!</h3>
          <p className="text-green-600 max-w-sm mx-auto leading-relaxed px-4">
            Votre paiement a été traité avec succès. Votre abonnement est maintenant actif.
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-green-800">Abonnement activé</span>
            </div>
            <p className="text-sm text-green-700">
              Vous pouvez maintenant profiter de toutes les fonctionnalités de votre package {pkg.name}.
            </p>
          </div>
        </div>

        <Button 
          onClick={onClose} 
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
        >
          🚀 Commencer à utiliser
        </Button>
      </div>
    )
  }

  if (currentStep === 'error') {
    return (
      <div className="text-center space-y-6 py-6">
        <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <AlertCircle className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-red-700">❌ Erreur de paiement</h3>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 py-3 border border-gray-300 hover:bg-gray-50"
          >
            Fermer
          </Button>
          <Button 
            onClick={onRetry}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            🔄 Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return null
}
