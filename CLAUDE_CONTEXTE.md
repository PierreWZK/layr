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
2. **Catalogue & découverte** — **validée et commitée** (`087f061`).
3. **Inspiration, favoris & comptes** — **code prêt et testé, en attente de validation, non commité** (voir section 4).
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

### Étape 3 — Inspiration, favoris & comptes (non commitée)
- **Migration 004** (`db/migrations/004_accounts.sql`) : `users.display_name`, table `sessions` (jeton haché SHA-256, expiration 30 jours), `newsletter_subscribers`, `contact_messages`.
- **Comptes maison** (`src/lib/auth.ts`) : mot de passe en scrypt (sel 16 octets), jeton aléatoire de 32 octets dans le cookie `layr-session` (httpOnly, sameSite lax, secure en production). Routes `POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `GET /api/me`.
- **Page Compte** `/[locale]/account` : connexion / inscription (onglets), bienvenue, date d'adhésion, déconnexion. Icône dans l'en-tête.
- **Synchro des favoris** : le localStorage reste la liste affichée. Connecté : chaque ajout/retrait part aussi vers `POST /api/favorites`, et à la connexion les favoris locaux sont fusionnés par `POST /api/favorites/sync` (rien n'est retiré, la liste serveur est adoptée). `AccountProvider` (`src/components/account/account-provider.tsx`) porte l'état de session.
- **Page Favoris** `/[locale]/favorites` : recherche texte, filtre catégorie, tri (récents, mieux notés, A à Z), compteur, fiches via `GET /api/websites?locale=&slugs=` (`getWebsitesBySlugs`). Bandeau « sur cet appareil uniquement » ou « synchronisé ».
- **Collections** (connecté seulement) : créer, ouvrir, ajouter un favori, retirer, supprimer. Routes `/api/collections`, `/api/collections/[id]`, `/api/collections/[id]/items`. Les tables existaient depuis `001_init.sql`.
- **Récemment consultés** : `src/lib/recent-store.ts` (localStorage `layr-recent`, 12 entrées max), alimenté par `ViewBeacon` sur chaque fiche. Affiché en bas de la page Favoris.
- **Page Inspiration** `/[locale]/inspiration` : 14 catégories en multi-sélection, filtres style visuel, palette, mise en page, mouvement, secteur (libellés FR/EN dans `src/i18n/inspiration-labels.ts`), note minimale (0, 7, 8, 9), tri. État dans l'URL (valeurs séparées par des virgules). Les colonnes filtrées viennent d'une liste blanche (`INSPIRATION_COLUMNS` dans `websites.ts`).
- **Newsletter** : formulaire dans le pied de page, `POST /api/newsletter`, stockage seul (pas d'envoi en V1).
- **Contact** `/[locale]/contact` : nom, e-mail, message (10 à 3000 caractères), `POST /api/contact`, stockage seul (lecture dans l'admin à l'étape 4).
- Pages `favorites`, `inspiration`, `account`, `contact` remplacent les pages « Bientôt disponible ».
- Libellés `inspirationPage`, `favoritesPage`, `account`, `contact`, `newsletter` ajoutés aux deux dictionnaires.

### En-tête et héro « cadre » (commit `713293a`)
- Demande : refaire l'en-tête et le héro d'après une référence Dribbble (cadre sombre, panneau coloré arrondi, CTA en encoches).
- Fait : barre charbon dans les deux thèmes, panneau moka/ambre, encoches concaves (Soumettre, Explorer, Défiler), trois vraies captures en parallaxe.

### Étape 4 — Admin & soumission IA
- Table `submissions` (migration 005), espace admin `/[locale]/admin` : tableau de bord, sites (créer, modifier, supprimer, publier), soumissions, messages, newsletter (export CSV), taxonomie.
- Ajout d'un site : URL → capture Playwright (WebP 1200×750 dans `MEDIA_DIR`, servie par `/media/[file]`) + analyse Gemini (`responseSchema`, sortie nettoyée) → formulaire modifiable → enregistrement. Sans `GEMINI_API_KEY`, l'écran le dit et le formulaire manuel reste utilisable. Garde SSRF (`normalizePublicUrl`).
- Page publique `/[locale]/submit` : propose une URL, stockée en base, traitée depuis l'admin.
- Admin = `role = 'admin'` ou e-mail listé dans `ADMIN_EMAILS`.

### Logo, partage social et refonte du contenu
- Demande : un logo dans l'en-tête et un aperçu pour le partage du lien sur les réseaux.
- Fait : marque à trois calques (champagne, ambre, moka), dans l'en-tête, le favicon `app/icon.svg` et le pied de page. Images `public/og/fr.png` et `en.png` (1200×630), balises Open Graph et Twitter `summary_large_image`.
- Demande : revoir tout le contenu (cartes, police…) en cohérence avec le héro, sans toucher au héro ni à l'en-tête.
- Fait : titres en capitales serrées, cartes arrondies 22 px (`.card`), boutons en pilules champagne, champs et puces arrondis, `.panel-mocha`, fiche site mise à jour.
- Validé par l'utilisateur le 2026-11-12, puis commit et ouverture du dépôt GitHub `PierreWZK/layr` (branche principale `master`, PR depuis `feat/layr-v1`).

## 5. Ce qui a été testé

- Étape 3, API (38 vérifications, toutes OK) : inscription (mot de passe court, e-mail invalide, doublon 409), connexion (mauvais mot de passe 401), `/api/me`, ajout/retrait de favori, fusion par sync (slug invalide ignoré, pas de doublon), collections (site ajouté une seule fois, retrait, suppression, collection d'un autre compte ou inconnue sans effet), batch de fiches dans l'ordre demandé, déconnexion, favoris sans session (401), newsletter et contact (validation et doublon), 12 pages en 200 (filtres invalides compris).
- Étape 3, navigateur Playwright (17 vérifications, toutes OK) : filtre d'inspiration qui change l'URL et le nombre de fiches (28 → 5), effacer tout, filtre palette par URL, inscription avec bienvenue, favori visible sur la page Favoris et synchronisé côté serveur, création de collection, récemment consultés, contact envoyé, newsletter enregistrée, déconnexion, pas de débordement à 375 px sur les 4 nouvelles pages, aucune erreur console.
- Étape 3, build : `tsc --noEmit`, `eslint .`, `next build` OK (nouvelles routes API en `ƒ`).
- Bugs trouvés et corrigés pendant les tests : `event.currentTarget` lu après `await` (formulaires contact et newsletter affichaient une erreur alors que l'envoi réussissait) ; tags en double (« dark » présent dans tags et visualTags) ; clé React dupliquée sur les infos de fiche.
- Étape 4 + refonte, build : `tsc --noEmit`, `eslint .`, `next build` OK après correction de `/api/me`. Captures Playwright (découvrir, accueil EN, fiche sombre, inspiration 375 px, catégories sombre) : pas de débordement, aucune erreur console.
- Étape 4 non testée : parcours admin complet, analyse avec une vraie clé Gemini, upload de capture, export CSV.

## 6. Ce qui n'a pas marché / reste en suspens

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

- **Étape 3, reste à faire ou à savoir** :
  - pas de limitation de débit sur les routes de connexion, d'inscription, de contact ou de newsletter (à traiter à l'étape 5) ;
  - l'inscription renvoie `email_taken` : un visiteur peut donc savoir si une adresse a déjà un compte (compromis volontaire pour un message clair) ;
  - pas de mot de passe oublié, pas de vérification d'e-mail, pas de modification du profil ni de suppression de compte (hors V1 ou étape 5) ;
  - la liste de favoris affichée sur un appareil non connecté ne suit pas l'utilisateur : elle reste locale jusqu'à la connexion ;
  - les facettes d'inspiration (style, palette…) gardent les valeurs anglaises de la base comme identifiants ; les libellés FR/EN sont dans `inspiration-labels.ts` ;
  - les collections ne peuvent contenir que des favoris (ajout depuis la liste des favoris) ;
  - l'animation de transition entre favoris non connectés et connectés n'est pas vérifiée à la main ;
  - messages de contact et inscriptions à la newsletter stockés, mais aucun écran pour les lire (admin, étape 4).

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

- Dans un Client Component, lire `event.currentTarget` après un `await` renvoie `null` : garder l'élément dans une variable avant l'appel réseau.
- Un `button[aria-pressed]` ne désigne pas forcément un favori : les puces de filtre utilisent aussi `aria-pressed`. Pour les tests, cibler `article button[aria-pressed]`.
- Les tags d'une fiche et ses tags visuels peuvent se répéter (« dark ») : toujours dédoublonner avant d'afficher.
- Les routes qui lisent les cookies (`currentUser`, `sessionToken`) ne doivent pas être appelées depuis le layout : les comptes passent par `GET /api/me` depuis le navigateur.
- Le cookie de session est posé dans une route handler (`setSessionCookie`), jamais dans un Server Component.
- Route handler qui lit les cookies dans un `try/catch` : appeler `await connection()` avant le `try`, sinon le build échoue (« During prerendering, `cookies()` rejects »).
- `readFile(path.join(MEDIA_DIR, …))` déclenche un avertissement de traçage Turbopack : ajouter `/*turbopackIgnore: true*/`.
- La base Postgres embarquée (port 5433) peut s'arrêter : le serveur de dev se fige sans erreur claire. Relancer `npm run db:start`.

## 8. Après la V1

Demander à l'utilisateur de faire **tous les tests possibles** (FR/EN, thèmes, mobile, filtres, favoris, comptes, admin, soumission IA avec vraie clé) et de renvoyer la liste complète des modifications à faire.
