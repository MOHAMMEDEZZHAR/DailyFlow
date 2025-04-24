# DailyFlow Backend

## Installation

1. Copier `.env.example` en `.env` et remplir les informations.
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur :
   ```bash
   npm run dev
   ```

## Structure
- `app.js` : Point d'entrée principal
- `config/db.js` : Connexion MySQL
- `routes/` : Définition des routes API
- `controllers/` : Logique métier
- `models/` : Requêtes SQL
- `middlewares/` : Authentification, gestion erreurs
- `services/` : Génération du planning
- `utils/` : Fonctions utilitaires (JWT, etc.)

## Démarrage rapide
- Importer le fichier SQL fourni dans phpMyAdmin
- Lancer le backend
- Consommer les endpoints depuis le frontend React
