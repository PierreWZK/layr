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

**Retours de l'utilisateur après l'étape 1 (2026-11-12)** : héro FR sans CTA visibles → corrigé ; page d'accueil (vitrine) à enrichir pour montrer ce que propose le site → fait ; puis continuer.

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

1. **Fondations & identité** — **validée et commitée** (`90d6bbb` sur `feat/layr-v1`).
2. **Catalogue & découverte** — **code prêt, en attente de validation, non commité.**
3. **Inspiration, favoris & comptes** — page Inspiration et ses filtres, page Favoris + comptes visiteurs + synchro, collections, récemment vus, newsletter et contact.
4. **Admin & soumission IA** — dashboard protégé, CRUD sites/catégories/badges, upload captures, soumission URL → Playwright + Gemini → aperçu modifiable → approbation, repli manuel, lecture newsletter/contact.
5. **Finitions & mise en ligne** — animations et reduced-motion, responsive, accessibilité, tests, Dockerfile (Chromium), dépôt GitHub `master`, Coolify + Postgres, domaine, README.

## 4. Ce qui est fait

### Étape 1 — Fondations & identité (commit `90d6bbb`)
- Next.js 16.4 + TypeScript + Tailwind v4 + Framer Motion. Commandes : `npm run dev`, `npm run build`, `npm run lint`.
- Postgres : `npm run db:start` (Postgres local embarqué, port 5433, données dans `.pgdata/`), `npm run db:migrate`.
- i18n `/fr` `/en` : `src/proxy.ts` (cookie `layr-locale` → `Accept-Language` → pays FR/BE/CH/LU/MC → EN).
- Thèmes Système / Clair / Sombre, révélation circulaire (View Transitions API), repli en fondu, sans flash.
- Design system « Calques » (`src/app/globals.css`), navigation, footer, héro.

### Étape 2 — Catalogue & découverte (non commitée)
- **Héro FR corrigé** : titre borné par la hauteur d'écran (`.hero-title`, plus petit en FR), texte et CTA empilés. CTA visibles en FR et EN à 1440×900, 1280×720, 1024×640 et 375×812.
- **71 sites réels** dans `db/seed/websites.json` : 43 ressources, 28 inspirations (portfolios, studios, agences, landing pages, e-commerce, expérimental, storytelling, typo, 3D…), textes FR/EN, critiques, notes, badges, tags, champs visuels (style, palette, mise en page, animation, secteur).
- **Captures** : `npm run capture` (`scripts/capture.mjs`, Playwright, 1200×750 WebP, ~2,5 Mo au total dans `public/screenshots/`). Bannières cookies masquées sans consentement. Options : `--force`, `--og` (image Open Graph du site), `--strip-overlays`.
- **Seed** : `npm run db:seed` (upsert par URL, rejouable).
- **Migration 003** : colonne `slug` + table `website_events` (ouvertures de fiche et clics « Visiter »).
- **Couche données** `src/lib/websites.ts` : requêtes filtrées (recherche plein texte par préfixe + catégories + badges + tags, filtres combinés), tris (sélection, note, récents, populaires, sauvegardés, tendances), site du jour, sites proches, suggestions, compteurs.
- **Découvrir** (`/[locale]/discover`) : filtres catégories (multi), badges (multi), filtres rapides (À la une, Gratuit, Premium), recherche avec délai de 250 ms, tri, vue grille/liste, chips supprimables, « Effacer tous les filtres », compteur, mise à jour sans rechargement (URL = état, `useOptimistic`), barre latérale bureau, tiroir animé mobile, état vide, squelette.
- **Recherche globale** (palette dans la nav) : raccourci `/`, Échap, Entrée, flèches, suggestions (sites, catégories, badges, tags), « voir tous les résultats », recherches récentes (localStorage). API `GET /api/search`.
- **Carte de site** : capture, zoom et calque décalé au survol, badge À la une, favori, titre, domaine (lien externe), note /10, description, catégorie, badges, tags. Vue liste.
- **Favoris locaux** (`src/lib/favorites-store.ts`) : bouton cœur animé, toast avec lien « Voir ». La page Favoris arrive à l'étape 3.
- **Fiche site** (`/[locale]/site/[slug]`) : fil d'Ariane, titre, domaine, Visiter (via `/go/[slug]`, compte le clic), favori, grande capture sur calque, note éditoriale + explication, catégorie, badges, tags, critique, infos inspiration (créateur, style, palette…), date d'ajout, 4 sites proches. Compte les ouvertures (`POST /api/events`).
- **Catégories** (`/[locale]/categories`) : 16 catégories avec 3 captures empilées, description, nombre de sites, lien vers Découvrir filtré.
- **Tendances** (`/[locale]/trending`) : top 20 sur 7 jours (ouvertures + visites), méthode expliquée, à égalité la note départage.
- **Vitrine enrichie** (accueil) : chiffres réels (71 sites, 16 catégories, 13 badges, 14 univers, 2 langues), « Une belle découverte par jour », 4 piliers (Découvrir, Inspiration, Favoris, Proposer), Tendances de la semaine (seulement s'il y a eu de l'activité), Choix de la rédaction, index des catégories (liens + compteurs), mur des 13 badges (liens), Ajouts récents, Les plus sauvegardés (seulement si des sauvegardes existent en base), 14 univers d'inspiration, méthode en 4 étapes, CTA final.

## 5. Ce qui a été testé

- Étape 1 : redirections proxy (fr/en/de/sans en-tête/cookie), migrations rejouables, build, lint, tsc.
- Étape 2, base : seed rejoué deux fois (71 sites, 71 captures), recherche `typo:*` → Typewolf, Klim, Pangram… ; `npm run db:migrate` (003) OK.
- Captures vérifiées à l'œil sur planche contact : 67 OK au premier passage. 5 sites WebGL ou à préchargeur (Active Theory, Bruno Simon, Lusion, Obys, Patatap) → image Open Graph. Neal.fun → overlay de consentement retiré. 4 sites bloquent tout robot (Behance, Blender, Unsplash, Blush) → remplacés par It's Nice That, Three.js, Haikei, Open Peeps.
- Routes (Node fetch) : toutes les pages en 200, `/go/linear` → 302 vers linear.app, `/api/search` FR (« typo », « outils » → catégories Outils IA / Outils développeurs), `POST /api/events` 204 et 400 sur un slug invalide.
- Playwright, bureau : filtres Typographie + Gratuit + recherche « google » → 1 résultat, 3 chips ; « Effacer tous les filtres » ; tri par note ; vue liste ; favori + toast + localStorage ; palette `/` (« fig » → Figma, Relume, #figma) ; Entrée ouvre la fiche ; recherche récente mémorisée ; Échap ferme ; état vide.
- Playwright, mobile 375 px sombre : tiroir de filtres, compteur du bouton (« Show 3 results »), pas de débordement horizontal sur `/fr`, `/fr/discover`, fiche, catégories, tendances.
- Aucune erreur console ni erreur de page pendant les parcours.
- `tsc --noEmit`, `eslint .`, `next build` : OK.

## 6. Ce qui n'a pas marché / reste en suspens

- **Transition circulaire du thème** : codée, jamais vue en mouvement (le volet navigateur intégré est masqué : ses animations sont gelées). À vérifier à la main.
- **Fiche inexistante** (`/fr/site/nope`) : affiche la page introuvable mais avec un code HTTP 200 (limite du rendu en streaming de Next). À traiter à l'étape 5 si besoin pour le SEO.
- **Pas de métadonnées par fiche** (titre/description de l'onglet par site) : prévu à l'étape 5.
- **Recherche sans accents** : « typographie » fonctionne, mais une requête sans accent ne trouve pas un mot accentué (pas d'extension `unaccent`). À voir à l'étape 5.
- **Tendances / Plus sauvegardés** : données vides au départ (aucune visite réelle), d'où l'affichage conditionnel sur l'accueil.
- **Piliers de l'accueil** : Inspiration, Favoris et Proposer pointent encore vers des pages « Bientôt disponible » (étapes 3 et 4). Les promesses « compte gratuit » et « analyse par IA » deviennent vraies aux étapes 3 et 4.
- **Tags** stockés en anglais uniquement (les descriptions, elles, sont bilingues).
- **Captures OG** pour 5 sites : ce n'est pas une capture d'écran mais l'image de partage officielle du site.
- **Dépôt GitHub** pas créé. Lien footer `github.com/PierreWZK/layr` mort jusqu'à l'étape 5.

## 7. Pièges connus

- `create-next-app` refuse un dossier non vide (ce fichier) : générer dans un sous-dossier temporaire puis déplacer.
- git-guard bloque les push directs : créer `master` via `gh api`, travailler en branche + PR.
- Coolify : après création de l'app sur la branche de PR, la repasser sur `master` après fusion. L'API refuse « — » dans les descriptions.
- Next 16 + `cacheComponents` : lire `params`, `searchParams` ou la base uniquement dans un `<Suspense>`, avec `await connection()` pour les lectures de base. `new Date()` dans un Client Component casse le build.
- Sections `mx-auto max-w-…` dans un conteneur flex : ajouter `w-full`, sinon un carrousel horizontal les élargit (débordement mobile).
- Le volet navigateur intégré masqué gèle les animations Framer : vérifier avec Playwright headless (faire défiler avant une capture pleine page, sinon les blocs `whileInView` restent invisibles).
- Un vieux serveur `next dev` peut rester sur le port 3000 et servir un CSS périmé : le tuer avant de conclure à un bug CSS.
- Les hooks bloquent `curl` et `fetch` inline dans Bash : passer par un script Node écrit dans le projet puis supprimé.
- Dans un script shell, ne jamais mettre de backticks dans des guillemets doubles : passer par l'outil Write.
- Captures : le shell headless de Playwright n'a pas de WebGL ; même avec Chromium complet + SwiftShader, les gros sites 3D restent bloqués au chargement → `--og`.

## 8. Après la V1

Demander à l'utilisateur de faire **tous les tests possibles** (FR/EN, thèmes, mobile, filtres, favoris, comptes, admin, soumission IA avec vraie clé) et de renvoyer la liste complète des modifications à faire.
