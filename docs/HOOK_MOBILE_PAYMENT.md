# Hook useMobilePayment - Documentation

## Vue d'ensemble

Le hook `useMobilePayment` est un hook React personnalisé qui encapsule toute la logique de gestion des paiements mobile money avec Korapay. Il simplifie l'intégration des paiements mobiles dans les composants React en fournissant une interface claire et des callbacks structurés.

## Fonctionnalités

✅ **Gestion complète du cycle de paiement mobile money**
✅ **Support de tous les auth_model** (`PIN`, `OTP`, `STK_PROMPT`, `USSD`, `3DS`, `BANK_TRANSFER`)
✅ **Polling automatique** pour les paiements USSD
✅ **Validation OTP** avec gestion des erreurs
✅ **Renvoi d'OTP** si supporté par l'API
✅ **Nettoyage automatique** des ressources
✅ **Messages contextuels** selon le type d'autorisation

## Import et utilisation de base

```typescript
import { useMobilePayment } from '../hooks/useMobilePayment'
import { KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'

const korapayService = new KoraPaymentService(config)

const mobilePayment = useMobilePayment({
  korapayService,
  callbacks: {
    onSuccess: () => console.log('Paiement réussi'),
    onError: (error) => console.error('Erreur:', error),
    onProcessing: (data) => console.log('En cours:', data),
    onShowUssdInstructions: (data) => console.log('Instructions USSD:', data)
  }
})
```

## Interface des callbacks

```typescript
interface MobilePaymentCallbacks {
  onSuccess: () => void                              // Paiement confirmé avec succès
  onError: (error: string) => void                   // Erreur durant le processus
  onProcessing: (data: ChargeResponse) => void       // Paiement en cours (non-USSD)
  onShowUssdInstructions: (data: ChargeResponse) => void // Instructions USSD à afficher
}
```

## État du hook

```typescript
interface MobilePaymentState {
  isProcessing: boolean        // Paiement en cours d'initiation
  showOtpForm: boolean        // Formulaire OTP doit être affiché
  otpData: ChargeResponse | null  // Données de la transaction nécessitant OTP
  error: string | null        // Erreur courante
  currentTransaction: string | null // Référence de transaction active
}
```

## Méthodes principales

### 1. initiateMobilePayment()

Lance un nouveau paiement mobile money.

```typescript
const request: MobileMoneyChargeRequest = {
  reference: 'ZYRA-12345',
  amount: 5000,
  currency: 'XOF',
  customer: { name: 'John Doe', email: 'john@example.com' },
  mobile_money: { number: '+22670123456' }
}

await mobilePayment.initiateMobilePayment(request)
```

### 2. validateOtp()

Valide un code OTP saisi par l'utilisateur.

```typescript
try {
  await mobilePayment.validateOtp('1234')
  // Le callback onSuccess sera automatiquement appelé
} catch (error) {
  console.error('OTP invalide:', error.message)
}
```

### 3. resendOtp()

Renvoie un nouveau code OTP si l'API le supporte.

```typescript
const success = await mobilePayment.resendOtp()
if (success) {
  console.log('Nouveau code OTP envoyé')
}
```

### 4. closeOtpForm()

Ferme le formulaire OTP et réinitialise l'état.

```typescript
mobilePayment.closeOtpForm()
```

### 5. cleanup()

Nettoie toutes les ressources (polling, timeouts).

```typescript
useEffect(() => {
  return () => {
    mobilePayment.cleanup()
  }
}, [mobilePayment])
```

## Propriétés calculées

```typescript
// État de chargement
const isLoading = mobilePayment.isLoading

// Erreur active
const hasError = mobilePayment.hasError

// OTP requis
const isOtpRequired = mobilePayment.isOtpRequired

// Transaction courante
const transactionRef = mobilePayment.currentTransactionRef
```

## Méthodes utilitaires

### getOtpMessage()

Retourne le message approprié selon le type d'auth_model.

```typescript
const message = mobilePayment.getOtpMessage()
// Retourne: "Entrez votre PIN pour finaliser le paiement" pour STK_PROMPT
// Retourne: "Entrez le code OTP reçu par SMS" pour OTP
```

### getOtpTitle()

Retourne le titre approprié pour le formulaire OTP.

```typescript
const title = mobilePayment.getOtpTitle()
// Retourne: "Validation Mobile Money" pour STK_PROMPT
// Retourne: "Validation OTP" pour OTP
```

## Exemple complet d'intégration

```tsx
import React, { useEffect } from 'react'
import { useMobilePayment } from '../hooks/useMobilePayment'
import MobileOtpForm from './MobileOtpForm'

export default function PaymentComponent() {
  const mobilePayment = useMobilePayment({
    korapayService,
    callbacks: {
      onSuccess: () => {
        alert('Paiement réussi!')
      },
      onError: (error) => {
        alert('Erreur: ' + error)
      },
      onProcessing: (data) => {
        console.log('Paiement en cours:', data.message)
      },
      onShowUssdInstructions: (data) => {
        alert('Instructions USSD: ' + data.message)
      }
    }
  })

  useEffect(() => {
    return () => {
      mobilePayment.cleanup()
    }
  }, [mobilePayment])

  const handlePayment = async () => {
    await mobilePayment.initiateMobilePayment({
      reference: 'PAYMENT-' + Date.now(),
      amount: 1000,
      currency: 'XOF',
      customer: { name: 'Test User', email: 'test@example.com' },
      mobile_money: { number: '+22670123456' }
    })
  }

  return (
    <div>
      <button onClick={handlePayment} disabled={mobilePayment.isLoading}>
        {mobilePayment.isLoading ? 'Traitement...' : 'Payer par Mobile Money'}
      </button>

      {mobilePayment.isOtpRequired && mobilePayment.state.otpData && (
        <MobileOtpForm
          message={mobilePayment.getOtpMessage()}
          transactionReference={mobilePayment.state.otpData.transaction_reference}
          onSubmit={mobilePayment.validateOtp}
          onBack={mobilePayment.closeOtpForm}
          onResend={mobilePayment.resendOtp}
        />
      )}
    </div>
  )
}
```

## Gestion des différents auth_model

Le hook gère automatiquement tous les types d'autorisation :

| auth_model | Comportement | Action utilisateur |
|------------|--------------|-------------------|
| `PIN` | Affiche formulaire OTP | Saisir PIN de carte |
| `OTP` | Affiche formulaire OTP | Saisir code SMS |
| `STK_PROMPT` | Affiche formulaire OTP | Saisir PIN mobile money |
| `USSD` | Affiche instructions + polling | Composer code USSD |
| `3DS` | Affiche formulaire OTP | Saisir code 3D Secure |
| `BANK_TRANSFER` | Affiche formulaire OTP | Saisir code bancaire |

## Polling automatique

Le hook démarre automatiquement un polling pour les paiements USSD :
- **Délai avant début** : 10 secondes
- **Intervalle** : 5 secondes
- **Tentatives max** : 8
- **Auto-nettoyage** : Oui

## Nettoyage des ressources

Le hook nettoie automatiquement :
- ✅ Timeouts de polling
- ✅ État des formulaires
- ✅ Références de transactions
- ✅ Messages d'erreur

```typescript
// Nettoyage manuel si nécessaire
mobilePayment.cleanup()

// Nettoyage automatique au démontage
useEffect(() => {
  return () => mobilePayment.cleanup()
}, [])
```

## Gestion d'erreurs

Le hook fournit des messages d'erreur contextuels :
- **OTP expiré** : "Le code OTP a expiré. Veuillez demander un nouveau code."
- **OTP invalide** : "Code OTP invalide. Veuillez vérifier et réessayer."
- **Réseau** : "Problème de connexion. Veuillez réessayer."
- **Solde insuffisant** : "Solde insuffisant sur votre compte mobile money."

## Bonnes pratiques

1. **Toujours nettoyer** : Appelez `cleanup()` au démontage du composant
2. **Gestion d'erreurs** : Implémentez tous les callbacks pour une UX optimale
3. **Messages utilisateur** : Utilisez `getOtpMessage()` pour des messages contextuels
4. **État de chargement** : Affichez l'état `isLoading` pendant les opérations
5. **Validation** : Laissez le hook gérer la validation des auth_model

## Migration depuis l'ancien système

Si vous migrez depuis un système sans hook :

```typescript
// Avant
const [showOtp, setShowOtp] = useState(false)
const [otpData, setOtpData] = useState(null)
// ... logique complexe

// Après
const mobilePayment = useMobilePayment({ korapayService, callbacks })
// Logique automatiquement gérée ✅
```

## Support et débogage

Pour le débogage, le hook log automatiquement :
- Initiation des paiements
- Réponses d'autorisation
- Validation OTP
- Erreurs de polling

Consultez la console du navigateur pour les logs détaillés.
