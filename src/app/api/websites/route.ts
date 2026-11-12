import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { getWebsitesBySlugs } from "@/lib/websites";

// Fiches résumées pour une liste de slugs (favoris, récemment vus, collections)
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : "en";
  const slugs = (request.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,80}$/.test(s))
    .slice(0, 200);
  try {
    const items = await getWebsitesBySlugs(locale, slugs);
    if (!items) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("websites", error);
    return NextResponse.json({ error: "websites_failed" }, { status: 500 });
  }
}
