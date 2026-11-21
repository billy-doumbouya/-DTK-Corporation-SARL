# DTK Corporation SARL — Site web institutionnel

Site web vitrine + back-office CMS pour DTK Corporation SARL, entreprise guinéenne pluridisciplinaire (BTP, agro-alimentaire, formation, élevage, froid, sous-traitance générale).

**Slogan** : *Professionnalisme, Qualité, Satisfaction*

---

## 1. Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js (App Router) | 16 | Framework fullstack |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 4 | Styles |
| shadcn/ui | New York | Composants UI |
| Prisma ORM | 6 | PostgreSQL (Neon en production) |
| Framer Motion | 12 | Animations au scroll |
| react-icons | 5 | Icônes |
| Google AI Studio | Gemini | Chatbot LLM (RAG) |
| zod | 4 | Validation client + serveur |
| Sonner | 2 | Notifications toast |

---

## 2. Installation

```bash
# 1. Installer les dépendances
bun install

# 2. Configurer PostgreSQL et l'environnement
copy .env.example .env
# Renseignez DATABASE_URL, ADMIN_SEED_EMAIL et ADMIN_SEED_PASSWORD

# 3. Appliquer le schéma et initialiser les données de développement
bun run db:migrate
bun run db:seed

# 4. Démarrer
bun run dev
```

Le site est sur `http://localhost:3000`.

---

## 3. Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL PostgreSQL; URL poolée Neon pour l'application en production | — |
| `ADMIN_SEED_EMAIL` | Email admin initial, requis au seed | — |
| `ADMIN_SEED_PASSWORD` | Mot de passe admin initial, requis au seed | — |
| `NEXT_PUBLIC_SITE_URL` | URL du site | `http://localhost:3000` |
| `MAIL_DRIVER` | `console` (dev) ou `smtp` (prod) | `console` |
| `MAIL_USER` / `MAIL_APP_PASSWORD` | Identifiants SMTP | — |
| `MAIL_SMTP_HOST` / `MAIL_SMTP_PORT` | Serveur et port SMTP | `smtp.gmail.com` / `465` |
| `ADMIN_NOTIFY_EMAIL` | Adresse qui reçoit les demandes | — |
| `BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN` | Token Vercel Blob (prod) | — |
| `GOOGLE_AI_API_KEY` | Clé serveur Google AI Studio | — |
| `CHATBOT_MODELS` | Modèles Gemini de secours | — |

---

## 4. Compte administrateur

Définissez `ADMIN_SEED_EMAIL` et un mot de passe unique avant le premier seed.
Aucun mot de passe administrateur par défaut n'est créé ou affiché. L'accès se
fait via `Ctrl+Shift+L` ou l'URL `/auth`.

Le compte se verrouille après 10 tentatives échouées pendant 5 minutes.

---

## 5. Structure du projet

```
prisma/
  schema.prisma        # 20+ modèles (User, Service, Product, Formation, etc.)
  seed.ts              # Seed honnête (faits connus uniquement)

src/
  app/
    (public)/          # 15 pages publiques
    auth/              # Page de connexion (noindex)
    dashboard/         # 19 modules admin (protégés par middleware)
    api/               # 38 routes API (toutes avec try/catch)
  components/
    site/              # Header, Footer, Slider, Chatbot, Reveal, Decor
    dashboard/         # Shell, ResourceManager, Forms, DataTable
    ui/                # shadcn/ui (60+ composants)
  lib/
    auth.ts            # Session, RBAC, lockout
    db.ts              # Prisma client
    password.ts        # Hashing scrypt
    storage.ts         # Stockage images (local / Vercel Blob)
    mailer.ts          # Email (console / SMTP)
    validators.ts      # Schémas Zod partagés
    settings.ts        # SiteSettings + revalidation ISR
    revalidate.ts      # Revalidation ciblée
    audit.ts           # Journal d'audit
    icon.tsx           # 90+ icônes react-icons
    rate-limit.ts      # Anti-spam
    api-wrap.ts        # Wrapper try/catch API
  proxy.ts             # Protection /dashboard/* and same-origin mutations

public/
  dtk-logo.png         # Logo officiel
  dtk-favicon.svg      # Favicon
  images/              # Images optimisées WebP
  uploads/             # Uploads locaux (dev)
```

---

## 6. Modules du dashboard

| Module | Route | Description |
|--------|-------|-------------|
| Accueil | `/dashboard` | Compteurs + dernières demandes |
| Demandes | `/dashboard/requests` | Liste filtrable + détail + statut + notes + export CSV |
| Services | `/dashboard/services` | CRUD 6 services |
| Produits | `/dashboard/products` | CRUD produits agro/élevage |
| Formations | `/dashboard/formations` | CRUD formations (BTP, Froid, Agro, Bureautique, Numérique) |
| Réalisations | `/dashboard/realisations` | CRUD portfolio |
| Actualités | `/dashboard/news` | CRUD blog |
| Slider | `/dashboard/slides` | CRUD diapos accueil |
| Partenaires | `/dashboard/partners` | CRUD partenaires |
| Engagements | `/dashboard/engagements` | CRUD QHSSE |
| Chiffres | `/dashboard/stats` | CRUD statistiques |
| Sous-traitance | `/dashboard/subcontracting` | Page singleton (intro, capacité, assurances, cadre juridique) |
| Crédentials | `/dashboard/credentials` | CRUD crédentials (juridique, assurance, financier, certification) |
| Références | `/dashboard/references` | CRUD missions de sous-traitance |
| FAQ | `/dashboard/faq` | CRUD questions/réponses |
| Chatbot | `/dashboard/chatbot` | Config modèles + réindexation RAG |
| Médias | `/dashboard/media` | Upload images (drag & drop) |
| Paramètres | `/dashboard/settings` | Coordonnées, réseaux, SEO, légal |
| Journal d'audit | `/dashboard/audit` | Toutes les actions sensibles |
| Mon compte | `/dashboard/account` | Changement mot de passe |

---

## 7. API routes (38 routes, toutes avec try/catch)

### Publiques
- `POST /api/requests` — Formulaire de demande (5 types, anti-spam, email)
- `POST /api/chatbot` — Chatbot RAG (Google AI Studio/Gemini)
- `POST /api/auth/login` — Connexion
- `POST /api/auth/logout` — Déconnexion
- `GET /api/auth/me` — Statut session
- `POST /api/auth/change-password` — Changement mot de passe
- `POST /api/upload` — Upload image

### Admin (protégées par auth)
- `/api/admin/services` — CRUD services
- `/api/admin/products` — CRUD produits
- `/api/admin/formations` — CRUD formations
- `/api/admin/realisations` — CRUD réalisations
- `/api/admin/news` — CRUD actualités
- `/api/admin/slides` — CRUD slides
- `/api/admin/partners` — CRUD partenaires
- `/api/admin/engagements` — CRUD engagements
- `/api/admin/stats` — CRUD chiffres
- `/api/admin/faq` — CRUD FAQ
- `/api/admin/chatbot` — Config + réindexation
- `/api/admin/media` — Liste + suppression
- `/api/admin/settings` — Lecture + modification
- `/api/admin/subcontracting` — Page singleton
- `/api/admin/credentials` — CRUD crédentials
- `/api/admin/references` — CRUD références
- `/api/admin/audit` — Lecture journal
- `/api/requests/[id]` — Statut + notes + suppression
- `/api/requests/export` — Export CSV

---

## 8. Sécurité

| Mécanisme | Détail |
|-----------|--------|
| Hashing mot de passe | scrypt (Node crypto, pas de dépendance externe) |
| Cookie session | `httpOnly`, `Secure`, `SameSite` |
| Verrouillage | 10 tentatives → 5 min de lock |
| RBAC | Tables Role/Permission/UserRole + helper `can()` |
| Middleware | Protection `/dashboard/*` |
| Validation | Zod côté client + serveur (schémas partagés) |
| Anti-spam | Honeypot + rate limiting (5 demandes/heure, 15 msg chatbot/min) |
| En-têtes | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Journal d'audit | Toutes les actions sensibles (25 types d'actions) |
| Error boundaries | `global-error.tsx` + `error.tsx` + `dashboard/error.tsx` |
| API | 100% des routes avec try/catch ou `apiHandler()` |

---

## 9. Fonctionnalités clés

### Chatbot RAG
- Assistante virtuelle "Aïcha" avec avatar SVG animé (yeux qui clignent)
- RAG par similarité de mots-clés (table `ChatbotKnowledge`)
- Appels Google AI Studio/Gemini côté serveur; configurer `GOOGLE_AI_API_KEY`
- Prompt système strictement borné à DTK Corporation
- 5 questions fréquentes en boutons cliquables
- Fallback sur FAQ en cas d'échec du modèle
- Rate limiting 15 msg/min/IP (en mémoire; à remplacer par un stockage partagé avant un déploiement multi-instance)

### Formulaire de demande dynamique
- 5 types : Devis, Contact, Formation, Sous-traitance, Renseignements
- Champs adaptatifs selon le type
- Validation Zod partagée client/serveur
- Anti-spam : honeypot + rate limiting
- Email notification admin + confirmation visiteur
- Statuts : nouveau → en_cours → traité → archivé
- Notes internes + export CSV

### Page sous-traitance (institutionnelle)
- Crédentials & conformité (8 cartes par catégorie)
- Capacité opérationnelle + assurances + cadre juridique
- Références de missions (avec statut Livré/En cours)
- Process steps (Analyse → Planification → Exécution → Livraison)
- Tout administrable depuis le dashboard

### Design
- Navbar deux niveaux (barre utilitaire navy + barre principale blanche)
- Barre utilitaire qui se cache au scroll
- Barre sociale verticale (apparaît au scroll)
- Widget WhatsApp flottant
- Animations au scroll (Framer Motion `whileInView`)
- Empty states professionnels
- Images de fond sur toutes les pages
- Footer premium avec wave divider + watermark

---

## 10. Déploiement (Vercel + Neon)

> `prisma/db/custom.db` contient l'ancienne base SQLite locale et reste suivie
> par Git. Elle n'est pas migrée ni supprimée; ne publiez pas ses modifications.
> La production démarre avec une base PostgreSQL neuve et le seed.

1. Poussez le code sur GitHub
2. Importez sur [Vercel](https://vercel.com)
3. Variables d'environnement (voir `.env.example`)
4. Créez un projet PostgreSQL sur [Neon](https://neon.tech)
5. Configurez `DATABASE_URL` dans Vercel avec l'URL poolée Neon (`-pooler`) et `sslmode=require`
6. Depuis un environnement sécurisé, appliquez les migrations avec une URL directe Neon : `bun run db:migrate:deploy`
7. Initialisez la base neuve avec `bun run db:seed` après avoir défini les identifiants admin
8. Activez Vercel Blob → `BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN`
9. Configurez les variables SMTP pour les emails

### Initialisation PostgreSQL

Les migrations versionnées dans `prisma/migrations` sont la source de vérité.
Utilisez `db:push` uniquement en développement; en production, appliquez les
migrations avec `bun run db:migrate:deploy` et l'URL directe de la base.

---

## 11. Maintenance depuis VSCode

```bash
bun run dev        # Serveur dev (port 3000)
bun run lint       # ESLint
bun run db:migrate # Migration locale/dev
bun run db:seed    # Seed
bun run db:migrate:deploy # Appliquer les migrations en production
bun run db:reset   # Destructif : réservé au développement local
```

### Ajouter une icône
Ajoutez-la dans `src/lib/icon.tsx` (map `ICON_MAP`).

### Modifier les couleurs
Variables CSS dans `src/app/globals.css` (`--dtk-cyan`, `--dtk-navy`).

### Changer le logo
Remplacez `/public/dtk-logo.png`.

---

## 12. Support technique

### Le site ne démarre pas
1. Vérifiez `bun install` → dépendances installées
2. Vérifiez que `DATABASE_URL` pointe vers un serveur PostgreSQL joignable
3. En production, utilisez l'URL poolée pour l'application et l'URL directe pour appliquer les migrations

### Compte admin verrouillé

Remplacez `VOTRE_EMAIL_ADMIN` par l'adresse définie dans `ADMIN_SEED_EMAIL`.

```bash
node -e "const{PrismaClient}=require('@prisma/client');const db=new PrismaClient();(async()=>{await db.user.update({where:{email:'VOTRE_EMAIL_ADMIN'},data:{failedAttempts:0,lockedUntil:null}});console.log('unlocked')})().finally(()=>db.\$disconnect())"
```

### Images ne s'affichent pas
- Vérifiez `/public/images/` contient les fichiers WebP
- Vérifiez `next.config.ts` → `remotePatterns` pour les URLs externes

### Chatbot ne répond pas
- Vérifiez que `GOOGLE_AI_API_KEY` est configurée côté serveur
- Vérifiez `/api/chatbot` → POST renvoie JSON
- Vérifiez `ChatbotKnowledge` → `bun run db:seed` ou réindexez depuis `/dashboard/chatbot`

### Emails non envoyés (dev)
- En dev (`MAIL_DRIVER=console`), les emails s'affichent dans le terminal
- En prod, configurez `MAIL_DRIVER=smtp`, `MAIL_USER` et `MAIL_APP_PASSWORD`

---

## 13. Critères de qualité

| Critère | Statut |
|---------|--------|
| Lint | 0 erreur, 0 warning |
| API try/catch | 38/38 routes (100%) |
| Code mort | Aucun (audité) |
| Error boundaries | global-error + error + dashboard/error + not-found |
| E2E automatisés | Non présents dans `tests/`; parcours manuels avant mise en production requis |
| Audit log | 25 types d'actions journalisées |
| Validation | Zod client + serveur (schémas partagés) |
| RBAC | Préparé (Role/Permission/UserRole) |
| SEO | sitemap.xml + robots.ts + JSON-LD + metadata par page |
| Accessibilité | ARIA, prefers-reduced-motion, focus-visible |

---

## Licence

Code propriétaire — DTK Corporation SARL.
Images : Unsplash + images fournies par l'entreprise.
