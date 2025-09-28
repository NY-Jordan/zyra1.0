# Configuration PayPal pour Zyra

## Étapes de configuration

### 1. Créer un compte développeur PayPal
1. Allez sur [PayPal Developer](https://developer.paypal.com)
2. Connectez-vous avec votre compte PayPal ou créez-en un
3. Accédez au Dashboard

### 2. Créer une application
1. Dans le Dashboard, cliquez sur "Create App"
2. Donnez un nom à votre application (ex: "Zyra Salon")
3. Sélectionnez votre compte business
4. Sélectionnez "Default Application" comme features

### 3. Récupérer les clés API
1. Une fois l'app créée, vous verrez :
   - **Client ID** (clé publique)
   - **Client Secret** (clé privée)
2. Copiez ces clés dans votre fichier `.env.local`

### 4. Configuration des variables d'environnement
```bash
# Sandbox (développement)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret

# Production (live)
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret

NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 5. URLs importantes
- **Sandbox Dashboard**: https://developer.paypal.com/developer/applications
- **Live Dashboard**: https://developer.paypal.com/developer/applications
- **Webhook Configuration**: Configurez les webhooks pour les notifications de paiement

### 6. Test avec PayPal Sandbox
1. Utilisez les comptes de test fournis par PayPal
2. Testez les paiements avec des cartes de test
3. Vérifiez les transactions dans le Dashboard Sandbox

### 7. Passage en production
1. Changez `NODE_ENV=production`
2. Remplacez les clés sandbox par les clés live
3. Activez les webhooks de production
4. Testez avec de vrais paiements (petits montants)

## Sécurité
- ⚠️ Ne jamais exposer `PAYPAL_CLIENT_SECRET` côté client
- ✅ Toutes les opérations sensibles sont côté serveur
- ✅ Validation des montants côté serveur
- ✅ Logs des transactions pour audit

## Support
- Documentation PayPal: https://developer.paypal.com/docs/
- Support technique: PayPal Developer Community
