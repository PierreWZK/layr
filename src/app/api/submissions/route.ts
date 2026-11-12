import { isLocale } from "@/i18n/config";
import { getPool } from "@/lib/db";
import { EMAIL, cleanText, error, json, readBody } from "@/lib/api";

// Proposition d'un site par un visiteur : stockée, puis analysée et validée par l'admin
export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const raw = cleanText(body.url, 500);
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) throw new Error();
  } catch {
    return error("invalid_url", 400);
  }
  const email = cleanText(body.email, 254).toLowerCase();
  if (email && !EMAIL.test(email)) return error("invalid_email", 400);
  const note = cleanText(body.note, 1000);
  const locale = isLocale(body.locale) ? body.locale : "en";
  const pool = getPool();
  if (!pool) return error("db_missing", 503);
  try {
    await pool.query("insert into submissions (url, email, note, locale) values ($1, $2, $3, $4)", [
      url.href,
      email || null,
      note,
      locale,
    ]);
    return json({ ok: true }, 201);
  } catch (err) {
    console.error("submission", err);
    return error("submission_failed", 500);
  }
}
