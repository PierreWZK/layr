import { NextResponse, type NextRequest } from "next/server";
import { recordEvent } from "@/lib/websites";

const SLUG = /^[a-z0-9-]{1,80}$/;

// Compte la visite puis redirige vers le site d'origine (URL lue en base, jamais depuis la requête)
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG.test(slug)) return NextResponse.redirect(new URL("/", request.url));
  try {
    const url = await recordEvent(slug, "visit");
    return NextResponse.redirect(url ?? new URL("/", request.url), 302);
  } catch (error) {
    console.error("go", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
