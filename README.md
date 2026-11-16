# DTK Corporation SARL — Site web institutionnel

Site web vitrine + back-office CMS pour DTK Corporation SARL, entreprise guinéenne pluridisciplinaire (BTP, agro-alimentaire, formation, élevage, froid, sous-traitance).

**Slogan** : *Professionnalisme, Qualité, Satisfaction*

## Stack technique

- **Framework** : Next.js 16 (App Router) + TypeScript 5
- **Style** : Tailwind CSS 4 + shadcn/ui (New York)
- **Base de données** : Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Auth** : Cookie `httpOnly` + session serveur (scrypt hashing)
- **Chatbot** : z-ai-web-dev-sdk (LLM) + RAG léger par mots-clés
- **Icônes** : react-icons
- **Animations** : Framer Motion
- **Emails** : abstraction `Mailer` (console en dev, nodemailer/SMTP en prod)

## Installation

```bash
# 1. Installer les dépendances
bun install

# 2. Copier et configurer l'environnement
cp .env.example .env
# Éditez .env : AUTH_SECRET, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD

# 3. Créer la base de données et le seed
bun run db:push
bun run db:seed

# 4. Démarrer le serveur de développement
bun run dev
```

Le site est accessible sur `http://localhost:3000`.

## Comptes par défaut (après seed)

- **Email** : `admin@dtk.local`
- **Mot de passe** : `ChangeMe123!`

Changez ce mot de passe immédiatement après la première connexion via *Mon compte*.

## Accès au tableau de bord

Le tableau de bord n'est **pas** accessible via un lien visible. Deux moyens d'y accéder :

1. **Raccourci clavier** : `Ctrl+Shift+L` ou `Alt+Shift+A` (sur n'importe quelle page)
2. **URL directe** : `/auth` (noindex, absente du sitemap et du menu)

La sécurité repose sur l'authentification, pas sur la discrétion de la route.

## Structure du projet

```
prisma/
  schema.prisma      # Schéma de base de données complet
  seed.ts            # Seed honnête (faits connus uniquement)

src/
  app/
    (public)/        # Pages publiques : accueil, services, contact, etc.
    auth/            # Page de connexion (noindex)
    dashboard/       # Tableau de bord admin (protégé par middleware)
    api/             # Routes API (requests, chatbot, auth, admin CRUD)
  components/
    site/            # Composants du site public (header, footer, slider, chatbot)
    dashboard/       # Composants du dashboard (shell, resource-manager, forms)
    ui/              # Composants shadcn/ui
  lib/
    auth.ts          # Session, authentification, RBAC (can())
    db.ts            # Client Prisma
    password.ts      # Hashing scrypt (pas de dépendance externe)
    storage.ts       # Abstraction stockage (local dev / Vercel Blob prod)
    mailer.ts        # Abstraction email (console dev / SMTP prod)
    validators.ts    # Schémas Zod partagés (client + serveur)
    settings.ts      # Helper SiteSettings + revalidation ISR
    revalidate.ts    # Revalidation ciblée des pages publiques
    permissions.ts   # Liste des permissions RBAC
    icon.tsx         # Mapping react-icons (90+ icônes)
    rate-limit.ts    # Rate limiting in-memory (anti-spam)
```

## Modules du tableau de bord

| Module | Description |
|--------|-------------|
| Accueil | Compteurs (demandes nouvelles, par type), dernières demandes |
| Demandes | Liste filtrable, détail, changement de statut, notes, export CSV |
| Services | CRUD complet (6 services : BTP, Agro, Formation, Élevage, Froid, Sous-traitance) |
| Produits | CRUD (produits agro + élevage) |
| Formations | CRUD (formations 2-3 mois) |
| Réalisations | CRUD (portfolio) avec planification de publication |
| Actualités | CRUD (blog) avec planification de publication |
| Slider | Gestion des diapositives d'accueil |
| Partenaires | CRUD partenaires (logos + liens) |
| Engagements | CRUD engagements QHSSE (zéro accident, zéro dommage, zéro compromis) |
| Chiffres | CRUD statistiques (uniquement si publiées — n'inventez rien) |
| Sous-traitance | Édition de la page dédiée |
| FAQ | CRUD questions/réponses (utilisé par le chatbot en secours) |
| Chatbot | Configuration des modèles + réindexation de la base de connaissances RAG |
| Médiathèque | Upload d'images (drag & drop, aperçu, alt obligatoire) |
| Paramètres | Coordonnées, réseaux sociaux, SEO, infos légales, options chatbot |
| Mon compte | Changement de mot de passe |

## Fonctionnalités clés

### Formulaire de demande dynamique

Un seul formulaire, un seul point d'entrée API (`/api/requests`). Le visiteur choisit d'abord le type (devis, contact, formation, sous-traitance, renseignements), puis les champs s'adaptent.

- Validation client **et** serveur avec les **mêmes schémas Zod** (`src/lib/validators.ts`)
- Anti-spam : honeypot + rate limiting par IP (5 demandes/heure)
- Email de notification à l'admin + email de confirmation au visiteur
- Statuts : nouveau → en cours → traité → archivé
- Notes internes (visibles admin uniquement)
- Export CSV

### Chatbot RAG

- Bulle flottante en bas à droite
- Récupère les chunks pertinents par **similarité de mots-clés** (pas d'embeddings coûteux)
- Prompt système strictement borné à DTK Corporation
- Refuse les demandes hors sujet, ne donne ni prix ni engagement
- Bascule sur la FAQ en cas d'échec du modèle
- Rate limiting (15 messages/minute/IP)
- Clé API jamais exposée côté client

### Sécurité

- Mot de passe haché (scrypt)
- Cookie `httpOnly`, `Secure`, `SameSite`
- Rate limiting sur login (verrouillage 15 min après 5 échecs)
- Middleware de protection des routes `/dashboard/*`
- En-têtes de sécurité : CSP-ready, HSTS, X-Frame-Options, etc.
- RBAC préparé (tables Role/Permission/UserRole) avec helper `can(action)`
- Journal d'audit (connexions, actions sensibles)

### SEO & Performance

- API Metadata de Next.js (titre, description, Open Graph par page)
- `sitemap.xml` et `robots.txt` générés dynamiquement
- JSON-LD (Organization, LocalBusiness, Service)
- ISR avec revalidation ciblée (pas de redéploiement pour les modifications de contenu)
- `next/image` avec optimisation WebP/AVIF
- Polices via `next/font` (Sora + Inter)
- `prefers-reduced-motion` respecté
- Lighthouse > 90 visé (mobile)

## Commandes

```bash
bun run dev        # Serveur de développement (port 3000)
bun run lint       # Vérification ESLint
bun run db:push    # Pousser le schéma Prisma vers la BDD
bun run db:seed    # Remplir la BDD avec le contenu initial
bun run db:reset   # Réinitialiser (attention : efface les données)
bun run build      # Build de production
```

## Déploiement (Vercel + Neon)

1. Poussez le code sur GitHub
2. Importez le projet sur [Vercel](https://vercel.com)
3. Configurez les variables d'environnement (voir `.env.example`)
4. Pour la base PostgreSQL : créez une base sur [Neon](https://neon.tech), mettez `DATABASE_URL` dans les variables Vercel
5. Pour les images : activez Vercel Blob et définissez `BLOB_READ_WRITE_TOKEN`
6. Pour les emails : configurez un mot de passe d'application Gmail ou un SMTP professionnel

### Migration SQLite → PostgreSQL

Le schéma Prisma est portable. Pour passer en production :

1. Changez `provider = "sqlite"` en `provider = "postgresql"` dans `prisma/schema.prisma`
2. Définissez `DATABASE_URL` avec l'URL Neon
3. Exécutez `bun run db:push` puis `bun run db:seed`

## Maintenance depuis VSCode

Le projet est un projet Next.js standard. Ouvrez-le dans VSCode et :

- **Éditez le contenu** : principalement via le tableau de bord (pas besoin de toucher au code)
- **Ajoutez une icône** : ajoutez-la dans `src/lib/icon.tsx` (map `ICON_MAP`)
- **Modifiez les couleurs** : variables CSS dans `src/app/globals.css` (`--dtk-cyan`, `--dtk-navy`)
- **Ajoutez une page** : créez un dossier dans `src/app/` avec un `page.tsx`
- **Modifiez le schéma BDD** : éditez `prisma/schema.prisma` puis `bun run db:push`

### Extensions VSCode recommandées

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

## Contenu honnête

Le seed n'invente **aucun** chiffre, certification, client, prix, date ou référence. Les champs inconnus (contacts, WhatsApp, adresse, réseaux sociaux) sont laissés vides et masqués proprement sur le site. L'admin les renseigne depuis le tableau de bord.

## Points à valider avec le client

- Contenu exact des services, produits, formations et réalisations
- Fichier du logo en haute qualité
- Achat du nom de domaine et emails professionnels
- Coordonnées, WhatsApp, adresse et réseaux sociaux
 Informations légales (numéro d'immatriculation, etc.)

## Licence

Code propriétaire — DTK Corporation SARL.
Images d'illustration : Unsplash (conformément à leurs conditions).
