import { getPool } from "@/lib/db";
import { EMAIL, cleanText, error, json, readBody } from "@/lib/api";
import { isLocale } from "@/i18n/config";

// Inscription à la liste : stockée en base, aucun envoi en V1 (export CSV dans l'admin, étape 4)
export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const email = cleanText(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return error("invalid_email", 400);
  const locale = isLocale(body.locale) ? body.locale : "en";
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  try {
    await pool.query(
      "insert into newsletter_subscribers (email, locale) values ($1, $2) on conflict (email) do nothing",
      [email, locale],
    );
    return json({ ok: true }, 201);
  } catch (err) {
    console.error("newsletter", err);
    return error("newsletter_failed", 500);
  }
}
