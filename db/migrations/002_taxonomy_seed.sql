-- Catégories et badges de départ (FR/EN). Idempotent : relançable sans doublons.

insert into categories (slug, name_fr, name_en, description_fr, description_en) values
  ('ux-ui-design', 'Design UX/UI', 'UX/UI Design', 'Parcours, interfaces et décisions d''interaction.', 'Flows, interfaces and interaction decisions.'),
  ('web-design', 'Web design', 'Web Design', 'Sites conçus dans leur ensemble, de la grille au détail.', 'Whole websites, from grid to detail.'),
  ('graphic-design', 'Graphisme', 'Graphic Design', 'Composition, typographie et langage visuel imprimé ou numérique.', 'Composition, typography and visual language in print or screen.'),
  ('branding', 'Identité de marque', 'Branding', 'Systèmes d''identité, logotypes et marques.', 'Identity systems, logotypes and brands.'),
  ('typography', 'Typographie', 'Typography', 'Caractères, mise en page et échelles typographiques.', 'Typefaces, page setting and type scales.'),
  ('design-systems', 'Systèmes de design', 'Design Systems', 'Bibliothèques de composants, tokens et documentation.', 'Component libraries, tokens and documentation.'),
  ('wireframes', 'Maquettes filaires', 'Wireframes', 'Structures, squelettes et plans d''écran.', 'Structures, skeletons and screen plans.'),
  ('mockups', 'Mockups', 'Mockups', 'Présentations réalistes de projets d''interface.', 'Realistic presentations of interface projects.'),
  ('prototyping', 'Prototypage', 'Prototyping', 'Prototypes interactifs et outils pour les tester.', 'Interactive prototypes and tools to test them.'),
  ('motion-design', 'Motion design', 'Motion Design', 'Mouvement, transitions et animation d''interface.', 'Movement, transitions and interface animation.'),
  ('3d-design', 'Design 3D', '3D Design', 'Objets, scènes et expériences tridimensionnelles.', 'Objects, scenes and three-dimensional experiences.'),
  ('illustrations', 'Illustrations', 'Illustrations', 'Dessin, pictogrammes et univers graphiques.', 'Drawing, pictograms and graphic worlds.'),
  ('icons', 'Icônes', 'Icons', 'Jeux d''icônes, bibliothèques et grilles.', 'Icon sets, libraries and grids.'),
  ('ai-tools', 'Outils IA', 'AI Tools', 'Outils qui génèrent, aident ou transforment le design.', 'Tools that generate, assist or transform design.'),
  ('developer-tools', 'Outils développeurs', 'Developer Tools', 'Utilitaires pour construire et vérifier les interfaces.', 'Utilities to build and check interfaces.'),
  ('creative-resources', 'Ressources créatives', 'Creative Resources', 'Ressources, textures, polices et références utiles.', 'Resources, textures, fonts and useful references.')
on conflict (slug) do update set
  name_fr = excluded.name_fr,
  name_en = excluded.name_en,
  description_fr = excluded.description_fr,
  description_en = excluded.description_en;

insert into badges (slug, name_fr, name_en, color, icon, description_fr, description_en) values
  ('editors-pick', 'Choix de la rédaction', 'Editor''s Pick', '#C8792C', 'star', 'Sélection coup de cœur de la rédaction.', 'Hand-picked favourite of the editorial team.'),
  ('free', 'Gratuit', 'Free', '#5B4632', 'gift', 'Accessible sans payer.', 'Available without payment.'),
  ('premium', 'Premium', 'Premium', '#171717', 'crown', 'Accès payant ou abonnement requis pour l''essentiel.', 'Paid access or subscription needed for the core.'),
  ('open-source', 'Open source', 'Open Source', '#5B4632', 'code', 'Code source public et réutilisable.', 'Public, reusable source code.'),
  ('ai-powered', 'Propulsé par l''IA', 'AI Powered', '#C8792C', 'sparkles', 'Fonctionnalité centrale basée sur l''intelligence artificielle.', 'Core feature built on artificial intelligence.'),
  ('trending', 'Tendance', 'Trending', '#C8792C', 'flame', 'Beaucoup de mouvement cette semaine.', 'A lot of attention this week.'),
  ('new', 'Nouveau', 'New', '#F4D9A0', 'spark', 'Ajouté récemment.', 'Recently added.'),
  ('best-ux', 'Meilleur UX', 'Best UX', '#5B4632', 'route', 'Parcours et clarté exemplaires.', 'Exemplary flow and clarity.'),
  ('best-ui', 'Meilleure UI', 'Best UI', '#5B4632', 'layers', 'Interface soignée au détail près.', 'Interface crafted down to the detail.'),
  ('interactive', 'Interactif', 'Interactive', '#C8792C', 'cursor', 'Expérience qui répond au geste et au curseur.', 'Experience that responds to gesture and cursor.'),
  ('inspiration', 'Inspiration', 'Inspiration', '#F4D9A0', 'eye', 'Référence visuelle avant tout.', 'Visual reference first.'),
  ('free-resource', 'Ressource gratuite', 'Free Resource', '#5B4632', 'download', 'Ressource téléchargeable sans frais.', 'Downloadable resource at no cost.'),
  ('paid-resource', 'Ressource payante', 'Paid Resource', '#171717', 'tag', 'Ressource vendue ou sous licence.', 'Resource sold or under licence.')
on conflict (slug) do update set
  name_fr = excluded.name_fr,
  name_en = excluded.name_en,
  color = excluded.color,
  icon = excluded.icon,
  description_fr = excluded.description_fr,
  description_en = excluded.description_en;
