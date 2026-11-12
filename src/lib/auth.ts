import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getPool } from "./db";

// Comptes maison : mot de passe en scrypt, session par jeton opaque dans un cookie httpOnly
export const SESSION_COOKIE = "layr-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: "visitor" | "admin";
  createdAt: string;
};

function derive(password: string, salt: Buffer, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, length, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string): Promise<string> {
  const pool = getPool();
  if (!pool) throw new Error("database_not_configured");
  const token = randomBytes(32).toString("base64url");
  await pool.query(
    "insert into sessions (user_id, token_hash, expires_at) values ($1, $2, now() + interval '30 days')",
    [userId, hashToken(token)],
  );
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query("delete from sessions where token_hash = $1", [hashToken(token)]);
}

// Lit le cookie de session. À appeler uniquement dans une route ou un rendu dynamique.
export async function currentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const pool = getPool();
  if (!token || !pool) return null;
  const { rows } = await pool.query<{
    id: string;
    email: string;
    display_name: string | null;
    role: "visitor" | "admin";
    created_at: Date;
  }>(
    `select u.id, u.email, u.display_name, u.role, u.created_at
     from sessions s join users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  };
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
