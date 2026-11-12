import { adminUser } from "@/lib/admin";
import { saveTaxonomy } from "@/lib/admin-data";
import { cleanText, error, json, readBody } from "@/lib/api";

// Création ou modification d'une catégorie ou d'un badge (noms et descriptions FR/EN)
export async function POST(request: Request) {
  if (!(await adminUser())) return error("forbidden", 403);
  const body = await readBody(request);
  const kind = body?.kind === "badges" ? "badges" : body?.kind === "categories" ? "categories" : null;
  if (!body || !kind) return error("invalid_body", 400);
  const id = typeof body.id === "number" && Number.isInteger(body.id) ? body.id : undefined;
  const slug = cleanText(body.slug, 60).toLowerCase();
  const row = {
    id,
    slug,
    name_fr: cleanText(body.name_fr, 80),
    name_en: cleanText(body.name_en, 80),
    description_fr: cleanText(body.description_fr, 400),
    description_en: cleanText(body.description_en, 400),
    color: cleanText(body.color, 7),
  };
  if (!row.name_fr || !row.name_en) return error("missing_name", 400);
  if (!id && !/^[a-z0-9-]{2,60}$/.test(slug)) return error("invalid_slug", 400);
  try {
    await saveTaxonomy(kind, row);
    return json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return error("slug_taken", 409);
    console.error("taxonomy", err);
    return error("save_failed", 500);
  }
}
