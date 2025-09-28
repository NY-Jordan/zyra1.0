# KoraPaymentService - Guide d'utilisation

Ce service fournit une interface complète pour intégrer les paiements Korapay dans votre application.

## Configuration

```typescript
import { KoraPaymentService } from '@zyra/conf/services/KoraPaymentService'

const korapayService = new KoraPaymentService({
  publicKey: process.env.KORAPAY_PUBLIC_KEY!,
  secretKey: process.env.KORAPAY_SECRET_KEY!,
  baseUrl: 'https://api.korapay.com/merchant/api/v1' // optionnel
})
```

## Paiement par carte

### Étape 1 : Initier le paiement

```typescript
const cardPayment = await korapayService.chargeCard({
  reference: korapayService.generateReference('ZYRA'), // génère une référence unique
  amount: 1000, // en kobo (10.00 NGN)
  currency: 'NGN',
  redirect_url: 'https://yoursite.com/payment/success',
  customer: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  card: {
    name: 'John Doe',
    number: '5130000052131820',
    cvv: '419',
    expiry_month: '12',
    expiry_year: '32',
    pin: '0000' // optionnel
  },
  metadata: {
    userId: 'user123',
    packageId: 'premium'
  }
})

console.log(cardPayment.data.status) // 'processing', 'success', 'failed'
```

### Étape 2 : Autoriser le paiement (si nécessaire)

```typescript
if (cardPayment.data.auth_model === 'OTP') {
  const authorization = await korapayService.authorizeCardCharge({
    transaction_reference: cardPayment.data.transaction_reference,
    authorization: {
      otp: '123456' // OTP saisi par l'utilisateur
    }
  })
}

if (cardPayment.data.auth_model === 'PIN') {
  const authorization = await korapayService.authorizeCardCharge({
    transaction_reference: cardPayment.data.transaction_reference,
    authorization: {
      pin: '1234' // PIN saisi par l'utilisateur
    }
  })
}

if (cardPayment.data.auth_model === 'AVS') {
  const authorization = await korapayService.authorizeCardCharge({
    transaction_reference: cardPayment.data.transaction_reference,
    authorization: {
      avs: {
        state: 'Lagos',
        city: 'Ikeja',
        country: 'Nigeria',
        address: '123 Main St',
        zip_codes: '100001'
      }
    }
  })
}
```

## Paiement par transfert bancaire

```typescript
// Récupérer d'abord la liste des banques
const banks = await korapayService.getBanks()
console.log(banks.data) // [{ name: 'Access Bank', code: '044', country: 'NG' }, ...]

// Vérifier un compte bancaire
const accountVerification = await korapayService.verifyBankAccount('044', '1234567890')
console.log(accountVerification.data.account_name)

// Initier le paiement
const bankTransferPayment = await korapayService.chargeBankTransfer({
  reference: korapayService.generateReference('ZYRA'),
  amount: 5000,
  currency: 'NGN',
  customer: {
    name: 'Jane Doe',
    email: 'jane@example.com'
  },
  bank_transfer: {
    bank_code: '044',
    account_number: '1234567890'
  }
})
```

## Paiement par Mobile Money

```typescript
const mobilePayment = await korapayService.chargeMobileMoney({
  reference: korapayService.generateReference('ZYRA'),
  amount: 2000,
  currency: 'NGN',
  customer: {
    name: 'Mike Johnson',
    email: 'mike@example.com'
  },
  mobile_money: {
    provider: 'mtn',
    phone_number: '+2348012345678'
  }
})
```

## Vérification de transaction

```typescript
const transactionStatus = await korapayService.verifyTransaction('ZYRA-1234567890-ABC123')
console.log(transactionStatus.data.status) // 'success', 'failed', 'processing'

// Récupérer les détails complets
const transactionDetails = await korapayService.getTransaction('ZYRA-1234567890-ABC123')
console.log(transactionDetails.data)
```

## Gestion des erreurs avec retry

```typescript
try {
  // Paiement avec retry automatique
  const payment = await korapayService.processCardPaymentWithRetry({
    reference: korapayService.generateReference('ZYRA'),
    amount: 1000,
    currency: 'NGN',
    customer: { name: 'John', email: 'john@test.com' },
    card: {
      name: 'John Doe',
      number: '5130000052131820',
      cvv: '419',
      expiry_month: '12',
      expiry_year: '32'
    }
  }, 3) // 3 tentatives maximum

} catch (error) {
  console.error('Paiement échoué après plusieurs tentatives:', error.message)
}
```

## Validation des données

```typescript
// Validation de carte
const cardValidation = KoraPaymentService.validateCard({
  name: 'John Doe',
  number: '5130000052131820',
  cvv: '419',
  expiry_month: '12',
  expiry_year: '32'
})

if (!cardValidation.isValid) {
  console.log('Erreurs:', cardValidation.errors)
}

// Validation email
const isValidEmail = KoraPaymentService.validateEmail('test@example.com')

// Validation téléphone
const isValidPhone = KoraPaymentService.validatePhoneNumber('+2348012345678')
```

## Gestion des webhooks

```typescript
// Dans votre endpoint de webhook
app.post('/webhooks/korapay', (req, res) => {
  const { event, data } = req.body

  if (event === 'charge.success') {
    console.log('Paiement réussi:', data.reference)
    // Activer l'abonnement utilisateur
  }

  if (event === 'charge.failed') {
    console.log('Paiement échoué:', data.reference)
    // Notifier l'utilisateur
  }

  res.status(200).json({ received: true })
})
```

## Variables d'environnement

```bash
# .env.local
KORAPAY_PUBLIC_KEY=pk_test_your_public_key
KORAPAY_SECRET_KEY=sk_test_your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Avantages du service

- ✅ Support complet des paiements Korapay (Card, Bank Transfer, Mobile Money)
- ✅ Gestion automatique des erreurs avec retry
- ✅ Validation des données côté client
- ✅ TypeScript avec types complets
- ✅ Méthodes utilitaires (génération de référence, validation)
- ✅ Support des webhooks
- ✅ Configuration flexible
- ✅ Logging et debugging intégrés
