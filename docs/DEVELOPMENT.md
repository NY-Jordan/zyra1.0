# 🛠️ Guide de Développement Zyra

## 📋 Structure des Composants

### 🎨 Composants de Paiement

#### PaymentModal.tsx
Modal principale orchestrant le flux de paiement avec sélection de méthode.

#### CardPaymentForm.tsx
```tsx
interface CardPaymentFormProps {
  amount: number
  currency: string
  packageName: string
  packageId: string
  billingPeriod: string
  userId?: string
  userEmail?: string
  userName?: string
  onSuccess: () => void
  onError: (error: string) => void
  onBack: () => void
  onAuthRequired: (data: any) => void
  korapayService: KoraPaymentService
}
```

#### MobilePaymentForm.tsx
```tsx
interface MobilePaymentFormProps {
  amount: number
  currency: string
  packageName: string
  packageId: string
  billingPeriod: string
  userId?: string
  userEmail?: string
  userName?: string
  onSuccess: () => void
  onError: (error: string) => void
  onBack: () => void
  onProcessing: (message: string) => void
  korapayService: KoraPaymentService
}
```

#### PaymentAlertModal.tsx
Système d'alertes avancé avec support pour :
- ✅ Success, ❌ Error, ⏳ Processing
- 📱 OTP avec compte à rebours
- 🔐 PIN de carte
- 🔒 Redirection 3D Secure

## 🔧 Services

### KoraPaymentService.ts
Service complet pour l'intégration Korapay :

```typescript
class KoraPaymentService {
  // Paiement par carte avec support OTP/PIN/3DS
  async chargeCard(request: CardChargeRequest)
  
  // Paiement mobile money
  async chargeMobileMoney(request: MobileMoneyChargeRequest)
  
  // Autorisation des paiements (OTP/PIN)
  async authorizeCardCharge(request: AuthorizationRequest)
  
  // Vérification du statut des transactions
  async verifyTransaction(reference: string)
  
  // Utilitaires de validation
  static validateCard(card: CardInfo)
  static validatePhoneNumber(phone: string)
}
```

### Structure des Interfaces

```typescript
interface MobileMoneyInfo {
  number: string // Format international requis
}

interface CardInfo {
  name: string
  number: string
  cvv: string
  expiry_month: string
  expiry_year: string
  pin?: string
}

interface CustomerInfo {
  name: string
  email: string
}
```

## 🎯 Types d'Alertes Supportés

| Type | Description | Composants |
|------|-------------|-------------|
| `success` | Paiement réussi | ✅ Icône + Message |
| `error` | Erreur de paiement | ❌ Icône + Message d'erreur |
| `processing` | Paiement en cours | ⏳ Spinner + Message |
| `otp_required` | Code OTP requis | 📱 Champ OTP + Compte à rebours |
| `pin_required` | PIN de carte requis | 🔐 Champ PIN masqué |
| `3ds_redirect` | Redirection 3D Secure | 🔒 Bouton de redirection |
| `mobile_instructions` | Instructions Mobile Money | 📲 Message d'information |
| `retry_needed` | Nouvelle tentative requise | 🔄 Bouton retry |
| `timeout` | Transaction expirée | ⏰ Message de timeout |

## 📱 Gestion des États

### États du PaymentModal
- `selectedMethod`: 'card' | 'mobile' | null
- `alertData`: PaymentAlertData | null
- `isAlertOpen`: boolean

### États des Formulaires
- Loading states pour les boutons
- Validation en temps réel
- Formatage automatique (numéro de carte, téléphone)

## 🔒 Sécurité

### Validation des Données
- Algorithme de Luhn pour les cartes
- Validation regex pour les emails/téléphones
- Sanitisation des entrées utilisateur

### Gestion des Erreurs
- Try-catch systématique
- Messages d'erreur utilisateur-friendly
- Logging des erreurs pour debug

## 🎨 Styles et Thèmes

### Classes Tailwind Principales
```css
/* Gradients pour boutons */
bg-gradient-to-r from-blue-600 to-blue-700
bg-gradient-to-r from-green-600 to-green-700

/* États des formulaires */
text-gray-900 bg-white border-gray-300 placeholder-gray-500

/* Alertes colorées */
border-green-200 bg-green-50  /* Success */
border-red-200 bg-red-50      /* Error */
border-orange-200 bg-orange-50 /* OTP */
```

## 🔄 Flux de Paiement

### Paiement par Carte
1. Validation des champs
2. Appel `chargeCard()`
3. Gestion des réponses :
   - ✅ `success` → Confirmation
   - 📱 `auth_model: 'OTP'` → Modal OTP
   - 🔐 `auth_model: 'PIN'` → Modal PIN
   - 🔒 `auth_model: '3DS'` → Redirection
4. Autorisation si nécessaire
5. Confirmation finale

### Paiement Mobile Money
1. Validation du numéro
2. Appel `chargeMobileMoney()`
3. Gestion des réponses :
   - ✅ `success` → Confirmation
   - ⏳ `processing` → Instructions SMS
   - ❌ `failed` → Message d'erreur

## 🧪 Tests et Debug

### Données de Test Korapay
```
Carte : 5130000052131820
CVV   : 419
Date  : 12/32
PIN   : 0000
```

### Logging
- `console.log` pour les payloads API
- Gestion des erreurs avec context
- Transaction references pour traçabilité

## 📦 Build et Déploiement

### Scripts Disponibles
```bash
pnpm dev          # Développement
pnpm build        # Build production
pnpm start        # Start production
pnpm lint         # Linting
pnpm type-check   # Vérification TypeScript
```

### Variables d'Environnement
```env
NEXT_PUBLIC_KORAPAY_PUBLIC_KEY=pk_test_xxx
KORAPAY_SECRET_KEY=sk_test_xxx
KORAPAY_BASE_URL=https://api.korapay.com/merchant/api/v1
```

## 🐛 Problèmes Communs

### Erreur : "Reference must be at least 8 characters"
- Solution : Utiliser `generateReference('ZYRA')`

### Erreur : "Invalid card number"
- Solution : Vérifier l'algorithme de Luhn dans `validateCard()`

### Mobile Money : "Invalid number format"
- Solution : S'assurer du format international (+225XXXXXXXXX)

### OTP/PIN non reçu
- Solution : Vérifier les paramètres Korapay en mode sandbox

## 📚 Ressources

- [Documentation Korapay](https://korapay.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
