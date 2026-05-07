# Recipes App — Génération de recettes personnalisées & analyse nutritionnelle

**Recipes App** est une plateforme web développée avec **Next.js** permettant de concevoir un système complet de **génération, de gestion et d’analyse nutritionnelle de recettes personnalisées**.
L’application s’appuie sur **Supabase** pour la base de données, l’authentification et le stockage, et propose une expérience utilisateur centrée sur la personnalisation alimentaire et la nutrition.

Ce projet est réalisé dans un cadre pédagogique et vise à mettre en œuvre un produit web complet, de la conception UX jusqu’à la logique métier backend.

---

## Objectifs du projet

* Concevoir une application **full stack moderne**.
* Mettre en pratique la gestion de projet en binôme.
* Implémenter une logique métier réaliste autour de la nutrition et des recettes.
* Manipuler une base de données sécurisée avec **Row Level Security (RLS)**.
* Utiliser des **Server Actions** et une architecture propre avec Next.js App Router.

---

## Stack technique

* **Framework** : Next.js (App Router)
* **Langage** : TypeScript
* **UI** : Tailwind CSS
* **Backend / BDD / Auth** : Supabase
* **Stockage fichiers** : Supabase Storage
* **Architecture** : Server Actions sécurisées
* **Déploiement** : Vercel (recommandé)

---

## Fonctionnalités principales

### Authentification

* Création de compte utilisateur
* Connexion / Déconnexion
* Persistance de session via Supabase Auth

### Gestion du profil

* Définition et modification des informations personnelles
* Gestion des **intolérances alimentaires**
* Définition de l’objectif nutritionnel :

  * prise de masse
  * perte de poids
  * gain d’énergie
* Paramètres nutritionnels personnalisés

### Gestion des recettes

* Visualisation de toutes les recettes créées par l’utilisateur
* Recherche par :

  * nom
  * ingrédient
  * type de plat
* Consultation détaillée d’une recette :

  * ingrédients
  * étapes
  * analyse nutritionnelle complète :

    * calories
    * protéines
    * glucides
    * lipides
    * vitamines et minéraux

### Génération de recettes

* Création guidée d’une nouvelle recette en fonction :

  * des ingrédients disponibles
  * du nombre de personnes
  * des contraintes alimentaires
* Génération automatique du contenu et des apports nutritionnels

### Liste de courses intelligente

* Sélection de plusieurs recettes (ex. **3 plats + 2 desserts**)
* Génération automatique d’une **liste de courses consolidée**
* Regroupement par catégories (rayons)
* Ajustement automatique des quantités

---

## Installation depuis GitHub

### 1 Cloner le dépôt

```bash
git clone https://github.com/silamakanK/recipes-app.git
cd recipes-app
```

### 2 Installer les dépendances

```bash
npm install
```

### 3 Configurer les variables d’environnement

Créer un fichier `.env.local` à la racine du projet :

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 4️⃣ Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir ensuite : [http://localhost:3000](http://localhost:3000)

---

## Scripts disponibles

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Démarre le serveur en mode développement |
| `npm run build` | Génère la version de production          |
| `npm start`     | Lance le serveur de production local     |
| `npm run lint`  | Vérifie la qualité du code               |


## Sécurité & bonnes pratiques

* Row Level Security (RLS) activée sur toutes les tables sensibles
* Accès aux données limité à l’utilisateur authentifié
* Séparation stricte entre logique client et serveur
* Stockage des fichiers via Supabase Storage (URL uniquement en base)

---

## Évolutions possibles

* Partage collaboratif de la liste de courses afin de permettre à plusieurs utilisateurs (famille, colocataires, partenaires) de consulter et compléter une même liste.

* Ajout d’une page “Blog” pour proposer des articles autour de la nutrition, des conseils alimentaires, des recettes thématiques ou des bonnes pratiques culinaires.

* Amélioration de la génération de recettes par l’IA, avec la prise en compte de variantes (saisons, budget, temps de préparation, préférences culinaires).

* Ajout d’un historique nutritionnel permettant de suivre l’évolution des apports sur plusieurs jours ou semaines.

* Optimisation des performances et de l’accessibilité, en respectant les bonnes pratiques (temps de chargement, navigation clavier, contrastes, responsive design).


## Contexte pédagogique

> **Sujet du projet**
> Réaliser un système de génération et de gestion de recettes de cuisine personnalisées avec analyse nutritionnelle, en binôme, permettant à un internaute de gérer son profil, ses recettes, et d’obtenir automatiquement une liste de courses à partir de ses créations.
