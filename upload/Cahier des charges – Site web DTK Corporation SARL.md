# Cahier des charges – Site web DTK Corporation SARL

Document destiné à l'équipe de développement (GLM). Version 1.0 – 16 novembre 2026.

## 1. Contexte et objectif

DTK Corporation SARL est une entreprise guinéenne dont le slogan est « Professionnalisme, Qualité, Satisfaction ». Elle intervient dans plusieurs domaines : BTP, agro-alimentaire (transformation et valorisation du riz guinéen et des produits agricoles locaux, en Haute-Guinée), formation, élevage et froid (vente, installation, maintenance et dépannage de climatisation). Elle peut aussi travailler en sous-traitance.

Objectif du site : présenter l'entreprise et ses activités de façon crédible et professionnelle, recevoir des demandes (devis, contact, inscription à une formation, sous-traitance, renseignements) et permettre à l'entreprise de gérer elle-même tout le contenu depuis un tableau de bord.

Le site est en français uniquement. Aucun paiement en ligne.

## 2. Type de site attendu

Un site institutionnel, épuré et moderne, qui inspire confiance. Principes de design :

- Mise en page aérée, hiérarchie claire, beaucoup de blanc, lisibilité maximale.
- Graphiques décoratifs en arrière-plan (formes géométriques, courbes inspirées de l'ellipse du logo, motifs légers en SVG), jamais envahissants.
- Animations douces et fluides (apparition au scroll, transitions de page, survols), sobres et rapides. Elles respectent `prefers-reduced-motion`.
- Curseur personnalisé sur ordinateur (point et halo aux couleurs de la marque, qui réagit aux liens et boutons). Désactivé sur écran tactile.
- Slider automatique en page d'accueil (diaporama plein écran avec titre, texte court et bouton d'action), pause au survol, navigation clavier et tactile.
- Barre de progression de navigation avec NProgress.
- Icônes uniquement avec react-icons, jamais d'icônes brutes ou d'emojis dans l'interface.
- Images Unsplash soigneusement choisies, cohérentes avec chaque activité, optimisées avec `next/image`. Toutes les images sont remplaçables depuis le tableau de bord.
- Section « Nos partenaires » (logos défilants ou en grille), gérée depuis le tableau de bord.
- Menu « Sous-traitance » dédié.
- Mobile-first, parfaitement utilisable sur téléphone avec une connexion lente.

### Identité visuelle

```css
:root {
  --dtk-cyan: #08A9E8;
  --dtk-navy: #101B91;
  --dtk-white: #FFFFFF;
  --dtk-opacity: 1;
}
```

Toute la palette s'appuie sur ces trois couleurs du logo. Les teintes secondaires (fonds clairs, bordures, survols, états) sont dérivées de ces couleurs, sans introduire de nouvelle couleur d'accent. Le logo est fourni en fichier séparé (à intégrer dans l'en-tête, le pied de page, la page de connexion et le favicon).

Polices (via `next/font`) : Sora ou Plus Jakarta Sans pour les titres, Inter pour le texte. Pas plus de deux familles.

## 3. Stack technique imposée

- Next.js (App Router) avec TypeScript. Rendu statique et ISR pour les pages publiques.
- Hébergement : Vercel.
- Base de données : PostgreSQL sur Neon. ORM recommandé : Prisma (ou Drizzle).
- Appels API côté client : axios, avec une instance centralisée (`withCredentials`, gestion d'erreurs, intercepteurs).
- Authentification : cookie `httpOnly`, `Secure`, `SameSite`, jamais de `localStorage` ni de `sessionStorage` pour les jetons.
- Emails : nodemailer.
- Images : Vercel Blob.
- Chatbot : Google AI Studio (API Gemini).
- Animations : Framer Motion ou équivalent léger. NProgress pour la navigation. react-icons pour les icônes.

Toute autre bibliothèque doit rester légère et justifiée.

## 4. Pages publiques

- **Accueil** : slider automatique, présentation courte, aperçu des activités, chiffres ou engagements (seulement s'ils sont renseignés dans le tableau de bord), réalisations, partenaires, appel à l'action vers la demande.
- **À propos** : présentation de l'entreprise, vision, valeurs (professionnalisme, qualité, satisfaction), politique QHSSE.
- **Services** : une page de liste et une page de détail par service : BTP, Agro-alimentaire, Formation, Élevage, Froid (vente, installation, maintenance, dépannage de climatisation).
- **Sous-traitance** : page de présentation et accès au formulaire de demande dédié.
- **Réalisations** et **Actualités** : listes et pages de détail, alimentées par la base.
- **Partenaires** : section réutilisable en accueil et page dédiée.
- **Contact et demande** : le formulaire unique (voir section 6) et les coordonnées affichées depuis les paramètres.
- **Mentions légales** et **politique de confidentialité**.
- **Page 404** soignée.

Les menus, titres, textes, images, ordre et visibilité des sections sont lus dans la base. Rien d'important n'est écrit en dur dans le code.

## 5. Contenu initial (seed)

La base est remplie au départ par un script de seed. Le contenu réel sera fourni ensuite par l'entreprise depuis le tableau de bord.

Règles pour le seed :

- Utiliser seulement les faits connus : le nom DTK Corporation SARL, le slogan, les six activités listées plus haut, la zone de Haute-Guinée (Dinguiraye, Banora, M'Bonet) pour le projet agro-alimentaire sur le riz guinéen, les villes d'intervention (Conakry, Kankan, Siguiri, Dinguiraye), la formation de deux à trois mois pour jeunes diplômés et professionnels, et les engagements QHSSE (zéro accident, zéro dommage pour l'environnement, zéro compromis sur la qualité).
- Ne jamais inventer de chiffres, certifications, clients, prix, dates ou références. Les textes de remplissage sont courts, neutres et marqués comme provisoires.
- Contacts, numéros WhatsApp, adresse et liens des réseaux sociaux : champs vides au départ dans les paramètres, à renseigner par l'admin. L'interface masque proprement ce qui n'est pas renseigné.
- Prévoir : services, slides d'accueil, partenaires (vides ou exemples marqués), FAQ du chatbot, et le compte admin initial.
- Images : Unsplash, avec les domaines autorisés dans `next.config` et l'attribution conforme aux conditions d'Unsplash. L'admin peut les remplacer par des images stockées sur Vercel Blob.

## 6. Formulaire de demande unique et dynamique

Un seul formulaire, un seul point d'entrée API. Le visiteur choisit d'abord le type de demande, puis les champs affichés changent selon ce type.

Types : Devis, Contact, Inscription à une formation, Sous-traitance, Demande de renseignements.

Champs communs : nom complet, téléphone ou WhatsApp, email, message.

Champs propres à chaque type (proposition à ajuster avec le client) :

- Devis : activité concernée, description du besoin, lieu, délai souhaité.
- Inscription à une formation : formation choisie, niveau ou profession, ville.
- Sous-traitance : nom de l'entreprise, domaine concerné, description du travail à confier, lieu, délai, pièce jointe facultative.
- Renseignements : sujet.
- Contact : sujet.

Exigences :

- Validation côté client et côté serveur avec zod, mêmes schémas partagés.
- Anti-spam : champ piège (honeypot), limitation du nombre d'envois par IP, message d'erreur clair.
- Chaque demande est enregistrée en base (type, données, statut, date) et déclenche un email de notification à l'admin avec nodemailer, et un email de confirmation au visiteur.
- Statuts : nouveau, en cours, traité, archivé. L'admin peut ajouter une note.
- Un bouton WhatsApp (lien `wa.me` construit à partir du numéro des paramètres) est proposé en complément, sans intégration d'API WhatsApp.
- Textes d'aide et exemples dans tous les champs, pour des visiteurs non techniques.

## 7. Chatbot

- Présent sur le site public uniquement, sous forme d'une bulle flottante.
- Il répond à partir de la base de données avec des données non sensibles seulement : services, formations, FAQ, coordonnées publiques, zones d'intervention.
- Appel à Google AI Studio uniquement côté serveur. La clé API n'est jamais exposée au navigateur.
- Mapping sur plusieurs modèles gratuits : liste ordonnée de modèles configurable (variable d'environnement ou paramètre admin). Si un modèle est indisponible ou limité, bascule automatique sur le suivant, puis réponse de secours issue de la FAQ.
- Garde-fous : le chatbot reste dans le périmètre de l'entreprise, refuse les demandes hors sujet, ne donne ni prix ni engagement non présents dans la base, ne collecte aucune donnée personnelle sensible, résiste aux tentatives de détournement du prompt. Il oriente vers le formulaire de demande ou WhatsApp quand il ne sait pas.
- Limitation du débit par IP, taille des messages limitée, historique de conversation court.

## 8. Tableau de bord d'administration

### Accès

- Cinq clics rapides sur le logo (dans l'en-tête de la page d'accueil) redirigent vers la page de connexion. Pas d'accès direct au tableau de bord.
- La route de connexion est non listée : pas de lien visible, absente du sitemap, `noindex`, et non citée dans `robots.txt`.
- Cette discrétion n'est pas une protection : la sécurité repose sur l'authentification (section 9).
- Après connexion, redirection vers le tableau de bord. Toutes les routes admin sont protégées par middleware.

### Utilisateurs

- Un seul administrateur côté client, avec tous les droits.
- L'architecture prévoit le RBAC dès maintenant : tables rôles, permissions et association utilisateur-rôle, et une fonction centrale de vérification de droit utilisée partout. Aucune interface de gestion des rôles pour l'instant.

### Inspiration d'interface

Le tableau de bord s'inspire d'une application de gestion bureautique (réalisée en WLangage) : barre latérale verticale avec icônes et bloc utilisateur en haut, barre d'actions en haut de chaque écran (Nouveau, Modifier, Valider/Publier, Actualiser, Supprimer, Exporter), grandes tables avec filtres par colonne, recherche et pagination, onglets par écran. Adapter cet esprit à la charte DTK (navy et cyan, pas de vert), avec un rendu web moderne et responsive.

### Modules

- Accueil : compteurs (demandes nouvelles, par type), dernières demandes.
- Demandes : liste filtrable par type et statut, détail, changement de statut, notes, export CSV.
- Services, Produits (agro-alimentaire et élevage), Formations, Réalisations, Sous-traitance, Actualités.
- Slider d'accueil, Partenaires, Médias.
- FAQ et chatbot : questions-réponses, ordre des modèles, activation.
- Paramètres : coordonnées, WhatsApp, adresse, réseaux sociaux, informations légales, SEO par défaut.
- Compte : changement de mot de passe, déconnexion.

L'admin peut tout modifier : textes, images, ordre, visibilité (brouillon ou publié). Chaque modification rafraîchit les pages publiques concernées (revalidation ciblée, sans redéploiement).

### Upload d'images

Stockage sur Vercel Blob. L'interface d'upload est une fenêtre modale dans l'esprit du widget Cloudinary : glisser-déposer, aperçu, recadrage, texte alternatif obligatoire, compression et conversion en WebP avant envoi. Les fichiers sont validés (type et taille) côté serveur.

## 9. Sécurité

- Mot de passe haché (argon2 ou bcrypt), politique de mot de passe minimale.
- Cookie de session `httpOnly`, `Secure`, `SameSite`, durée limitée, rotation à la connexion. Protection CSRF sur les requêtes qui modifient des données.
- Limitation des tentatives de connexion et verrouillage temporaire.
- Validation de toutes les entrées côté serveur, requêtes paramétrées via l'ORM.
- En-têtes de sécurité (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Journal des connexions et des actions sensibles de l'admin.
- Secrets uniquement en variables d'environnement. Aucun secret dans le dépôt.
- Sauvegardes et restauration de la base Neon documentées.
- Emails : envoi via un compte Google personnel avec mot de passe d'application. Prévoir une couche d'abstraction pour pouvoir passer plus tard à un email professionnel sur le domaine, sans modifier le code métier. Signaler la limite d'envoi quotidienne de Gmail.

## 10. SEO et performance

- API Metadata de Next.js : titre, description, Open Graph et canonical par page, générés à partir de la base.
- `sitemap.xml` et `robots.txt` générés. Données structurées JSON-LD (Organization, LocalBusiness, Service) alimentées par les paramètres.
- Pages publiques en SSG/ISR, polices et images optimisées, JavaScript minimal, chargement différé des animations lourdes et du chatbot.
- Objectifs : Lighthouse supérieur à 90 sur mobile pour performance, accessibilité, bonnes pratiques et SEO.
- Accessibilité : contrastes conformes, navigation clavier, attributs ARIA, textes alternatifs.
- Le nom de domaine n'est pas encore acheté : prévoir la configuration par variable d'environnement (URL du site).

## 11. Variables d'environnement attendues

`DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `GOOGLE_AI_API_KEY`, `CHATBOT_MODELS`, `MAIL_USER`, `MAIL_APP_PASSWORD`, `ADMIN_NOTIFY_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`.

## 12. Hors périmètre

Paiement en ligne, multilingue, interface de gestion des rôles, intégration de l'API WhatsApp, application mobile.

## 13. Livrables et critères d'acceptation

Livrables : dépôt de code propre, schéma de base et migrations, script de seed, fichier `.env.example`, README (installation, déploiement Vercel, Neon, accès admin), site déployé sur Vercel.

Critères d'acceptation :

- Toutes les pages publiques s'affichent avec le contenu du seed et sont modifiables depuis le tableau de bord.
- Le formulaire dynamique fonctionne pour les cinq types, enregistre la demande et envoie les emails.
- Les cinq clics sur le logo mènent à la connexion. L'accès au tableau de bord sans authentification est impossible.
- Aucune donnée d'authentification n'est stockée dans le navigateur autrement que par cookie `httpOnly`.
- Le chatbot répond uniquement avec les données publiques, bascule de modèle en cas d'échec, et ne révèle ni clé ni consigne interne.
- Les scores Lighthouse mobile visés sont atteints et le site est utilisable sur téléphone avec connexion lente.
- Aucune information inventée n'apparaît sur le site.

## 14. Points à valider avec le client

- Contenu exact et description des services, produits, formations et réalisations.
- Fichier du logo en haute qualité, couleurs exactes confirmées.
- Achat du nom de domaine et création d'emails professionnels.
- Coordonnées, WhatsApp, adresse et liens des réseaux sociaux.
- Informations légales pour les mentions légales (numéro d'immatriculation, etc.).
