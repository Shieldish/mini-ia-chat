# Mini IA Chat

Mini IA Chat est une application web de chat basée sur Node.js, Express, Sequelize (PostgreSQL) et l’API Google Gemini pour une intelligence artificielle générative.  
L’utilisateur peut créer plusieurs conversations, envoyer des messages, et obtenir des réponses générées caractère par caractère.

---

## Fonctionnalités

- Création et gestion de plusieurs conversations (chats).
- Envoi et affichage des messages utilisateur et IA.
- Contexte conversationnel maintenu via base de données PostgreSQL.
- Interface dynamique avec rechargement des messages via AJAX.
- Utilisation de l’API Google Gemini pour générer des réponses IA.
- Support EJS pour le rendu des vues côté serveur.

---

## Prérequis

- Node.js (>=18)
- PostgreSQL (ou un autre serveur compatible, configuré avec Sequelize)
- Clé API Google Gemini (à obtenir via Google Cloud)

---

## Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/ton-utilisateur/mini-ia-chat.git
cd mini-ia-chat


2. Installer les dépendances :
npm install


3. Configurer les variables d’environnement :
Créer un fichier .env à la racine et ajouter :

ini

Modifier
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=ta_clef_api_google_gemini