import { currentUser } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { SLUG, UUID, error, json, readBody } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// Ajoute un site (depuis les favoris) à une collection
export async function POST(request: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const { id } = await params;
  const body = await readBody(request);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!UUID.test(id) || !SLUG.test(slug)) return error("invalid_body", 400);
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  await pool.query(
    `insert into collection_items (collection_id, website_id)
     select c.id, w.id from collections c, websites w
     where c.id = $1 and c.user_id = $2 and w.slug = $3 and w.status = 'published'
     on conflict do nothing`,
    [id, user.id, slug],
  );
  return json({ ok: true });
}

// Retire un site d'une collection
export async function DELETE(request: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const { id } = await params;
  const body = await readBody(request);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!UUID.test(id) || !SLUG.test(slug)) return error("invalid_body", 400);
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  await pool.query(
    `delete from collection_items ci using collections c, websites w
     where ci.collection_id = c.id and c.id = $1 and c.user_id = $2
       and w.id = ci.website_id and w.slug = $3`,
    [id, user.id, slug],
  );
  return json({ ok: true });
}
