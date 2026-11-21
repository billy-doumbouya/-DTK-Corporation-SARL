# Rapport d'analyse — DTK Corporation SARL

Date : 20 novembre 2026

## 1. Synthèse

Le projet est une base Next.js complète et ambitieuse pour un site institutionnel avec un tableau de bord CMS. L'architecture couvre les principales pages publiques, les demandes, les contenus administrables, les partenaires, les statistiques, l'actualité, les réalisations et un chatbot interne.

L'application n'est toutefois pas encore prête pour une mise en production : la compilation échoue à cause de dépendances absentes, le lint échoue sur six erreurs React, plusieurs exigences critiques du cahier des charges restent non implémentées ou partielles, et l'au thentification doit être durcie.

## 2. Appréciation globale

| Domaine | Appréciation |
|---|---|
| Couverture fonctionnelle | Solide |
| Qualité visuelle | Bonne base |
| Administration | Bonne couverture des modules |
| Sécurité | Insuffisante pour la production |
| Conformité au cahier des charges | Partielle |
| Maintenabilité | Moyenne |
| État de compilation | Bloqué |

**Appréciation générale : 6/10**

## 3. Points positifs

- Architecture Next.js App Router claire, avec pages publiques et tableau de bord séparés.
- Schéma Prisma complet pour les services, produits, formations, réalisations, actualités, demandes, partenaires, FAQ, médias et paramètres.
- Formulaire dynamique unique pour les cinq types de demande.
- Validation Zod partagée entre le formulaire client et l'API serveur.
- Protection du tableau de bord côté middleware et composant serveur.
- Mots de passe hachés avec scrypt et verrouillage après dix tentatives.
- Cookies de session marqués `httpOnly`; activement sécurisés en production via `Secure`.
- Journalisation des actions sensibles et taux limite du formulaire et du chatbot.
- Sitemap, robots, métadonnées, JSON-LD et balisage français présents.
- Interface responsive, navigation mobile, animations, états vides et composants shadcn/ui.
- Le seed semble utiliser principalement les informations réellement fournies au lieu de chiffres commerciaux inventés.

## 4. Résultats de validation

### 4.1 Compilation

La commande `npm run build` échoue avec les erreurs suivantes :

- Module `@vercel/blob` introuvable dans [src/lib/storage.ts](src/lib/storage.ts:59).
- Le module `nodemailer` est absent dans [src/lib/mailer.ts](src/lib/mailer.ts:49).
- Un avertissement indique que la convention `middleware` est obsolète dans Next.js 16.

L'installation des dépendances manquantes est donc nécessaire avant toute mise en production.

### 4.2 Lint

La commande `npm run lint` échoue sur six erreurs :

- [src/components/dashboard/chatbot-config.tsx](src/components/dashboard/chatbot-config.tsx:51)
- [src/components/dashboard/media-library.tsx](src/components/dashboard/media-library.tsx:43)
- [src/components/dashboard/resource-manager.tsx](src/components/dashboard/resource-manager.tsx:72)
- [src/components/site/chatbot-widget.tsx](src/components/site/chatbot-widget.tsx:60)
- [src/components/ui/carousel.tsx](src/components/ui/carousel.tsx:98)
- [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts:14)

Les diagnostics portent sur des mises à jour d'état déclenchées synchronement depuis des effets React.

## 5. Points bloquants

### 5.1 Dépendances de production manquantes

`package.json` ne déclare ni `nodemailer` ni `@vercel/blob`, alors que le code importe ces services. Les emails et le stockage Vercel Blob ne peuvent donc pas fonctionner comme prévu sur l'installation actuelle.

### 5.2 Pas de route publique d'upload

Le cahier des charges prévoit une pièce jointe pour la sous-traitance et un gestionnaire média complet. La route [src/app/api/upload](src/app/api/upload) n'existe pas sous forme de fichier de route.

### 5.3 Accès administrateur non conforme

Les cinq clics sur le logo ne sont pas implémentés dans [src/components/site/site-header.tsx](src/components/site/site-header.tsx). Le projet propose seulement une route directe via `/auth` et des raccourcis clavier.

La sécurité de session reste insuffisante :

- Les sessions sont conservées dans une `Map` mémoire, et non dans une table persistante.
- Elles disparaissent après un redémarrage ou un changement d'instance.
- Le jeton utilise `Math.random`, sans cryptographie forte.
- Aucun mécanisme de CSRF n'est visible sur les actions administratives.
- Un secret `AUTH_SECRET` est prévu dans la documentation mais n'est pas utilisé pour signer les sessions.

Ces comportements sont incompatibles avec un déploiement stable sur plusieurs instances Vercel.

### 5.4 Headers de sécurité incomplets

HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy et Permissions-Policy sont présents. En revanche, aucune CSP (`Content-Security-Policy`) n'est configurée.

### 5.5 Chatbot non conforme sur plusieurs points

- Le code utilise `z-ai-web-dev-sdk`, alors que le cahier des charges impose Google AI Studio/Gemini.
- Aucun basculement visible sur une liste ordonnée de plusieurs modèles Gemini configurables n'est implémenté.
- La configuration `ChatbotModelConfig` existe en base, mais la route publique ne l'utilise pas.
- L'historique accepté côté API n'est pas validé ni limité par rôle; il est simplement tronqué sans contrôle de longueur sur chaque message.

Le périmètre RAG est raisonnable, mais les fonctionnalités exigées ne correspondent pas exactement au cahier des charges.

## 6. Écarts fonctionnels importants

### 6.1 Contenus encore partiellement codés en dur

[src/app/page.tsx](src/app/page.tsx) affiche plusieurs valeurs fixes dans l'introduction :

- « 6 domaines »
- « 4 villes »
- « 3 mois »
- « 0 compromis qualité »

Or le cahier des charges demande que les sections importantes soient administrables dans la base. Les domaines/services sont dynamiques pour une partie de la page, mais ces quatre cartes restent fixes.

### 6.2 Upload d'image incomplet

Le stockage local fonctionne comme implémentation de base, mais les exigences de conversion WebP, recadrage, texte alternatif obligatoire et pièce jointe ne sont pas toutes visibles dans le parcours courant.

### 6.3 Dépendances imposées non utilisées

- Axios avec instance centralisée : absent; le code utilise `fetch`.
- NProgress : remplacé par une barre native maison.
- Google Gemini : remplacé par Z-AI.
- Nodemailer : prévu mais non installé.
- Vercel Blob : prévu mais non installé.

### 6.4 Difficultés de fonctionnement probables

- [src/app/page.tsx](src/app/page.tsx:291) référence `/images/team-pro.webp`; cette image existe maintenant dans le dépôt, donc cette référence est valide.
- Le build ignore les erreurs TypeScript grâce à `typescript.ignoreBuildErrors: true` dans [next.config.ts](next.config.ts). Ceci masque des défauts de typage au lieu de les corriger.
- Le middleware est déprécié dans Next.js 16 et devra être migré vers la nouvelle convention recommandée.
- La base reste configurée sur SQLite; PostgreSQL Neon n'est pas encore activé en production.

## 7. Points de logique à corriger

1. Supprimer les secrets et mots de passe de démonstration par défaut en production.
2. Remplacer les sessions mémoire par des sessions persistantes ou JWT signé.
3. Ajouter une défense CSRF aux mutations.
4. Installer et configurer Nodemailer.
5. Installer `@vercel/blob` et créer les routes d'upload nécessaires.
6. Implémenter les cinq clics du logo.
7. Activer PostgreSQL avec migrations et sauvegardes documentées.
8. Corriger les six erreurs du lint.
9. Ajouter la validation d'authentification sur toutes les API admin après changement d'instance.
10. Implémenter ou retirer clairement les fonctionnalités imposées mais absentes.

## 8. Conformité au cahier des charges

| Exigence | Statut |
|---|---|
| Pages publiques institutionnelles | Partiellement réalisé |
| Contenu administrable | Réalisé en grande partie |
| Seed sans données inventées | Conforme sur les grands axes |
| Formulaire à cinq types | Réalisé |
| Validation Zod commune | Réalisé |
| Anti-spam et limitation | Réalisé |
| Emails nodemailer | Non vérifié / dépendance absente |
| Bouton WhatsApp | Réalisé |
| Cinq clics sur le logo | Non réalisé |
| Authentification httpOnly | Partiellement réalisé |
| Verrouillage de compte | Réalisé |
| RBAC préparé | Réalisé au niveau de la base |
| Protection CSRF | Non réalisé |
| Chatbot RAG | Réalisé avec Z-AI |
| Fallback Gemini et multi-modèles | Non réalisé |
| Upload Vercel Blob | Non déployable en l'état |
| Sitemap / robots / métadonnées | Réalisé |
| SQLite vers PostgreSQL | Prévu mais non réalisé |
| Lighthouse 90+ | Non mesuré |
| Accessibilité et navigation clavier | Bases présentes, validation globale manquante |

## 9. Recommandation finale

**Recommandation : ne pas publier en production actuellement.**

Le projet a une base fonctionnelle intéressante et une interface crédible, mais il reste bloqué par les dépendances manquantes, les erreurs de lint, les sessions mémoire non persistantes, l’absence de CSRF et les écarts majeurs sur Gemini, les uploads et l’accès administrateur.

Après correction des points bloquants et validation sur les parcours navigateur desktop/mobile, une nouvelle validation build-lint-E2E sera nécessaire. La prochaine livraison devrait viser au minimum :

- build de production réussi;
- lint sans erreur;
- authentification persistante et CSRF;
- uploads opérationnels;
- chatbot conforme;
- cinq clics du logo;
- test réel des cinq types de demande;
- test de redémarrage/connexion persistante;
- Lighthouse mobile documenté.

## 10. Renforcement réalisé après cette analyse

Les corrections suivantes ont été appliquées :

- ajout de `nodemailer` et `@vercel/blob` aux dépendances;
- remplacement des sessions mémoire par des sessions Prisma persistantes;
- utilisation de jetons cryptographiquement aléatoires, stockés sous forme de hash SHA-256;
- ajout de la validation d'origine pour les mutations côté proxy;
- ajout d'une CSP stricte et migration vers la convention `proxy` Next.js 16;
- ajout de la route d'upload authentifiée avec contrôle MIME, taille et conversion WebP via Sharp;
- suppression du SVG des formats acceptés afin de réduire le risque XSS;
- suppression du stockage Blob lors de la suppression d'un média;
- ajout de la navigation par cinq clics rapides sur le logo;
- passage du chatbot vers Google AI Studio/Gemini avec liste de modèles configurable;
- validation renforcée de l'historique du chatbot;
- correction des six diagnostics React de lint;
- correction des erreurs TypeScript bloquant la compilation;
- désactivation des erreurs TypeScript masquées et ajout de `.env.example`;
- retrait des identifiants réels de la configuration locale;
- génération du client Prisma PostgreSQL.

Validation technique :

- `npm run lint` : réussi, aucune erreur;
- compilation Next.js : réussie;
- TypeScript : réussi;
- `npm run build` atteint la collecte des pages, puis s'arrête uniquement parce que `.env` contient désormais un `DATABASE_URL` volontairement fictif.

Reste avant mise en ligne :

1. fournir une vraie URL Neon et réinitialiser les secrets/accès exposés;
2. appliquer `prisma db push` ou créer une migration sur l'environnement PostgreSQL;
3. définir `AUTH_SECRET`, les clés Gemini, SMTP et Vercel Blob;
4. exécuter un build complet avec la base de production;
5. exécuter les tests navigateur et Lighthouse;
6. vérifier que les identifiants historiques ont été révoqués chez Neon et partout ailleurs.
