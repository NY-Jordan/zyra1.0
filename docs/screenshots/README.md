# 📷 Guide des Captures d'Écran - Zyra

Ce dossier contient toutes les captures d'écran utilisées dans la documentation du projet Zyra.

## 📁 Structure des Screenshots

```
docs/screenshots/
├── dashboard.png           # Tableau de bord principal
├── hairdressers.png       # Gestion des coiffeurs
├── salon.png              # Configuration du salon
├── packages.png           # Gestion des forfaits
├── settings.png           # Paramètres système
├── payment-card.png       # Interface paiement carte
├── payment-mobile.png     # Interface paiement mobile
├── payment-otp.png        # Modal OTP
└── mobile/               # Versions mobiles
    ├── dashboard-mobile.png
    ├── hairdressers-mobile.png
    └── ...
```

## 🎯 Spécifications des Images

### Format et Qualité
- **Format** : PNG (recommandé) ou JPG
- **Résolution** : Minimum 1200px de largeur
- **Qualité** : Haute définition pour un rendu net
- **Ratio** : 16:9 ou 4:3 selon le contenu

### Dimensions Recommandées
- **Desktop** : 1440x900px ou 1920x1080px  
- **Mobile** : 375x812px (iPhone X) ou 360x640px (Android)
- **Tablet** : 768x1024px (iPad)

## 📸 Captures à Réaliser

### 🏠 Dashboard (dashboard.png)
**Écran** : `/admin/dashboard` ou `/salon/dashboard`
**Contenu à montrer** :
- Métriques principales (revenus, clients, RDV)
- Graphiques de performance
- Liste des dernières activités
- Navigation principale visible

### 👨‍💼 Gestion Coiffeurs (hairdressers.png)
**Écran** : `/admin/hairdressers`
**Contenu à montrer** :
- Liste des coiffeurs avec photos
- Bouton "Ajouter coiffeur"
- Informations de chaque coiffeur (nom, spécialités, statut)
- Actions (modifier, supprimer)

### 🏪 Gestion Salon (salon.png)
**Écran** : `/salon/settings` ou `/admin/salon`
**Contenu à montrer** :
- Formulaire d'information du salon
- Section localisation/adresse
- Configuration des horaires
- Galerie photos du salon

### 💼 Gestion Packages (packages.png)
**Écran** : `/salon/packages` ou `/admin/packages`
**Contenu à montrer** :
- Cards des différents forfaits
- Tarifs et descriptions
- Bouton création de package
- Statut actif/inactif

### ⚙️ Paramètres (settings.png)
**Écran** : `/admin/settings` ou `/salon/settings`
**Contenu à montrer** :
- Menu de navigation des paramètres
- Section configuration générale
- Préférences utilisateur
- Options de notification

### 💳 Paiement Carte (payment-card.png)
**Écran** : Modal de paiement par carte
**Contenu à montrer** :
- Formulaire de carte bancaire
- Champs : nom, numéro, CVV, expiration
- Bouton de paiement
- Informations de sécurité

### 📱 Paiement Mobile (payment-mobile.png)
**Écran** : Modal de paiement mobile money
**Contenu à montrer** :
- Champ numéro de téléphone
- Instructions d'utilisation
- Bouton de paiement
- Logos des opérateurs supportés

### 📲 Modal OTP (payment-otp.png)
**Écran** : Modal d'autorisation OTP
**Contenu à montrer** :
- Champ de saisie OTP
- Compte à rebours
- Bouton "Renvoyer OTP"
- Message d'instruction

## 🎨 Conseils pour de Belles Captures

### Préparation
1. **Données de démonstration** : Utilisez des données réalistes mais fictives
2. **Navigation propre** : Fermez les onglets inutiles
3. **Zoom optimal** : 100% ou 125% selon la résolution
4. **Theme cohérent** : Mode clair recommandé pour la lisibilité

### Composition
- **Centrer le contenu** principal dans l'image
- **Inclure la navigation** pour le contexte
- **Éviter le contenu vide** - montrer des données exemple
- **Masquer les informations sensibles** (vraies données utilisateur)

### Éclairage et Contraste
- Utiliser un fond neutre si capture partielle
- S'assurer que tous les textes sont lisibles
- Vérifier le contraste des couleurs

## 🛠️ Outils Recommandés

### Capture d'Écran
- **macOS** : Cmd+Shift+4 (sélection) ou Cmd+Shift+3 (plein écran)
- **Windows** : Win+Shift+S ou Outil Capture d'écran
- **Linux** : gnome-screenshot ou Spectacle
- **Extensions** : Awesome Screenshot, Lightshot

### Édition
- **Figma** : Pour annoter et redimensionner
- **GIMP** : Éditeur gratuit complet
- **Photoshop** : Professionnel
- **Preview** (macOS) : Édition simple

### Optimisation
- **TinyPNG** : Compression PNG sans perte
- **ImageOptim** : Optimisation batch (macOS)
- **Squoosh** : Outil web de Google

## 📋 Checklist de Validation

Avant de valider une capture d'écran :

- [ ] Résolution suffisante (min 1200px largeur)
- [ ] Contenu représentatif et complet
- [ ] Textes lisibles et nets
- [ ] Pas d'informations sensibles visibles
- [ ] Navigation/contexte visible
- [ ] Format correct (PNG recommandé)
- [ ] Nom de fichier descriptif
- [ ] Taille de fichier raisonnable (<500KB)

## 🔄 Mise à Jour

Les captures doivent être mises à jour lorsque :
- L'interface utilisateur change significativement
- De nouvelles fonctionnalités sont ajoutées
- Le design système évolue
- Les retours utilisateurs indiquent une confusion

## 📞 Contact

Pour toute question sur les captures d'écran ou besoin d'aide :
- Créer une issue GitHub avec le tag `documentation`
- Contacter l'équipe design
- Consulter le guide de style UI

---
*Dernière mise à jour : Septembre 2025*
