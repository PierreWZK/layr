import { adminUser } from "@/lib/admin";
import { deleteSite, patchSite, updateSite } from "@/lib/admin-data";
import { STATUSES, parseSiteInput, type SiteStatus } from "@/lib/site-input";
import { UUID, error, json, readBody } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

async function guard(params: Params["params"]) {
  if (!(await adminUser())) return { response: error("forbidden", 403) };
  const { id } = await params;
  if (!UUID.test(id)) return { response: error("not_found", 404) };
  return { id };
}

// Mise à jour complète de la fiche
export async function PUT(request: Request, { params }: Params) {
  const g = await guard(params);
  if (!g.id) return g.response;
  const body = await readBody(request);
  if (!body) return error("invalid_body", 400);
  const parsed = parseSiteInput(body);
  if ("error" in parsed) return error(parsed.error, 400);
  try {
    return (await updateSite(g.id, parsed.data)) ? json({ ok: true }) : error("not_found", 404);
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return error("url_taken", 409);
    console.error("admin update site", err);
    return error("save_failed", 500);
  }
}

// Actions rapides : statut (publier, refuser…) et mise en avant
export async function PATCH(request: Request, { params }: Params) {
  const g = await guard(params);
  if (!g.id) return g.response;
  const body = await readBody(request);
  const status = STATUSES.includes(body?.status as SiteStatus) ? (body?.status as SiteStatus) : undefined;
  const featured = typeof body?.is_featured === "boolean" ? body.is_featured : undefined;
  if (!status && featured === undefined) return error("invalid_body", 400);
  await patchSite(g.id, { status, is_featured: featured });
  return json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const g = await guard(params);
  if (!g.id) return g.response;
  await deleteSite(g.id);
  return json({ ok: true });
}
