# 🔌 API Documentation - Zyra

## 💳 Endpoints de Paiement

### POST /api/korapay/charge-card
Initie un paiement par carte bancaire.

**Body:**
```json
{
  "reference": "ZYRA-1234567890-ABC123",
  "card": {
    "name": "John Doe",
    "number": "5130000052131820",
    "cvv": "419",
    "expiry_month": "12",
    "expiry_year": "32",
    "pin": "0000"
  },
  "amount": 50000,
  "currency": "NGN",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "userId": "user123",
    "packageId": "pkg456",
    "billingPeriod": "monthly"
  }
}
```

**Réponse Succès:**
```json
{
  "status": true,
  "message": "Payment successful",
  "data": {
    "status": "success",
    "amount": 50000,
    "transaction_reference": "TXN_123456789",
    "payment_reference": "PAY_987654321"
  }
}
```

**Réponse Autorisation Requise:**
```json
{
  "status": true,
  "message": "OTP required",
  "data": {
    "status": "pending",
    "auth_model": "OTP",
    "transaction_reference": "TXN_123456789",
    "response_message": "Enter OTP sent to your phone"
  }
}
```

### POST /api/korapay/charge-mobile
Initie un paiement Mobile Money.

**Body:**
```json
{
  "amount": 50000,
  "currency": "XOF",
  "reference": "ZYRA-1234567890-ABC123",
  "description": "Abonnement Premium - monthly",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "mobile_money": {
    "number": "+2250123456789"
  },
  "merchant_bears_cost": true,
  "metadata": {
    "userId": "user123",
    "packageId": "pkg456"
  }
}
```

**Réponse Processing:**
```json
{
  "status": true,
  "message": "Payment initiated",
  "data": {
    "status": "processing",
    "message": "USSD code: *144*1*2*123456789#",
    "transaction_reference": "TXN_123456789"
  }
}
```

### POST /api/korapay/authorize
Autorise un paiement par carte (OTP/PIN).

**Body:**
```json
{
  "transaction_reference": "TXN_123456789",
  "authorization": {
    "otp": "123456"
    // OU
    "pin": "0000"
  }
}
```

### GET /api/korapay/verify/{reference}
Vérifie le statut d'une transaction.

**Paramètres:**
- `reference`: Référence de la transaction

**Réponse:**
```json
{
  "status": true,
  "message": "Transaction details",
  "data": {
    "status": "success",
    "amount": 50000,
    "currency": "NGN",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "metadata": {
      "userId": "user123"
    }
  }
}
```

## 🔗 Webhooks

### POST /api/webhooks/korapay
Endpoint pour recevoir les notifications de Korapay.

**Headers requis:**
```
Content-Type: application/json
X-Korapay-Signature: signature_hash
```

**Body exemple:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ZYRA-1234567890-ABC123",
    "amount": 50000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "metadata": {
      "userId": "user123",
      "packageId": "pkg456"
    }
  }
}
```

**Events supportés:**
- `charge.success` - Paiement réussi
- `charge.failed` - Paiement échoué
- `charge.processing` - Paiement en cours

## 👥 Endpoints de Gestion

### GET /api/hairdressers
Récupère la liste des coiffeurs.

**Query Parameters:**
- `salonId`: ID du salon
- `limit`: Nombre d'éléments (défaut: 10)
- `offset`: Décalage pour pagination

### POST /api/hairdressers
Crée un nouveau coiffeur.

**Body:**
```json
{
  "name": "Marie Dubois",
  "email": "marie@salon.com",
  "phone": "+225123456789",
  "specialities": ["Coupe", "Coloration"],
  "salonId": "salon123",
  "experience": 5
}
```

### PUT /api/hairdressers/{id}
Met à jour un coiffeur.

### DELETE /api/hairdressers/{id}
Supprime un coiffeur.

## 🏪 Endpoints Salon

### GET /api/salons
Récupère la liste des salons.

### POST /api/salons
Crée un nouveau salon.

**Body:**
```json
{
  "name": "Salon Belle Époque",
  "address": {
    "street": "123 Avenue de la Paix",
    "city": "Abidjan",
    "country": "Côte d'Ivoire",
    "postalCode": "00225"
  },
  "contact": {
    "phone": "+225123456789",
    "email": "contact@belleepoque.ci"
  },
  "hours": {
    "monday": {"open": "08:00", "close": "18:00"},
    "tuesday": {"open": "08:00", "close": "18:00"}
  },
  "services": ["Coupe", "Shampoing", "Coloration"],
  "ownerId": "owner123"
}
```

## 💼 Endpoints Packages

### GET /api/packages
Récupère la liste des forfaits.

**Query Parameters:**
- `salonId`: Filtrer par salon
- `active`: true/false pour les forfaits actifs

### POST /api/packages
Crée un nouveau forfait.

**Body:**
```json
{
  "name": "Package Premium",
  "description": "Forfait complet avec services premium",
  "price": 50000,
  "currency": "XOF",
  "duration": "monthly",
  "features": [
    "Coupe illimitée",
    "Shampoing inclus",
    "Styling gratuit"
  ],
  "salonId": "salon123",
  "isActive": true
}
```

## 📊 Endpoints Analytics

### GET /api/analytics/dashboard
Récupère les données du tableau de bord.

**Réponse:**
```json
{
  "totalRevenue": 1250000,
  "totalCustomers": 156,
  "totalAppointments": 89,
  "monthlyGrowth": 12.5,
  "recentTransactions": [...],
  "popularServices": [...]
}
```

### GET /api/analytics/revenue
Données de revenus par période.

**Query Parameters:**
- `period`: "day", "week", "month", "year"
- `startDate`: Date de début
- `endDate`: Date de fin

## 🔐 Authentification

### POST /api/auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/register
Inscription utilisateur.

### POST /api/auth/logout
Déconnexion utilisateur.

### GET /api/auth/me
Récupère les informations de l'utilisateur connecté.

## ⚠️ Codes d'Erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Accès interdit |
| 404 | Not Found | Ressource introuvable |
| 422 | Unprocessable Entity | Erreur de validation |
| 500 | Internal Server Error | Erreur serveur |

## 📝 Format des Réponses

### Succès
```json
{
  "status": true,
  "message": "Success message",
  "data": {...}
}
```

### Erreur
```json
{
  "status": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## 🔒 Sécurité

### Headers Requis
```
Authorization: Bearer {firebase_token}
Content-Type: application/json
```

### Rate Limiting
- 100 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur authentifié

### Validation
- Sanitisation des entrées
- Validation des types de données
- Protection CSRF
- Vérification des permissions
