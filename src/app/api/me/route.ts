import { isAdmin } from "@/lib/admin";
import { currentUser } from "@/lib/auth";
import { json } from "@/lib/api";
import { connection } from "next/server";

// Utilisateur connecté (ou null) : lu à chaque chargement, jamais mis en cache.
// Le rôle renvoyé tient compte de ADMIN_EMAILS.
export async function GET() {
  // Hors du try : sinon le catch avale le rejet du prérendu et la route devient statique.
  await connection();
  try {
    const user = await currentUser();
    return json({ user: user ? { ...user, role: isAdmin(user) ? "admin" : "visitor" } : null });
  } catch (err) {
    console.error("me", err);
    return json({ user: null });
  }
}
