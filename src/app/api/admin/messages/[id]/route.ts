import { adminUser } from "@/lib/admin";
import { setMessageRead } from "@/lib/admin-data";
import { error, json, readBody } from "@/lib/api";

// Marque un message de contact comme lu / non lu
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminUser())) return error("forbidden", 403);
  const { id } = await params;
  const body = await readBody(request);
  if (!/^\d{1,18}$/.test(id) || typeof body?.read !== "boolean") return error("invalid_body", 400);
  await setMessageRead(id, body.read);
  return json({ ok: true });
}
