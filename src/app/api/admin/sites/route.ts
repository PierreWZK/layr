import { adminUser } from "@/lib/admin";
import { createSite } from "@/lib/admin-data";
import { parseSiteInput } from "@/lib/site-input";
import { error, json, readBody } from "@/lib/api";

// Création d'une fiche (depuis l'aperçu IA ou la saisie manuelle)
export async function POST(request: Request) {
  if (!(await adminUser())) return error("forbidden", 403);
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const parsed = parseSiteInput(body);
  if ("error" in parsed) return error(parsed.error, 400);
  try {
    return json(await createSite(parsed.data), 201);
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return error("url_taken", 409);
    console.error("admin create site", err);
    return error("save_failed", 500);
  }
}
