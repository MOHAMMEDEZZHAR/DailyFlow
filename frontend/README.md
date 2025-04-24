# DailyFlow Frontend

## Installation & Lancement

1. Rendez-vous dans le dossier `frontend/` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173) par défaut.

## Fonctionnalités principales
- Authentification (inscription/connexion)
- Gestion des tâches (CRUD)
- Gestion des créneaux de disponibilité
- Gestion des niveaux d'énergie
- Génération et affichage du planning optimisé
- Design moderne, responsive, dark mode

## Configuration
- Le backend doit tourner sur `http://localhost:5000` (modifiable dans le fichier `src/api/axios.js`)

## Stack
- React 18 + Vite
- TailwindCSS
- Redux Toolkit (gestion auth & état global)
- Axios (requêtes API)
- react-router-dom
- react-calendar-timeline (timeline planning)
