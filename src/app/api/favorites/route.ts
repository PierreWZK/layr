import { currentUser } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { SLUG, error, json, readBody } from "@/lib/api";

type Entry = { slug: string; savedAt: string };

async function listFavorites(userId: string): Promise<Entry[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{ slug: string; created_at: Date }>(
    `select w.slug, f.created_at from favorites f
     join websites w on w.id = f.website_id
     where f.user_id = $1 and w.status = 'published'
     order by f.created_at desc`,
    [userId],
  );
  return rows.map((r) => ({ slug: r.slug, savedAt: r.created_at.toISOString() }));
}

// Favoris du compte connecté
export async function GET() {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  return json({ entries: await listFavorites(user.id) });
}

// Ajout ou retrait d'un favori
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const body = await readBody(request);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!SLUG.test(slug) || typeof body?.saved !== "boolean") return error("invalid_body", 400);
  const pool = getPool();
  if (!pool) return error("db_missing", 503);

  if (body.saved) {
    await pool.query(
      `insert into favorites (user_id, website_id)
       select $1, w.id from websites w where w.slug = $2 and w.status = 'published'
       on conflict do nothing`,
      [user.id, slug],
    );
  } else {
    await pool.query(
      `delete from favorites f using websites w
       where f.website_id = w.id and w.slug = $2 and f.user_id = $1`,
      [user.id, slug],
    );
  }
  return json({ ok: true });
}
