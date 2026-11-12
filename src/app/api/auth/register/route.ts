import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { EMAIL, cleanText, error, json, readBody } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const email = cleanText(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = cleanText(body.displayName, 80) || null;

  if (!EMAIL.test(email)) return error("invalid_email", 400);
  if (password.length < 8 || password.length > 200) return error("weak_password", 400);

  const pool = getPool();
  if (!pool) return error("db_missing", 503);

  try {
    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query<{ id: string; created_at: Date }>(
      "insert into users (email, password_hash, display_name) values ($1, $2, $3) returning id, created_at",
      [email, passwordHash, displayName],
    );
    const user = rows[0];
    await setSessionCookie(await createSession(user.id));
    return json({
      user: { id: user.id, email, displayName, role: "visitor", createdAt: user.created_at.toISOString() },
    }, 201);
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return error("email_taken", 409);
    console.error("register", err);
    return error("register_failed", 500);
  }
}
