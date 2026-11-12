import { NextResponse, type NextRequest } from "next/server";
import { recordEvent } from "@/lib/websites";

const SLUG = /^[a-z0-9-]{1,80}$/;

// Ouverture d'une fiche (envoyée par la page, une fois par affichage)
export async function POST(request: NextRequest) {
  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (typeof slug !== "string" || !SLUG.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  try {
    const url = await recordEvent(slug, "view");
    return new NextResponse(null, { status: url ? 204 : 404 });
  } catch (error) {
    console.error("events", error);
    return NextResponse.json({ error: "event_failed" }, { status: 500 });
  }
}
