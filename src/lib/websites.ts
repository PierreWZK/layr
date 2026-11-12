import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { getPool } from "./db";
import type { DiscoverFilters, SortKey } from "./discover-params";

export type BadgeInfo = { slug: string; name: string; color: string; description: string; count: number };
export type CategoryInfo = {
  slug: string;
  name: string;
  description: string;
  count: number;
  shots: string[];
};

export type Website = {
  id: string;
  slug: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  screenshot: string | null;
  rating: number | null;
  review: string | null;
  category: { slug: string; name: string } | null;
  badges: { slug: string; name: string; color: string }[];
  tags: string[];
  isFeatured: boolean;
  contentType: "resource" | "inspiration";
  inspirationCategory: string | null;
  creator: string | null;
  visualTags: string[];
  visualStyle: string | null;
  colorPalette: string | null;
  layoutType: string | null;
  animationType: string | null;
  industry: string | null;
  createdAt: string;
  saveCount: number;
  weekCount: number;
};

type Row = {
  id: string;
  slug: string;
  url: string;
  domain: string;
  title: string;
  title_fr: string | null;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  screenshot_url: string | null;
  rating: number | null;
  ai_review_fr: string | null;
  ai_review_en: string | null;
  tags: string[];
  badges: string[];
  is_featured: boolean;
  content_type: "resource" | "inspiration";
  inspiration_category: string | null;
  creator_name: string | null;
  visual_tags: string[];
  visual_style: string | null;
  color_palette: string | null;
  layout_type: string | null;
  animation_type: string | null;
  industry: string | null;
  created_at: Date;
  category_slug: string | null;
  category_name_fr: string | null;
  category_name_en: string | null;
  save_count: number;
  week_count: number;
};

const SELECT = `
  select w.id, w.slug, w.url, w.domain, w.title, w.title_fr, w.title_en,
    w.description_fr, w.description_en, w.screenshot_url, w.rating::float as rating,
    w.ai_review_fr, w.ai_review_en, w.tags, w.badges, w.is_featured, w.content_type,
    w.inspiration_category, w.creator_name, w.visual_tags, w.visual_style, w.color_palette,
    w.layout_type, w.animation_type, w.industry, w.created_at,
    c.slug as category_slug, c.name_fr as category_name_fr, c.name_en as category_name_en,
    coalesce(s.saves, 0)::int as save_count,
    coalesce(e.total, 0)::int as event_count,
    coalesce(e.week, 0)::int as week_count
  from websites w
  left join categories c on c.id = w.category_id
  left join lateral (select count(*) as saves from favorites f where f.website_id = w.id) s on true
  left join lateral (
    select count(*) as total,
           count(*) filter (where ev.created_at > now() - interval '7 days') as week
    from website_events ev where ev.website_id = w.id
  ) e on true
  where w.status = 'published'`;

type InternalSort = SortKey | "trending";

const ORDER: Record<InternalSort, string> = {
  curated: "w.is_featured desc, w.rating desc nulls last, w.created_at desc",
  rating: "w.rating desc nulls last, w.created_at desc",
  recent: "w.created_at desc",
  popular: "event_count desc, w.rating desc nulls last",
  saved: "save_count desc, w.rating desc nulls last",
  trending: "week_count desc, event_count desc, w.rating desc nulls last",
};

// Préfixes pour la recherche instantanée : « typo » trouve « typography »
function toPrefixQuery(q: string): string {
  const terms = q.toLowerCase().normalize("NFC").match(/[\p{L}\p{N}]+/gu) ?? [];
  return terms
    .slice(0, 6)
    .map((term) => `${term}:*`)
    .join(" & ");
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (m) => `\\${m}`);

export const listBadges = cache(async (locale: Locale): Promise<BadgeInfo[]> => {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{
    slug: string;
    name_fr: string;
    name_en: string;
    color: string;
    description_fr: string;
    description_en: string;
    count: number;
  }>(
    `select b.slug, b.name_fr, b.name_en, b.color, b.description_fr, b.description_en,
       (select count(*) from websites w where w.status = 'published' and b.slug = any(w.badges))::int as count
     from badges b order by b.id`,
  );
  return rows.map((r) => ({
    slug: r.slug,
    name: locale === "fr" ? r.name_fr : r.name_en,
    description: locale === "fr" ? r.description_fr : r.description_en,
    color: r.color,
    count: r.count,
  }));
});

export const listCategoriesWithCounts = cache(async (locale: Locale): Promise<CategoryInfo[]> => {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{
    slug: string;
    name_fr: string;
    name_en: string;
    description_fr: string;
    description_en: string;
    count: number;
    shots: string[] | null;
  }>(
    `select c.slug, c.name_fr, c.name_en, c.description_fr, c.description_en,
       count(w.id)::int as count,
       (array_agg(w.screenshot_url order by w.rating desc nulls last)
          filter (where w.screenshot_url is not null))[1:3] as shots
     from categories c
     left join websites w on w.category_id = c.id and w.status = 'published'
     group by c.id order by c.id`,
  );
  return rows.map((r) => ({
    slug: r.slug,
    name: locale === "fr" ? r.name_fr : r.name_en,
    description: locale === "fr" ? r.description_fr : r.description_en,
    count: r.count,
    shots: r.shots ?? [],
  }));
});

async function toWebsites(locale: Locale, rows: Row[]): Promise<Website[]> {
  const badges = new Map((await listBadges(locale)).map((b) => [b.slug, b]));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    url: r.url,
    domain: r.domain,
    title: (locale === "fr" ? r.title_fr : r.title_en) ?? r.title,
    description: (locale === "fr" ? r.description_fr : r.description_en) ?? "",
    screenshot: r.screenshot_url,
    rating: r.rating,
    review: locale === "fr" ? r.ai_review_fr : r.ai_review_en,
    category: r.category_slug
      ? { slug: r.category_slug, name: (locale === "fr" ? r.category_name_fr : r.category_name_en) ?? "" }
      : null,
    badges: r.badges
      .map((slug) => badges.get(slug))
      .filter((b): b is BadgeInfo => Boolean(b))
      .map(({ slug, name, color }) => ({ slug, name, color })),
    tags: r.tags,
    isFeatured: r.is_featured,
    contentType: r.content_type,
    inspirationCategory: r.inspiration_category,
    creator: r.creator_name,
    visualTags: r.visual_tags,
    visualStyle: r.visual_style,
    colorPalette: r.color_palette,
    layoutType: r.layout_type,
    animationType: r.animation_type,
    industry: r.industry,
    createdAt: r.created_at.toISOString(),
    saveCount: r.save_count,
    weekCount: r.week_count,
  }));
}

type QueryOptions = Partial<Pick<DiscoverFilters, "q" | "categories" | "badges" | "featured" | "free" | "premium">> & {
  sort?: InternalSort;
  type?: "resource" | "inspiration";
  minRating?: number;
  savedOnly?: boolean;
  excludeId?: string;
  limit?: number;
};

// null = base non configurée
export async function queryWebsites(locale: Locale, options: QueryOptions = {}): Promise<Website[] | null> {
  const pool = getPool();
  if (!pool) return null;

  const where: string[] = [];
  const values: unknown[] = [];
  const param = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  const q = options.q?.trim();
  if (q) {
    const like = param(`%${escapeLike(q)}%`);
    const tsQuery = toPrefixQuery(q);
    const ts = tsQuery ? `w.search_document @@ to_tsquery('simple', ${param(tsQuery)}) or ` : "";
    where.push(`(${ts}w.domain ilike ${like} or w.title ilike ${like}
      or c.name_fr ilike ${like} or c.name_en ilike ${like}
      or exists (select 1 from badges b where b.slug = any(w.badges) and (b.name_fr ilike ${like} or b.name_en ilike ${like}))
      or exists (select 1 from unnest(w.tags) t where t ilike ${like}))`);
  }
  if (options.categories?.length) where.push(`c.slug = any(${param(options.categories)})`);
  if (options.badges?.length) where.push(`w.badges && ${param(options.badges)}::text[]`);
  if (options.featured) where.push("w.is_featured");
  if (options.free) where.push(`'free' = any(w.badges)`);
  if (options.premium) where.push(`'premium' = any(w.badges)`);
  if (options.type) where.push(`w.content_type = ${param(options.type)}`);
  if (options.minRating) where.push(`w.rating >= ${param(options.minRating)}`);
  if (options.savedOnly) where.push("coalesce(s.saves, 0) > 0");
  if (options.excludeId) where.push(`w.id <> ${param(options.excludeId)}`);

  const sql = `${SELECT}${where.length ? ` and ${where.join(" and ")}` : ""}
    order by ${ORDER[options.sort ?? "curated"]}
    limit ${Math.min(Math.max(options.limit ?? 120, 1), 200)}`;

  const { rows } = await pool.query<Row>(sql, values);
  return toWebsites(locale, rows);
}

export async function getWebsiteBySlug(locale: Locale, slug: string): Promise<Website | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Row>(`${SELECT} and w.slug = $1 limit 1`, [slug]);
  const [site] = await toWebsites(locale, rows);
  return site ?? null;
}

// Même catégorie d'abord, puis tags en commun, puis note
export async function relatedWebsites(locale: Locale, site: Website, limit = 4): Promise<Website[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Row>(
    `${SELECT} and w.id <> $1
     order by (c.slug = $2) desc nulls last,
       cardinality(array(select unnest(w.tags) intersect select unnest($3::text[]))) desc,
       w.rating desc nulls last
     limit $4`,
    [site.id, site.category?.slug ?? "", site.tags, limit],
  );
  return toWebsites(locale, rows);
}

// Même site pour tout le monde sur une journée (heure de Paris), parmi les sites notés 8,5 et plus
export async function siteOfTheDay(locale: Locale, now = new Date()): Promise<Website | null> {
  const sites = await queryWebsites(locale, { minRating: 8.5, sort: "recent", limit: 200 });
  if (!sites?.length) return null;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(now);
  let hash = 2166136261;
  for (const char of day) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const sorted = [...sites].sort((a, b) => a.slug.localeCompare(b.slug));
  return sorted[Math.abs(hash) % sorted.length];
}

export async function catalogueStats(): Promise<{ sites: number; resources: number; inspiration: number } | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<{ sites: number; resources: number; inspiration: number }>(
    `select count(*)::int as sites,
       count(*) filter (where content_type = 'resource')::int as resources,
       count(*) filter (where content_type = 'inspiration')::int as inspiration
     from websites where status = 'published'`,
  );
  return rows[0];
}

export type Suggestions = {
  sites: { slug: string; title: string; domain: string; screenshot: string | null }[];
  categories: { slug: string; name: string }[];
  badges: { slug: string; name: string }[];
  tags: string[];
};

export async function suggest(locale: Locale, q: string): Promise<Suggestions | null> {
  const pool = getPool();
  if (!pool) return null;
  const term = q.trim();
  if (!term) return { sites: [], categories: [], badges: [], tags: [] };
  const like = `%${escapeLike(term)}%`;

  const [sites, categories, badges, tags] = await Promise.all([
    queryWebsites(locale, { q: term, sort: "rating", limit: 5 }),
    pool.query<{ slug: string; name_fr: string; name_en: string }>(
      `select slug, name_fr, name_en from categories where name_fr ilike $1 or name_en ilike $1 or slug ilike $1 limit 4`,
      [like],
    ),
    pool.query<{ slug: string; name_fr: string; name_en: string }>(
      `select slug, name_fr, name_en from badges where name_fr ilike $1 or name_en ilike $1 or slug ilike $1 limit 4`,
      [like],
    ),
    pool.query<{ tag: string }>(
      `select distinct t as tag from websites w, unnest(w.tags) t
       where w.status = 'published' and t ilike $1 order by t limit 5`,
      [like],
    ),
  ]);

  return {
    sites: (sites ?? []).map((s) => ({ slug: s.slug, title: s.title, domain: s.domain, screenshot: s.screenshot })),
    categories: categories.rows.map((r) => ({ slug: r.slug, name: locale === "fr" ? r.name_fr : r.name_en })),
    badges: badges.rows.map((r) => ({ slug: r.slug, name: locale === "fr" ? r.name_fr : r.name_en })),
    tags: tags.rows.map((r) => r.tag),
  };
}

// Renvoie l'URL d'origine si le site existe (pour la redirection /go/[slug])
export async function recordEvent(slug: string, kind: "view" | "visit"): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<{ url: string }>(
    `with site as (select id, url from websites where slug = $1 and status = 'published')
     , ins as (insert into website_events (website_id, kind) select id, $2 from site)
     select url from site`,
    [slug, kind],
  );
  return rows[0]?.url ?? null;
}
