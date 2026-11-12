import { adminUser } from "@/lib/admin";
import { listTaxonomy, siteIdByUrl } from "@/lib/admin-data";
import { captureSite, normalizePublicUrl } from "@/lib/capture";
import { GeminiError, analyzeWithGemini, type AnalysisError } from "@/lib/gemini";
import { saveScreenshot } from "@/lib/media";
import { emptySite, type SiteInput } from "@/lib/site-input";
import { error, json, readBody } from "@/lib/api";

// URL -> capture Playwright -> analyse Gemini -> brouillon modifiable (jamais publié ici)
export async function POST(request: Request) {
  if (!(await adminUser())) return error("forbidden", 403);
  const body = await readBody(request);
  let url: URL;
  try {
    url = await normalizePublicUrl(typeof body?.url === "string" ? body.url : "");
  } catch (err) {
    return error((err as Error).message, 400);
  }

  const capture = await captureSite(url);
  const screenshot = capture.image ? await saveScreenshot(capture.image, capture.domain).catch(() => null) : null;

  // Repli sans IA : ce que la page dit d'elle-même
  const fallback: SiteInput = {
    ...emptySite,
    url: url.href,
    title: capture.title.split(/\s[|–—-]\s/)[0].trim().slice(0, 120) || capture.domain,
    description_en: capture.description.slice(0, 600),
    screenshot_url: screenshot,
    status: "pending",
  };

  let draft = fallback;
  let aiError: AnalysisError | null = null;
  let aiDetail: string | null = null;
  try {
    const [categories, badges] = await Promise.all([listTaxonomy("categories"), listTaxonomy("badges")]);
    const analysis = await analyzeWithGemini(capture, {
      categories: categories.map((c) => ({ slug: c.slug, name: c.name_en })),
      badges: badges.map((b) => ({ slug: b.slug, name: b.name_en })),
    });
    draft = { ...fallback, ...analysis, title: analysis.title || fallback.title, url: url.href, screenshot_url: screenshot, status: "pending" };
  } catch (err) {
    aiError = err instanceof GeminiError ? err.code : "ai_failed";
    aiDetail = err instanceof Error ? err.message.slice(0, 300) : null;
    if (aiError === "ai_failed") console.error("analyze", err);
  }

  return json({
    draft,
    aiError,
    aiDetail,
    captureError: capture.error,
    existingId: await siteIdByUrl(url.href),
  });
}
