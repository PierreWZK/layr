import { getPool } from "./db";
import type { SiteInput, SiteStatus } from "./site-input";

// Requêtes réservées à l'admin. Toutes supposent que l'appelant a déjà vérifié le rôle.
function pool() {
  const p = getPool();
  if (!p) throw new Error("database_not_configured");
  return p;
}

export type AdminStats = {
  published: number;
  pending: number;
  drafts: number;
  users: number;
  subscribers: number;
  unreadMessages: number;
  newSubmissions: number;
};

export async function adminStats(): Promise<AdminStats> {
  const { rows } = await pool().query<AdminStats>(
    `select
       (select count(*) from websites where status = 'published')::int as published,
       (select count(*) from websites where status = 'pending')::int as pending,
       (select count(*) from websites where status = 'draft')::int as drafts,
       (select count(*) from users)::int as users,
       (select count(*) from newsletter_subscribers)::int as subscribers,
       (select count(*) from contact_messages where read_at is null)::int as "unreadMessages",
       (select count(*) from submissions where status = 'new')::int as "newSubmissions"`,
  );
  return rows[0];
}

export type AdminSiteRow = {
  id: string;
  slug: string;
  title: string;
  domain: string;
  status: SiteStatus;
  content_type: "resource" | "inspiration";
  rating: number | null;
  is_featured: boolean;
  screenshot_url: string | null;
  category_slug: string | null;
  updated_at: string;
};

export async function listAdminSites(q: string, status: string): Promise<AdminSiteRow[]> {
  const values: unknown[] = [];
  const where: string[] = [];
  if (q) {
    values.push(`%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`);
    where.push(`(w.title ilike $${values.length} or w.domain ilike $${values.length} or w.slug ilike $${values.length})`);
  }
  if (["draft", "pending", "published", "rejected"].includes(status)) {
    values.push(status);
    where.push(`w.status = $${values.length}`);
  }
  const { rows } = await pool().query<Omit<AdminSiteRow, "updated_at"> & { updated_at: Date }>(
    `select w.id, w.slug, w.title, w.domain, w.status, w.content_type, w.rating::float as rating, w.is_featured,
       w.screenshot_url, c.slug as category_slug, w.updated_at
     from websites w left join categories c on c.id = w.category_id
     ${where.length ? `where ${where.join(" and ")}` : ""}
     order by (w.status = 'pending') desc, w.updated_at desc
     limit 400`,
    values,
  );
  return rows.map((r) => ({ ...r, updated_at: r.updated_at.toISOString() }));
}

export async function getAdminSite(id: string): Promise<(SiteInput & { id: string; slug: string }) | null> {
  const { rows } = await pool().query(
    `select w.id, w.slug, w.url, w.title, w.title_fr, w.title_en, coalesce(w.description_fr, '') as description_fr,
       coalesce(w.description_en, '') as description_en, coalesce(w.ai_review_fr, '') as review_fr,
       coalesce(w.ai_review_en, '') as review_en, w.screenshot_url, w.rating::float as rating, c.slug as category,
       w.tags, w.badges, w.is_featured, w.status, w.content_type, w.inspiration_category, w.creator_name,
       w.visual_tags, w.visual_style, w.color_palette, w.layout_type, w.animation_type, w.industry
     from websites w left join categories c on c.id = w.category_id where w.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

function slugBase(input: SiteInput): string {
  const host = new URL(input.url).hostname.replace(/^www\./, "");
  return host.replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "site";
}

async function uniqueSlug(base: string): Promise<string> {
  const { rows } = await pool().query<{ slug: string }>("select slug from websites where slug = $1 or slug like $2", [base, `${base}-%`]);
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const COLUMNS = `url, domain, title, title_fr, title_en, description_fr, description_en, ai_review_fr, ai_review_en,
  screenshot_url, rating, category_id, tags, badges, is_featured, status, content_type, inspiration_category,
  creator_name, visual_tags, visual_style, color_palette, layout_type, animation_type, industry`;

function columnValues(input: SiteInput): unknown[] {
  return [
    input.url,
    new URL(input.url).hostname.replace(/^www\./, ""),
    input.title,
    input.title_fr,
    input.title_en,
    input.description_fr || null,
    input.description_en || null,
    input.review_fr || null,
    input.review_en || null,
    input.screenshot_url,
    input.rating,
    input.category,
    input.tags,
    input.badges,
    input.is_featured,
    input.status,
    input.content_type,
    input.content_type === "inspiration" ? input.inspiration_category : null,
    input.creator_name,
    input.visual_tags,
    input.visual_style,
    input.color_palette,
    input.layout_type,
    input.animation_type,
    input.industry,
  ];
}

// $12 = slug de catégorie, converti en id
const PLACEHOLDERS = Array.from({ length: 25 }, (_, i) =>
  i === 11 ? "(select id from categories where slug = $12)" : `$${i + 1}`,
).join(", ");

export async function createSite(input: SiteInput): Promise<{ id: string; slug: string }> {
  const slug = await uniqueSlug(slugBase(input));
  const { rows } = await pool().query<{ id: string }>(
    `insert into websites (${COLUMNS}, slug) values (${PLACEHOLDERS}, $26) returning id`,
    [...columnValues(input), slug],
  );
  return { id: rows[0].id, slug };
}

export async function updateSite(id: string, input: SiteInput): Promise<boolean> {
  const assignments = COLUMNS.split(",")
    .map((c) => c.trim())
    .map((column, i) => `${column} = ${i === 11 ? "(select id from categories where slug = $12)" : `$${i + 1}`}`)
    .join(", ");
  const { rowCount } = await pool().query(`update websites set ${assignments}, updated_at = now() where id = $26`, [
    ...columnValues(input),
    id,
  ]);
  return (rowCount ?? 0) > 0;
}

export async function patchSite(id: string, patch: { status?: SiteStatus; is_featured?: boolean }): Promise<void> {
  if (patch.status) await pool().query("update websites set status = $1, updated_at = now() where id = $2", [patch.status, id]);
  if (typeof patch.is_featured === "boolean") {
    await pool().query("update websites set is_featured = $1, updated_at = now() where id = $2", [patch.is_featured, id]);
  }
}

export async function deleteSite(id: string): Promise<void> {
  await pool().query("delete from websites where id = $1", [id]);
}

export async function siteIdByUrl(url: string): Promise<string | null> {
  const { rows } = await pool().query<{ id: string }>("select id from websites where url = $1", [url]);
  return rows[0]?.id ?? null;
}

export type SubmissionRow = { id: string; url: string; email: string | null; note: string; locale: string; status: string; created_at: string };

export async function listSubmissions(): Promise<SubmissionRow[]> {
  const { rows } = await pool().query(
    `select id::text, url, email, note, locale, status, created_at from submissions
     order by (status = 'new') desc, created_at desc limit 300`,
  );
  return rows.map((r) => ({ ...r, created_at: (r.created_at as Date).toISOString() }));
}

export async function setSubmissionStatus(id: string, status: "new" | "processed" | "rejected"): Promise<void> {
  await pool().query("update submissions set status = $1 where id = $2", [status, id]);
}

export type MessageRow = { id: string; name: string; email: string; message: string; locale: string; read: boolean; created_at: string };

export async function listMessages(): Promise<MessageRow[]> {
  const { rows } = await pool().query(
    `select id::text, name, email, message, locale, read_at is not null as read, created_at from contact_messages
     order by (read_at is null) desc, created_at desc limit 300`,
  );
  return rows.map((r) => ({ ...r, created_at: (r.created_at as Date).toISOString() }));
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  await pool().query(`update contact_messages set read_at = ${read ? "now()" : "null"} where id = $1`, [id]);
}

export type SubscriberRow = { email: string; locale: string; created_at: string };

export async function listSubscribers(): Promise<SubscriberRow[]> {
  const { rows } = await pool().query("select email, locale, created_at from newsletter_subscribers order by created_at desc");
  return rows.map((r) => ({ ...r, created_at: (r.created_at as Date).toISOString() }));
}

export type TaxonomyRow = {
  id: number;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  color?: string;
};

export async function listTaxonomy(kind: "categories" | "badges"): Promise<TaxonomyRow[]> {
  const extra = kind === "badges" ? ", color" : "";
  const { rows } = await pool().query<TaxonomyRow>(
    `select id, slug, name_fr, name_en, description_fr, description_en${extra} from ${kind} order by id`,
  );
  return rows;
}

export async function saveTaxonomy(kind: "categories" | "badges", row: Omit<TaxonomyRow, "id"> & { id?: number }): Promise<void> {
  const p = pool();
  // Le slug n'est jamais modifié après création : les sites référencent les badges par slug
  const base = [row.slug, row.name_fr, row.name_en, row.description_fr, row.description_en];
  const texts = [row.name_fr, row.name_en, row.description_fr, row.description_en];
  if (kind === "badges") {
    const color = /^#[0-9a-f]{6}$/i.test(row.color ?? "") ? row.color : "#5B4632";
    if (row.id) {
      await p.query(
        "update badges set name_fr = $1, name_en = $2, description_fr = $3, description_en = $4, color = $5 where id = $6",
        [...texts, color, row.id],
      );
    } else {
      await p.query(
        "insert into badges (slug, name_fr, name_en, description_fr, description_en, color) values ($1, $2, $3, $4, $5, $6)",
        [...base, color],
      );
    }
    return;
  }
  if (row.id) {
    await p.query(
      "update categories set name_fr = $1, name_en = $2, description_fr = $3, description_en = $4 where id = $5",
      [...texts, row.id],
    );
  } else {
    await p.query("insert into categories (slug, name_fr, name_en, description_fr, description_en) values ($1, $2, $3, $4, $5)", base);
  }
}
