import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { suggest } from "@/lib/websites";

// Suggestions instantanées : sites, catégories, badges, tags
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 100);
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : "en";
  try {
    const data = await suggest(locale, q);
    if (!data) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("search", error);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }
}
