import { currentUser } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { cleanText, error, json, readBody } from "@/lib/api";

// Collections du compte, avec les slugs de leurs sites
export async function GET() {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  const { rows } = await pool.query<{ id: string; name: string; description: string; slugs: string[] }>(
    `select c.id, c.name, c.description,
       coalesce(array_agg(w.slug order by ci.created_at) filter (where w.slug is not null), '{}') as slugs
     from collections c
     left join collection_items ci on ci.collection_id = c.id
     left join websites w on w.id = ci.website_id and w.status = 'published'
     where c.user_id = $1
     group by c.id
     order by c.created_at desc`,
    [user.id],
  );
  return json({ collections: rows });
}

// Nouvelle collection
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const body = await readBody(request);
  const name = cleanText(body?.name, 80);
  if (!name) return error("invalid_name", 400);
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  const { rows } = await pool.query<{ id: string }>(
    "insert into collections (user_id, name) values ($1, $2) returning id",
    [user.id, name],
  );
  return json({ id: rows[0].id, name, slugs: [] }, 201);
}
