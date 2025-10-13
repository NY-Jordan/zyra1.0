# Validation OTP Mobile Money - Guide d'implémentation

## Vue d'ensemble

Ce document explique l'implémentation de la validation OTP pour les paiements mobile money (STK Push, Mobile Money) avec l'API Korapay.

## Flux de paiement Mobile Money avec OTP

### 1. Étapes du processus

1. **Initiation du paiement**: L'utilisateur sélectionne "Mobile Money" et entre son numéro
2. **Requête de paiement**: Le système appelle `chargeMobileMoney()` 
3. **Réponse avec auth_model**: L'API retourne `status: 'processing'` avec `auth_model: 'OTP'` ou `'STK_PROMPT'`
4. **Affichage du formulaire OTP**: Le composant `MobileOtpForm` s'affiche avec un timer de 5 minutes
5. **Validation OTP**: L'utilisateur entre le code et le système appelle `validateMobileMoneyOtp()`
6. **Finalisation**: Le paiement est confirmé ou rejeté

### 2. Types d'auth_model supportés

- `'OTP'`: Code OTP classique reçu par SMS
- `'STK_PROMPT'`: STK Push nécessitant validation OTP
- `'USSD'`: Code USSD sans validation OTP (instructions seulement)
- `'NONE'`: Paiement direct sans autorisation supplémentaire

## Composants principaux

### KoraPaymentService

#### Nouvelles méthodes ajoutées

```typescript
// Validation spécifique d'OTP mobile money
async validateMobileMoneyOtp(transactionReference: string, otp: string): Promise<KoraPayResponse<ChargeResponse>>

// Polling automatique du statut de paiement
async pollMobileMoneyPaymentStatus(transactionReference: string, maxAttempts?: number, intervalMs?: number): Promise<KoraPayResponse<ChargeResponse>>

// Renvoi d'OTP (si supporté par l'API)
async resendMobileMoneyOtp(transactionReference: string): Promise<KoraPayResponse<any>>
```

#### Exemple d'utilisation

```typescript
const korapayService = new KoraPaymentService(config)

// 1. Lancer le paiement mobile
const chargeResult = await korapayService.chargeMobileMoney({
  reference: 'ZYRA-12345',
  amount: 5000,
  currency: 'XOF',
  customer: { name: 'John Doe', email: 'john@example.com' },
  mobile_money: { number: '+22670123456' }
})

// 2. Si OTP requis (status === 'processing' && auth_model === 'OTP')
if (chargeResult.data.auth_model === 'OTP') {
  // Afficher le formulaire OTP
  // Quand l'utilisateur entre le code:
  const validationResult = await korapayService.validateMobileMoneyOtp(
    chargeResult.data.transaction_reference,
    userOtpInput
  )
}
```

### MobileOtpForm Component

#### Props

```typescript
interface MobileOtpFormProps {
  message: string                    // Message d'instruction
  transactionReference: string       // Référence de la transaction
  onSubmit: (otp: string) => Promise<void>  // Callback de soumission
  onBack: () => void                // Callback de retour
  onResend?: () => Promise<void>    // Callback de renvoi (optionnel)
  countdown?: number                // Durée du timer (défaut: 300s)
  korapayService?: any             // Service Korapay pour validation directe
}
```

#### Fonctionnalités

- ✅ Timer de 5 minutes avec compte à rebours
- ✅ Validation automatique de l'OTP (4-6 chiffres)
- ✅ Gestion des erreurs spécifiques (expiré, invalide, réseau)
- ✅ Bouton de renvoi avec temporisation
- ✅ Interface optimisée mobile
- ✅ Validation directe via KoraPaymentService

### PaymentModal Integration

#### Gestion des scénarios Mobile Money

```typescript
const handleMobileProcessing = (data: ChargeResponse) => {
  if (data.status === 'processing' && (data.auth_model === 'OTP' || data.auth_model === 'STK_PROMPT')) {
    // Afficher le formulaire OTP
    setMobileOtpData(data)
    setShowMobileOtp(true)
  } else if (data.status === 'processing' && data.auth_model === 'USSD') {
    // Afficher les instructions USSD et démarrer le polling
    showUSSDInstructions(data)
    startMobilePaymentPolling(data.transaction_reference)
  }
}
```

## Configuration et déploiement

### Variables d'environnement

```env
# Configuration Korapay
KORAPAY_PUBLIC_KEY=pk_test_xxxxx
KORAPAY_SECRET_KEY=sk_test_xxxxx
KORAPAY_BASE_URL=https://api.korapay.com/merchant/api/v1
```

### Tests recommandés

1. **Test OTP valide**: Vérifier la validation avec un code correct
2. **Test OTP invalide**: Vérifier la gestion des erreurs
3. **Test timeout**: Vérifier l'expiration du timer
4. **Test renvoi**: Vérifier le mécanisme de renvoi d'OTP
5. **Test polling**: Vérifier le polling automatique pour USSD

## Gestion des erreurs

### Erreurs communes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Code OTP invalide ou expiré" | OTP incorrect ou timeout | Demander un nouveau code |
| "Impossible de renvoyer le code OTP" | API ne supporte pas le renvoi | Contact service client |
| "Paiement en cours de traitement" | Latence réseau/fournisseur | Utiliser le polling automatique |
| "Network Error" | Problème de connectivité | Réessayer plus tard |

### Logs et debugging

```typescript
// Logs automatiques dans KoraPaymentService
console.log('Validating Mobile Money OTP:', {
  transaction_reference: transactionReference,
  otp_length: otp.length
})

console.log('Mobile Money OTP validation result:', {
  status: result.data.status,
  auth_model: result.data.auth_model,
  message: result.data.message
})
```

## Bonnes pratiques

1. **Sécurité**: Ne jamais logger les codes OTP complets
2. **UX**: Toujours afficher un timer visible pour l'utilisateur  
3. **Performance**: Utiliser le polling avec modération (max 8 tentatives)
4. **Resilience**: Implémenter des fallbacks pour les erreurs réseau
5. **Monitoring**: Logger les transactions pour le support client

## Support fournisseurs

### Fournisseurs testés

- ✅ MTN Mobile Money (Burkina Faso, Côte d'Ivoire)
- ✅ Orange Money (Plusieurs pays)
- ✅ Moov Money (Burkina Faso)
- ⚠️ Autres fournisseurs: À tester selon les pays

### Particularités par fournisseur

- **MTN**: Support STK_PROMPT avec validation OTP
- **Orange**: Principalement USSD avec polling
- **Moov**: Mix entre OTP et USSD selon le montant

## Migration et mise à jour

Si vous migrez depuis l'ancienne version:

1. Mettre à jour `KoraPaymentService` avec les nouvelles méthodes
2. Remplacer les anciens gestionnaires OTP par `MobileOtpForm`
3. Ajouter la gestion des nouveaux `auth_model` types
4. Tester tous les fournisseurs mobile money utilisés

## Support et aide

Pour toute question technique:
- Documentation Korapay: https://docs.korapay.com
- Logs de débogage dans la console du navigateur
- Contacter l'équipe de développement Zyra
