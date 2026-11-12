import { currentUser, type CurrentUser } from "./auth";

// Admin : rôle 'admin' en base, ou e-mail listé dans ADMIN_EMAILS (séparés par des virgules)
export function isAdmin(user: CurrentUser | null): user is CurrentUser {
  if (!user) return false;
  if (user.role === "admin") return true;
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(user.email.toLowerCase());
}

export async function adminUser(): Promise<CurrentUser | null> {
  const user = await currentUser();
  return isAdmin(user) ? user : null;
}
