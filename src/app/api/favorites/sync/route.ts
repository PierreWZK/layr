import { currentUser } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { SLUG, error, json, readBody } from "@/lib/api";

// Fusionne les favoris locaux dans le compte (sans rien retirer), puis renvoie la liste complète
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const body = await readBody(request);
  const raw: unknown[] = Array.isArray(body?.entries) ? body.entries.slice(0, 500) : [];
  const entries = raw.flatMap((item) => {
    const e = item as { slug?: unknown; savedAt?: unknown } | null;
    const slug = typeof e?.slug === "string" && SLUG.test(e.slug) ? e.slug : null;
    const savedAt = typeof e?.savedAt === "string" && !Number.isNaN(Date.parse(e.savedAt)) ? e.savedAt : null;
    return slug && savedAt ? [{ slug, savedAt }] : [];
  });
  const pool = getPool();
  if (!pool) return error("db_missing", 503);

  if (entries.length) {
    await pool.query(
      `insert into favorites (user_id, website_id, created_at)
       select $1, w.id, x.saved_at
       from unnest($2::text[], $3::timestamptz[]) as x(slug, saved_at)
       join websites w on w.slug = x.slug and w.status = 'published'
       on conflict do nothing`,
      [user.id, entries.map((e) => e.slug), entries.map((e) => e.savedAt)],
    );
  }

  const { rows } = await pool.query<{ slug: string; created_at: Date }>(
    `select w.slug, f.created_at from favorites f
     join websites w on w.id = f.website_id
     where f.user_id = $1 and w.status = 'published'
     order by f.created_at desc`,
    [user.id],
  );
  return json({ entries: rows.map((r) => ({ slug: r.slug, savedAt: r.created_at.toISOString() })) });
}
