import { isLocale } from "@/i18n/config";
import { getPool } from "@/lib/db";
import { EMAIL, cleanText, error, json, readBody } from "@/lib/api";

// Message de contact : stocké en base, lu dans l'admin (étape 4)
export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254).toLowerCase();
  const message = cleanText(body.message, 3000);
  if (!name) return error("invalid_name", 400);
  if (!EMAIL.test(email)) return error("invalid_email", 400);
  if (message.length < 10) return error("message_too_short", 400);
  const locale = isLocale(body.locale) ? body.locale : "en";
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  try {
    await pool.query(
      "insert into contact_messages (name, email, message, locale) values ($1, $2, $3, $4)",
      [name, email, message, locale],
    );
    return json({ ok: true }, 201);
  } catch (err) {
    console.error("contact", err);
    return error("contact_failed", 500);
  }
}
