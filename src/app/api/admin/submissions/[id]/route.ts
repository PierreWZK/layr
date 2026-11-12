import { adminUser } from "@/lib/admin";
import { setSubmissionStatus } from "@/lib/admin-data";
import { error, json, readBody } from "@/lib/api";

const STATUSES = ["new", "processed", "rejected"] as const;

// Change le statut d'une proposition de visiteur
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminUser())) return error("forbidden", 403);
  const { id } = await params;
  const body = await readBody(request);
  const status = STATUSES.find((s) => s === body?.status);
  if (!/^\d{1,18}$/.test(id) || !status) return error("invalid_body", 400);
  await setSubmissionStatus(id, status);
  return json({ ok: true });
}
