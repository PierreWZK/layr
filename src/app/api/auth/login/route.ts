import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { cleanText, error, json, readBody } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const email = cleanText(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";

  const pool = getPool();
  if (!pool) return error("db_missing", 503);

  try {
    const { rows } = await pool.query<{
      id: string;
      display_name: string | null;
      role: "visitor" | "admin";
      password_hash: string | null;
      created_at: Date;
    }>("select id, display_name, role, password_hash, created_at from users where email = $1", [email]);
    const user = rows[0];
    const valid = user?.password_hash ? await verifyPassword(password, user.password_hash) : false;
    if (!user || !valid) return error("invalid_credentials", 401);

    await setSessionCookie(await createSession(user.id));
    return json({
      user: { id: user.id, email, displayName: user.display_name, role: user.role, createdAt: user.created_at.toISOString() },
    });
  } catch (err) {
    console.error("login", err);
    return error("login_failed", 500);
  }
}
