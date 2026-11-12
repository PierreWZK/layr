import { clearSessionCookie, deleteSession, sessionToken } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST() {
  const token = await sessionToken();
  if (token) await deleteSession(token);
  await clearSessionCookie();
  return json({ ok: true });
}
