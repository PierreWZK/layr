import { currentUser } from "@/lib/auth";
import { json } from "@/lib/api";

// Utilisateur connecté (ou null) : lu à chaque chargement, jamais mis en cache
export async function GET() {
  try {
    return json({ user: await currentUser() });
  } catch (err) {
    console.error("me", err);
    return json({ user: null });
  }
}
