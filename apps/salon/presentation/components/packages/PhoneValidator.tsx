'use client'

import React from 'react'
import { Check, X, Smartphone, AlertTriangle } from 'lucide-react'
import { validatePhoneNumber } from '@zyra/conf/lib/utils'

interface PhoneValidatorProps {
  phoneNumber: string
  operator: 'mtn' | 'orange' | null
}

export default function PhoneValidator({ phoneNumber, operator }: PhoneValidatorProps) {
  const isValid = validatePhoneNumber(phoneNumber) && operator !== null

  if (!phoneNumber) return null

  return (
    <div className="mt-3 space-y-3">
      {/* Indicateur d'opérateur */}
      {operator && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Smartphone className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Opérateur détecté
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            operator === 'mtn' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : 'bg-orange-100 text-orange-800 border border-orange-200'
          }`}>
            {operator === 'mtn' ? 'MTN Cameroun' : 'Orange Cameroun'}
          </div>
        </div>
      )}

      {/* Messages de validation */}
      {phoneNumber && !isValid && (
        <div className="space-y-2">
          {!validatePhoneNumber(phoneNumber) && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-sm text-red-700">
                Format de numéro invalide
                <span className="block text-xs text-red-600 mt-0.5">
                  Le numéro doit être au format camerounais valide
                </span>
              </div>
            </div>
          )}
          {validatePhoneNumber(phoneNumber) && !operator && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-sm text-purple-700">
                Opérateur non reconnu
                <span className="block text-xs text-purple-600 mt-0.5">
                  Seuls MTN et Orange sont supportés
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation réussie */}
      {isValid && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
            <Check className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-emerald-800">
              Numéro valide pour le paiement
            </span>
            <div className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Prêt pour Mobile Money
            </div>
          </div>
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Aide contextuelle */}
      {phoneNumber.length > 0 && phoneNumber.length < 4 && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="text-xs text-blue-700">
            💡 <span className="font-medium">Formats acceptés :</span>
            <div className="mt-1 text-blue-600 space-y-1">
              <div>• +237 6XX XXX XXX (format international)</div>
              <div>• 237 6XX XXX XXX (avec préfixe pays)</div>
              <div>• 6XX XXX XXX (format local)</div>
            </div>
            <div className="mt-2 text-blue-600">
              <span className="font-medium">Exemples :</span> +237677123456, 237693123456, 666123456
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Fonction utilitaire pour détecter l'opérateur
