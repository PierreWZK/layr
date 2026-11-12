import { currentUser } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { UUID, error, json } from "@/lib/api";

// Suppression d'une collection du compte connecté
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return error("unauthorized", 401);
  const { id } = await params;
  if (!UUID.test(id)) return error("not_found", 404);
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  await pool.query("delete from collections where id = $1 and user_id = $2", [id, user.id]);
  return json({ ok: true });
}
