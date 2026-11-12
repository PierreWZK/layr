// Insère ou met à jour les sites de db/seed/websites.json (publiés), par URL.
// La capture est rattachée si public/screenshots/<slug>.webp existe.
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL manquant (voir .env.example)');
  process.exit(1);
}

const sites = JSON.parse(await readFile(path.join('db', 'seed', 'websites.json'), 'utf8'));
const exists = (p) => access(p).then(() => true, () => false);

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  const { rows } = await client.query('select id, slug from categories');
  const categoryId = new Map(rows.map((r) => [r.slug, r.id]));
  const { rows: badgeRows } = await client.query('select slug from badges');
  const knownBadges = new Set(badgeRows.map((r) => r.slug));

  let count = 0;
  let missingShots = 0;
  // Ordre du fichier conservé pour « récemment ajoutés » (une seconde d'écart par entrée)
  for (const [index, site] of sites.entries()) {
    if (!categoryId.has(site.category)) throw new Error(`catégorie inconnue : ${site.category} (${site.slug})`);
    const badBadge = site.badges.find((b) => !knownBadges.has(b));
    if (badBadge) throw new Error(`badge inconnu : ${badBadge} (${site.slug})`);

    const shot = path.join('public', 'screenshots', `${site.slug}.webp`);
    const screenshot = (await exists(shot)) ? `/screenshots/${site.slug}.webp` : null;
    if (!screenshot) missingShots += 1;

    await client.query(
      `insert into websites (
         url, slug, domain, title, description_fr, description_en, screenshot_url, rating,
         ai_review_fr, ai_review_en, category_id, tags, badges, is_featured, status, content_type,
         inspiration_category, creator_name, visual_tags, visual_style, color_palette, layout_type,
         animation_type, industry, created_at, updated_at
       ) values (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'published', $15,
         $16, $17, $18, $19, $20, $21, $22, $23, now() - make_interval(secs => $24), now()
       )
       on conflict (url) do update set
         slug = excluded.slug, domain = excluded.domain, title = excluded.title,
         description_fr = excluded.description_fr, description_en = excluded.description_en,
         screenshot_url = coalesce(excluded.screenshot_url, websites.screenshot_url),
         rating = excluded.rating, ai_review_fr = excluded.ai_review_fr, ai_review_en = excluded.ai_review_en,
         category_id = excluded.category_id, tags = excluded.tags, badges = excluded.badges,
         is_featured = excluded.is_featured, content_type = excluded.content_type,
         inspiration_category = excluded.inspiration_category, creator_name = excluded.creator_name,
         visual_tags = excluded.visual_tags, visual_style = excluded.visual_style,
         color_palette = excluded.color_palette, layout_type = excluded.layout_type,
         animation_type = excluded.animation_type, industry = excluded.industry, updated_at = now()`,
      [
        site.url,
        site.slug,
        new URL(site.url).hostname.replace(/^www\./, ''),
        site.title,
        site.fr,
        site.en,
        screenshot,
        site.rating,
        site.review_fr,
        site.review_en,
        categoryId.get(site.category),
        site.tags,
        site.badges,
        Boolean(site.featured),
        site.type,
        site.inspiration ?? null,
        site.creator ?? null,
        site.visual_tags ?? [],
        site.style ?? null,
        site.palette ?? null,
        site.layout ?? null,
        site.animation ?? null,
        site.industry ?? null,
        sites.length - index,
      ],
    );
    count += 1;
  }
  console.log(`${count} sites insérés ou mis à jour, ${missingShots} sans capture`);
} finally {
  await client.end();
}
