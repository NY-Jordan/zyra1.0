# Hook useCardPayment - Documentation

## Vue d'ensemble

Le hook `useCardPayment` est un hook React personnalisé qui encapsule toute la logique de gestion des paiements par carte bancaire avec Korapay. Il simplifie l'intégration des paiements par carte dans les composants React en fournissant une interface claire et des callbacks structurés.

## Fonctionnalités

✅ **Gestion complète du cycle de paiement par carte**
✅ **Support de tous les auth_model** (`PIN`, `OTP`, `3DS`)
✅ **Validation automatique** des données de carte
✅ **Gestion des timeouts** d'autorisation (5 minutes)
✅ **Support 3D Secure** avec redirection et polling
✅ **Validation PIN/OTP** avec gestion des erreurs
✅ **Nettoyage automatique** des ressources
✅ **Messages contextuels** selon le type d'autorisation

## Import et utilisation de base

```typescript
import { useCardPayment } from '../hooks/useCardPayment'
import { KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'

const korapayService = new KoraPaymentService(config)

const cardPayment = useCardPayment({
  korapayService,
  callbacks: {
    onSuccess: () => console.log('Paiement réussi'),
    onError: (error) => console.error('Erreur:', error),
    onProcessing: (data) => console.log('En cours:', data),
    onPinRequired: (data) => console.log('PIN requis:', data),
    onOtpRequired: (data) => console.log('OTP requis:', data),
    on3DSRedirect: (data) => console.log('Redirection 3DS:', data)
  }
})
```

## Interface des callbacks

```typescript
interface CardPaymentCallbacks {
  onSuccess: () => void                              // Paiement confirmé avec succès
  onError: (error: string) => void                   // Erreur durant le processus
  onProcessing: (data: ChargeResponse) => void       // Paiement en cours (sans auth)
  onPinRequired: (data: ChargeResponse) => void      // PIN de carte requis
  onOtpRequired: (data: ChargeResponse) => void      // Code OTP requis
  on3DSRedirect: (data: ChargeResponse) => void      // Redirection 3D Secure nécessaire
}
```

## État du hook

```typescript
interface CardPaymentState {
  isProcessing: boolean         // Paiement en cours d'initiation
  showAuthForm: boolean        // Formulaire d'autorisation doit être affiché
  authData: ChargeResponse | null  // Données de la transaction nécessitant autorisation
  error: string | null         // Erreur courante
  currentTransaction: string | null // Référence de transaction active
  authType: 'PIN' | 'OTP' | '3DS' | null // Type d'autorisation requis
}
```

## Méthodes principales

### 1. initiateCardPayment()

Lance un nouveau paiement par carte.

```typescript
const request: CardChargeRequest = {
  reference: 'ZYRA-12345',
  amount: 5000,
  currency: 'XOF',
  customer: { name: 'John Doe', email: 'john@example.com' },
  card: {
    name: 'John Doe',
    number: '4111111111111111',
    cvv: '123',
    expiry_month: '12',
    expiry_year: '25',
    pin: '1234'
  }
}

await cardPayment.initiateCardPayment(request)
```

### 2. validatePin()

Valide un PIN de carte saisi par l'utilisateur.

```typescript
try {
  await cardPayment.validatePin('1234')
  // Le callback onSuccess sera automatiquement appelé
} catch (error) {
  console.error('PIN invalide:', error.message)
}
```

### 3. validateOtp()

Valide un code OTP saisi par l'utilisateur.

```typescript
try {
  await cardPayment.validateOtp('123456')
  // Le callback onSuccess sera automatiquement appelé
} catch (error) {
  console.error('OTP invalide:', error.message)
}
```

### 4. handle3DSRedirect()

Gère la redirection 3D Secure et démarre le polling automatique.

```typescript
cardPayment.handle3DSRedirect('https://3ds-redirect-url.com')
// Ouvre automatiquement la page 3DS et poll le statut
```

### 5. resendOtp()

Renvoie un nouveau code OTP si l'API le supporte.

```typescript
const success = await cardPayment.resendOtp()
if (success) {
  console.log('Nouveau code OTP envoyé')
}
```

### 6. closeAuthForm()

Ferme le formulaire d'autorisation et arrête les timeouts.

```typescript
cardPayment.closeAuthForm()
```

### 7. cleanup()

Nettoie toutes les ressources (timeouts, polling).

```typescript
useEffect(() => {
  return () => {
    cardPayment.cleanup()
  }
}, [cardPayment])
```

## Propriétés calculées

```typescript
// État de chargement
const isLoading = cardPayment.isLoading

// Erreur active
const hasError = cardPayment.hasError

// Autorisation requise
const isAuthRequired = cardPayment.isAuthRequired

// Transaction courante
const transactionRef = cardPayment.currentTransactionRef

// Types d'autorisation spécifiques
const needsPin = cardPayment.needsPin
const needsOtp = cardPayment.needsOtp
const needs3DS = cardPayment.needs3DS
```

## Méthodes utilitaires

### getAuthMessage()

Retourne le message approprié selon le type d'autorisation.

```typescript
const message = cardPayment.getAuthMessage()
// Retourne: "Entrez le PIN de votre carte pour confirmer le paiement" pour PIN
// Retourne: "Entrez le code OTP reçu par SMS ou email" pour OTP
```

### getAuthTitle()

Retourne le titre approprié pour le formulaire d'autorisation.

```typescript
const title = cardPayment.getAuthTitle()
// Retourne: "PIN de carte requis" pour PIN
// Retourne: "Code OTP requis" pour OTP
```

### validateCardData()

Valide les données de carte avant soumission.

```typescript
const validation = cardPayment.validateCardData({
  number: '4111111111111111',
  expiry_month: '12',
  expiry_year: '25',
  cvv: '123',
  name: 'John Doe'
})

if (!validation.isValid) {
  console.log('Erreurs:', validation.errors)
}
```

## Exemple complet d'intégration

```tsx
import React, { useEffect, useState } from 'react'
import { useCardPayment } from '../hooks/useCardPayment'
import CardAuthForm from './CardAuthForm'

export default function CardPaymentComponent() {
  const [showAuthForm, setShowAuthForm] = useState(false)

  const cardPayment = useCardPayment({
    korapayService,
    callbacks: {
      onSuccess: () => {
        alert('Paiement par carte réussi!')
        setShowAuthForm(false)
      },
      onError: (error) => {
        alert('Erreur: ' + error)
        setShowAuthForm(false)
      },
      onProcessing: (data) => {
        console.log('Paiement en cours:', data.message)
      },
      onPinRequired: (data) => {
        setShowAuthForm(true)
      },
      onOtpRequired: (data) => {
        setShowAuthForm(true)
      },
      on3DSRedirect: (data) => {
        // La redirection sera gérée automatiquement
        alert('Redirection 3D Secure en cours...')
      }
    }
  })

  useEffect(() => {
    return () => {
      cardPayment.cleanup()
    }
  }, [cardPayment])

  const handlePayment = async () => {
    await cardPayment.initiateCardPayment({
      reference: 'CARD-' + Date.now(),
      amount: 1000,
      currency: 'XOF',
      customer: { name: 'Test User', email: 'test@example.com' },
      card: {
        name: 'Test User',
        number: '4111111111111111',
        cvv: '123',
        expiry_month: '12',
        expiry_year: '25'
      }
    })
  }

  return (
    <div>
      <button onClick={handlePayment} disabled={cardPayment.isLoading}>
        {cardPayment.isLoading ? 'Traitement...' : 'Payer par Carte'}
      </button>

      {showAuthForm && cardPayment.isAuthRequired && (
        <CardAuthForm
          title={cardPayment.getAuthTitle()}
          message={cardPayment.getAuthMessage()}
          inputType={cardPayment.getAuthInputType()}
          onPinSubmit={cardPayment.validatePin}
          onOtpSubmit={cardPayment.validateOtp}
          onBack={cardPayment.closeAuthForm}
          onResend={cardPayment.resendOtp}
        />
      )}
    </div>
  )
}
```

## Gestion des différents auth_model

Le hook gère automatiquement tous les types d'autorisation pour les cartes :

| auth_model | Comportement | Action utilisateur |
|------------|--------------|-------------------|
| `PIN` | Affiche formulaire PIN | Saisir PIN de carte (4 chiffres) |
| `OTP` | Affiche formulaire OTP | Saisir code SMS/email (6 chiffres) |
| `3DS` | Redirection automatique | Compléter vérification 3D Secure |
| `NONE` | Paiement direct | Aucune action requise |

## Timeout et 3D Secure

### Timeout d'autorisation
- **Durée** : 5 minutes pour PIN/OTP
- **Action** : Nettoyage automatique et callback d'erreur
- **Message** : "Le délai d'autorisation a expiré"

### 3D Secure
- **Redirection** : Ouvre automatiquement dans une nouvelle fenêtre
- **Polling** : Vérifie le statut toutes les 3 secondes
- **Timeout** : Arrête après 10 minutes
- **Nettoyage** : Automatique après succès/échec

## Validation des données

Le hook inclut une validation complète des données de carte :

```typescript
// Validation automatique
const validation = cardPayment.validateCardData(cardData)

// Règles appliquées :
// - Numéro : 13-19 chiffres (algorithme de Luhn)
// - CVV : 3-4 chiffres
// - Date expiration : Mois 1-12, année future
// - Nom : Requis et non vide
```

## Gestion d'erreurs

Le hook fournit des messages d'erreur contextuels :
- **PIN invalide** : "PIN de carte incorrect. Veuillez réessayer."
- **OTP expiré** : "Le code OTP a expiré. Demandez un nouveau code."
- **3DS échoué** : "Vérification 3D Secure échouée."
- **Timeout** : "Le délai d'autorisation a expiré."

## Bonnes pratiques

1. **Validation préalable** : Validez les données avant initiation
2. **Nettoyage** : Appelez `cleanup()` au démontage du composant
3. **États de chargement** : Affichez l'état `isLoading`
4. **Gestion 3DS** : Laissez le hook gérer les redirections
5. **Timeouts** : Implémentez des messages d'attente pour l'utilisateur

## Migration depuis l'ancien système

Si vous migrez depuis un système sans hook :

```typescript
// Avant
const [authRequired, setAuthRequired] = useState(false)
const [authType, setAuthType] = useState(null)
// ... logique complexe de gestion des états

// Après
const cardPayment = useCardPayment({ korapayService, callbacks })
// Logique automatiquement gérée ✅
```

## Sécurité

Le hook respecte les bonnes pratiques de sécurité :
- ✅ **Pas de logs** des données sensibles (PIN, numéros de carte)
- ✅ **Timeout automatique** pour les autorisations
- ✅ **Validation côté client** avant envoi
- ✅ **Nettoyage des états** après paiement

## Support et débogage

Pour le débogage, le hook log automatiquement :
- Initiation des paiements (sans données sensibles)
- Types d'autorisation requis
- Succès/échecs de validation
- Redirections 3D Secure

Consultez la console du navigateur pour les logs détaillés (les données sensibles sont masquées).

## Intégration avec PaymentModal

Le hook s'intègre parfaitement dans le PaymentModal existant :

```typescript
// Dans PaymentModal.tsx
const cardPayment = useCardPayment({
  korapayService,
  callbacks: {
    onSuccess: handlePaymentSuccess,
    onError: handlePaymentError,
    onPinRequired: (data) => showPinForm(data),
    onOtpRequired: (data) => showOtpForm(data),
    on3DSRedirect: (data) => handle3DSRedirect(data)
  }
})

// Utilisation dans CardPaymentForm
<CardPaymentForm
  onSuccess={cardPayment.initiateCardPayment}
  onAuthRequired={cardPayment.handleCardPaymentResponse}
  // ...autres props
/>
```
