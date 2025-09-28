# Korapay Integration - Endpoints API

## Configuration requise

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
KORAPAY_SANDBOX_PUBLIC_KEY=pk_test_your_sandbox_public_key
KORAPAY_SANDBOX_SECRET_KEY=sk_test_your_sandbox_secret_key
KORAPAY_LIVE_PUBLIC_KEY=pk_live_your_live_public_key
KORAPAY_LIVE_SECRET_KEY=sk_live_your_live_secret_key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

## Endpoints disponibles

### 1. POST /api/korapay/charge-card

Initie un paiement par carte bancaire.

**Body de la requête :**
```json
{
  "reference": "ZYRA-1695123456-ABC123", // min 8 caractères
  "card": {
    "name": "John Doe",
    "number": "5130000052131820",
    "cvv": "419",
    "expiry_month": "12",
    "expiry_year": "32",
    "pin": "0000" // optionnel
  },
  "amount": 100000, // en kobo (1000.00 NGN)
  "currency": "NGN",
  "userId": "user123",
  "packageId": "premium",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "billingPeriod": "monthly",
    "packageName": "Premium Plan"
  }
}
```

**Réponses possibles :**

**Succès immédiat :**
```json
{
  "status": "success",
  "transactionId": "ZYRA-1695123456-ABC123",
  "message": "Paiement Korapay traité",
  "data": {
    "amount": 100000,
    "status": "success",
    "transaction_reference": "KPY-CA-xyz123"
  }
}
```

**Autorisation requise (OTP/PIN) :**
```json
{
  "status": "processing",
  "transactionId": "ZYRA-1695123456-ABC123",
  "message": "Paiement Korapay traité",
  "data": {
    "amount": 100000,
    "status": "processing",
    "auth_model": "OTP", // ou "PIN", "AVS", "3DS"
    "response_message": "Entrez le code OTP envoyé au 080****123",
    "transaction_reference": "KPY-CA-xyz123"
  }
}
```

### 2. POST /api/korapay/charge-mobile

Initie un paiement par Mobile Money.

**Body de la requête :**
```json
{
  "reference": "ZYRA-1695123456-DEF456",
  "mobile_money": {
    "provider": "mtn", // "mtn", "airtel", "vodafone", "9mobile"
    "phone_number": "+2348012345678"
  },
  "amount": 50000, // en kobo (500.00 NGN)
  "currency": "NGN",
  "userId": "user123",
  "packageId": "basic",
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "metadata": {
    "billingPeriod": "yearly",
    "packageName": "Basic Plan"
  }
}
```

**Réponse typique :**
```json
{
  "status": "processing",
  "transactionId": "ZYRA-1695123456-DEF456",
  "message": "Paiement Mobile Money traité",
  "data": {
    "amount": 50000,
    "status": "processing",
    "transaction_reference": "KPY-MM-abc789",
    "response_message": "Composez *556*123# pour confirmer le paiement"
  },
  "instructions": "Composez *556*123# pour confirmer le paiement"
}
```

## Gestion des erreurs

**Erreur de validation :**
```json
{
  "error": "Données manquantes pour le paiement Korapay",
  "status": 400
}
```

**Erreur Korapay :**
```json
{
  "error": "Fonds insuffisants sur le compte Mobile Money",
  "status": 500
}
```

**Erreur serveur :**
```json
{
  "error": "Erreur serveur lors du paiement Korapay",
  "status": 500
}
```

## Flow de paiement

### Paiement par carte

1. **Étape 1** : Initier le paiement via `/api/korapay/charge-card`
2. **Étape 2a** : Si `status: "success"` → Paiement terminé ✅
3. **Étape 2b** : Si `status: "processing"` et `auth_model` présent → Autorisation requise
4. **Étape 3** : Gérer l'autorisation (OTP, PIN, 3DS, AVS)
5. **Étape 4** : Vérifier le statut final

### Paiement Mobile Money

1. **Étape 1** : Initier le paiement via `/api/korapay/charge-mobile`
2. **Étape 2** : Afficher les instructions à l'utilisateur
3. **Étape 3** : L'utilisateur confirme sur son téléphone
4. **Étape 4** : Webhook ou polling pour vérifier le statut

## Webhook (optionnel)

Pour recevoir les notifications automatiques :

```javascript
// POST /api/webhooks/korapay
app.post('/api/webhooks/korapay', (req, res) => {
  const { event, data } = req.body
  
  switch (event) {
    case 'charge.success':
      console.log('Paiement réussi:', data.reference)
      // Activer l'abonnement
      break
      
    case 'charge.failed':
      console.log('Paiement échoué:', data.reference)
      // Notifier l'utilisateur
      break
  }
  
  res.status(200).json({ received: true })
})
```

## Tests avec cartes de test

**Carte de succès :**
- Numéro : `5130000052131820`
- CVV : `419`
- Expiry : `12/32`
- PIN : `0000`

**Carte nécessitant OTP :**
- Numéro : `5399834187637862`
- CVV : `470`
- Expiry : `10/31`

**Numéros Mobile Money de test :**
- MTN : `+2348012345678`
- Airtel : `+2348123456789`

## Sécurité

- ✅ Toutes les clés secrètes sont côté serveur uniquement
- ✅ Validation des montants et références
- ✅ Chiffrement des données sensibles (selon la doc Korapay)
- ✅ Logs détaillés pour debugging
- ⚠️ Implémentez la validation de signature webhook pour la production
