# LayR — Jour 29

Plateforme de découverte design bilingue (FR/EN) avec soumission de sites analysée par IA.
Mélange Awwwards / Godly / Land-book / Mobbin / Pinterest, avec sa propre identité.
Le cahier des charges complet de l'utilisateur fait office de contrat : ce fichier en est le résumé.

---

## 1. Demandes (résumé)

**Produit réel, pas une maquette.** Aucun bouton factice, aucune IA simulée : si une clé manque, l'interface le dit clairement.
Pas d'esthétique « IA générique » (pas de glassmorphism, dégradés répétitifs, cartes génériques, tout arrondi).

- **i18n FR/EN complète** : URLs `/fr` et `/en`. Détection par langue du navigateur (fr → FR, sinon EN), pays seulement en repli. Choix manuel prioritaire et persistant, plus jamais écrasé. Tout est traduit : nav, boutons, filtres, badges, formulaires, admin, erreurs, notifications, états vides, fiches, descriptions et critiques IA (stockées en FR et en EN).
- **Thèmes Système / Clair / Sombre** : persistants, préférence système à la première visite. Transition 400–600 ms (révélation circulaire depuis le bouton, icône soleil/lune animée), sans flash ni décalage.
- **Direction artistique** : éditoriale premium, typo forte, espaces généreux, asymétrie maîtrisée, captures en vedette. Design system complet (typo, espacements, couleurs 2 thèmes, boutons, cartes, badges, inputs, nav, modales, animations).
- **Héro** : « GOOD DESIGN / IS NEVER RANDOM. » / « LE BON DESIGN / N'EST JAMAIS UN HASARD. », texte d'accroche FR/EN fourni, label « CURATED FOR CREATIVES », captures flottantes, parallaxe, interactions souris. CTA « Explore the collection ↗ / Explorer la collection ↗ » et « Submit a website + / Proposer un site + ».
- **Découvrir** : grille éditoriale/masonry de cartes (capture, titre, description, domaine, note /10, catégories, tags, badge vedette, favori, lien externe). Survol : zoom, élévation, bordure animée. Squelettes de chargement. Plusieurs modes d'affichage.
- **Recherche** : instantanée, suggestions, par nom, domaine, description, catégorie, badge, tag. Raccourcis `/`, Échap, Entrée. Recherches récentes. État vide soigné. FR et EN.
- **Filtres** : 16 catégories, 13 badges, tris (mieux notés, récents, populaires, plus sauvegardés, vedette, gratuit, premium). Multi-sélection combinable avec la recherche, chips supprimables, « Tout effacer », compteur de résultats, mise à jour sans rechargement, filtres conservés (URL). Barre latérale desktop, tiroir animé mobile.
- **Inspiration** (page séparée) : 14 catégories (portfolios, studios, agences, landing pages, e-commerce, expérimental, interactif, primés, minimaliste, typo, motion, storytelling, 3D, sites perso). Grandes captures, créateur/agence, tags visuels, description éditoriale, note, favori. Filtres : type, style visuel, palette, mise en page, animation, industrie, note. Portfolios : designer, développeur, DA, artiste 3D, studio.
- **Favoris** : bouton animé sur chaque carte + confirmation discrète. Page dédiée : recherche, filtres catégorie/badge, tri par date, retrait, collections personnalisées. Anonyme = local + invitation à créer un compte ; connecté = synchro. État vide « Rien pour le moment. Commencez à explorer. » + CTA.
- **Fiche site** : grande capture, titre, domaine, CTA visiter, note, description, catégories, tags, critique IA, favori, date d'ajout, sites liés.
- **Soumission IA** : l'admin colle une URL → capture, titre, description FR/EN, catégorie, badges, tags, style visuel, analyse UX/UI, note suggérée, critique. Aperçu entièrement modifiable, jamais publié sans validation. Repli manuel si le site est inaccessible.
- **Admin protégé** : ajout manuel / IA, édition, suppression, upload de captures, textes FR/EN, notes, catégories, badges, vedette, entrées inspiration, statut de publication.
- **Badges & notes** : badges avec nom FR/EN, slug, style, icône, description ; filtrables et cherchables. Notes /10 validées par l'admin, présentées comme évaluations éditoriales.
- **Retour quotidien** : site du jour (« ONE GOOD FIND A DAY / UNE BELLE DÉCOUVERTE PAR JOUR »), tendances de la semaine, récemment ajoutés, plus sauvegardés, choix de la rédaction, collections, récemment vus, newsletter.
- **Animations** : Framer Motion, transitions de page, apparitions au scroll décalées, CTA magnétiques, parallaxe légère, respect de `prefers-reduced-motion`.
- **Navigation** : Découvrir, Inspiration, Catégories, Tendances, Favoris + logo, recherche, proposer un site, FR/EN, thème, profil. Version mobile.
- **Footer** : « GOOD DESIGN DESERVES TO BE FOUND. / LE BON DESIGN MÉRITE D'ÊTRE DÉCOUVERT. », nav, catégories, proposer, à propos, contact, newsletter, liens, sélecteur de langue.
- **Données** : tables websites, categories, badges, users, favorites, collections, collection_items (schéma du cahier des charges, ressources et inspirations dans la même table via `content_type`).
- **Sécurité** : clés API uniquement côté serveur, validation des entrées, gestion d'erreurs.

## 2. Décisions prises avec l'utilisateur (2026-11-12)

| Sujet | Choix |
|---|---|
| Stack | Next.js + TypeScript + Tailwind + Framer Motion |
| Base | **Postgres sur Coolify** (pas Supabase), auth maison |
| IA | **Gemini palier gratuit** (texte + capture). Rappeler de poser `GEMINI_API_KEY` au moment des tests réels |
| Captures | **Playwright/Chromium dans le conteneur** (pas Browserless) |
| Comptes | **Visiteurs + admin** : visiteurs peuvent créer un compte (synchro favoris/collections), anonymes en localStorage, l'utilisateur seul admin |
| Contenu initial | **~60 sites réels** (~35 ressources/outils + ~25 inspirations dont portfolios), vraies captures, textes FR/EN |
| Direction visuelle | **« Calques / couches »** : joue sur le nom LayR, captures empilées en couches décalées, profondeur, parallaxe des calques |
| Palette | Mocha Brown `#5B4632`, Champagne Gold `#F4D9A0`, Burnt Amber `#C8792C`, Charcoal Black `#171717` |
| Newsletter | Emails stockés en base, liste + export CSV dans l'admin, pas d'envoi en V1 |
| Footer | Lien dépôt GitHub, lien https://projectp.fr, formulaire de contact stocké en base (lu dans l'admin) |
| Jeu du jour | **Non** : la « belle découverte du jour » suffit |
| Mise en ligne | Dépôt public `PierreWZK/layr`, **branche `master`** (jamais `main`, même si demandé), Coolify, https://layr.projectp.fr |

## 3. Plan V1 — 5 étapes (validation de l'utilisateur après chacune)

1. **Fondations & identité** — projet Next.js, Postgres local + schéma + migrations, design system « Calques » (tokens clair/sombre, typo, composants de base), i18n `/fr` `/en` avec détection, thèmes + transition circulaire, nav + footer, héro animé. **Code prêt, en attente de validation.**
2. **Catalogue & découverte** — seed ~60 sites (captures Playwright, textes FR/EN), page Découvrir (grille, cartes, modes d'affichage, filtres catégories/badges/tris, chips, tiroir mobile), recherche instantanée + suggestions + raccourcis, fiche site, sections d'accueil (site du jour, tendances, récents, choix de la rédaction, plus sauvegardés).
3. **Inspiration, favoris & comptes** — page Inspiration et ses filtres, favoris locaux + comptes visiteurs + synchro, collections, récemment vus, newsletter et contact.
4. **Admin & soumission IA** — dashboard protégé, CRUD sites/catégories/badges, upload captures, soumission URL → Playwright + Gemini → aperçu modifiable → approbation, repli manuel, lecture newsletter/contact.
5. **Finitions & mise en ligne** — animations et reduced-motion, responsive, accessibilité, tests, Dockerfile (Chromium), dépôt GitHub `master`, Coolify + Postgres, domaine, README.

## 4. Ce qui est fait

- [x] Questions de cadrage posées et réponses consignées (section 2).
- [x] Ce fichier de contexte.
- [x] **Étape 1 — Fondations & identité** (code prêt, non commité : attente de validation de l'utilisateur).
  - Next.js 16.4 + TypeScript + Tailwind v4 + Framer Motion. Commandes : `npm run dev`, `npm run build`, `npm run lint`.
  - Postgres : `npm run db:start` (Postgres local embarqué, port 5433, données dans `.pgdata/`), `npm run db:migrate` (`db/migrations/001_init.sql` et `002_taxonomy_seed.sql`). Schéma complet du cahier des charges, plus `search_document` (recherche plein texte maintenue par trigger). Seed : 16 catégories, 13 badges (FR/EN).
  - i18n `/fr` `/en` : `src/proxy.ts` redirige selon le cookie `layr-locale` (choix manuel), puis `Accept-Language` (fr → FR, sinon EN), puis le pays (FR/BE/CH/LU/MC) en repli. Dictionnaires typés FR/EN dans `src/i18n/`.
  - Thèmes Système / Clair / Sombre : préférence dans `localStorage` (`layr-theme`), script du `<head>` sans flash, révélation circulaire (View Transitions API, 550 ms) depuis le bouton, repli en fondu 500 ms, `prefers-reduced-motion` respecté.
  - Design system : tokens clair/sombre (`src/app/globals.css`, palette Mocha / Champagne / Amber / Charcoal), échelle typo `t-display`, `t-h1`, `t-h2`, `t-lead`, `t-label`, composants Button, ButtonLink, Badge, Surface, Field, Modal, Reveal, Magnetic.
  - Navigation (Découvrir, Inspiration, Catégories, Tendances, Favoris, Proposer), logo, sélecteur FR/EN, menu mobile animé, footer éditorial.
  - Héro « GOOD DESIGN / IS NEVER RANDOM. » (version FR traduite), label, CTA, calques dessinés avec parallaxe souris et défilement, trame animée.
  - Accueil : index des 16 catégories lu depuis la base (squelette pendant le chargement, message si base absente ou en erreur).
  - Pages Découvrir, Inspiration, Catégories, Tendances, Favoris, Proposer : **pages réservées** (« Bientôt disponible »), sans contenu pour l'instant.

## 5. Ce qui a été testé

- Redirections du proxy (curl) : `Accept-Language: fr-FR` → `/fr` ; `en-US` → `/en` ; `de-DE` → `/en` ; sans en-tête → `/en` ; cookie `layr-locale=fr` prime sur `en-US` → `/fr`.
- Migrations appliquées deux fois sans erreur (idempotence). Seed : 16 catégories, 13 badges.
- `tsc --noEmit`, `eslint .`, `next build` : OK.
- Navigateur intégré, bureau : `/en` et `/fr` rendus. Titre FR correct après correction (l'accent était écrit en dur sur « IS NEVER RANDOM »). 16 entrées d'index venant de la base.
- Navigateur intégré, bureau : menu thème ouvert, passage en Clair vérifié (classe `dark` retirée, `localStorage` = `light`, fond `rgb(246, 241, 231)`).
- Navigateur intégré, mobile 375 px : pas de débordement horizontal, menu mobile s'ouvre, bouton Proposer masqué sous `md`.
- Console : aucune erreur après les correctifs Suspense. Dernière série de corrections lint/thème : compilée et buildée, pas revérifiée dans le navigateur.

## 6. Ce qui n'a pas marché / reste en suspens

- **Transition circulaire du thème** : codée (View Transitions API), mais jamais vue en mouvement. À vérifier dans un vrai navigateur.
- **Mode sombre** : vérifié au début de l'étape, pas revérifié après les dernières corrections.
- **Pas de vraies captures** : le héro affiche des calques dessinés. Les captures Playwright arrivent à l'étape 2.
- **Pas encore présents** (étapes suivantes) : recherche, filtres, fiche site, favoris, inscription/connexion, icône profil, newsletter, formulaire de contact, admin, soumission IA.
- **Dépôt GitHub** : pas créé. Le lien du footer `github.com/PierreWZK/layr` ne mène nulle part tant que l'étape 5 n'est pas faite. Branche locale `master`, rien de poussé.
- **Rien commité** : attente de la validation de l'étape 1.
- Postgres local seulement. Pas encore de Dockerfile ni de base Coolify.

## 7. Pièges connus (projets précédents)

- `create-next-app` refuse un dossier non vide (ce fichier) : générer dans un sous-dossier temporaire puis déplacer.
- git-guard bloque les push directs : créer `master` via `gh api`, travailler en branche + PR.
- Coolify : après création de l'app sur la branche de PR, la repasser sur `master` après fusion. L'API refuse « — » dans les descriptions.
- Le volet navigateur masqué peut fausser les mesures et les animations : vérifier visible.
- Next 16 + `cacheComponents` : lire `params` ou la base uniquement dans un `<Suspense>` (sinon erreur de pré-rendu ou avertissement `instant-shell-url-data`). `new Date()` dans un Client Component casse aussi le build.
- Dans un script shell, ne jamais écrire du texte contenant des backticks dans des guillemets doubles (substitution de commande) : passer par l'outil Write.

## 8. Après la V1

Demander à l'utilisateur de faire **tous les tests possibles** (FR/EN, thèmes, mobile, filtres, favoris, comptes, admin, soumission IA avec vraie clé) et de renvoyer la liste complète des modifications à faire.
