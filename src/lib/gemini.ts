import sharp from "sharp";
import { en } from "@/i18n/dictionaries/en";
import { facetValues } from "@/i18n/inspiration-labels";
import type { PageCapture } from "./capture";
import type { SiteInput } from "./site-input";

// Analyse d'un site par Gemini (palier gratuit). La clé reste côté serveur.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export type AnalysisError = "missing_key" | "quota" | "ai_failed";

export class GeminiError extends Error {
  constructor(public code: AnalysisError, detail?: string) {
    super(detail ?? code);
  }
}

type Taxonomy = { categories: { slug: string; name: string }[]; badges: { slug: string; name: string }[] };

const INSPIRATION = Object.keys(en.inspirationCategories);
const FACETS = {
  visual_style: facetValues("style"),
  color_palette: facetValues("palette"),
  layout_type: facetValues("layout"),
  animation_type: facetValues("animation"),
  industry: facetValues("industry"),
};

function schema(taxonomy: Taxonomy) {
  const text = { type: "STRING" };
  const choice = (values: string[]) => ({ type: "STRING", enum: values });
  return {
    type: "OBJECT",
    properties: {
      title: text,
      description_fr: text,
      description_en: text,
      review_fr: text,
      review_en: text,
      category: choice(taxonomy.categories.map((c) => c.slug)),
      badges: { type: "ARRAY", items: choice(taxonomy.badges.map((b) => b.slug)) },
      tags: { type: "ARRAY", items: text },
      content_type: choice(["resource", "inspiration"]),
      inspiration_category: choice(["none", ...INSPIRATION]),
      creator_name: text,
      visual_style: choice(FACETS.visual_style),
      color_palette: choice(FACETS.color_palette),
      layout_type: choice(FACETS.layout_type),
      animation_type: choice(FACETS.animation_type),
      industry: choice(FACETS.industry),
      rating: { type: "NUMBER" },
    },
    required: [
      "title", "description_fr", "description_en", "review_fr", "review_en", "category", "badges", "tags",
      "content_type", "inspiration_category", "visual_style", "color_palette", "layout_type", "animation_type",
      "industry", "rating",
    ],
  };
}

function prompt(capture: PageCapture, taxonomy: Taxonomy) {
  return [
    "You are the editor of LayR, a curated, bilingual (French/English) index of well-designed websites and creative resources.",
    "Analyse the attached screenshot and the page data, then fill the JSON schema.",
    "Rules:",
    "- description_fr / description_en: one or two factual sentences on what the site is and who it is for. No marketing superlatives.",
    "- review_fr / review_en: a short editorial critique (3 to 5 sentences) covering visual design, typography, layout, interaction and UX/UI quality, with one honest weakness.",
    "- French must read as natural French written by a French editor, not a translation.",
    "- rating: editorial score out of 10 with one decimal. Calibrate: most good sites 6.5 to 8.5, only exceptional work 9 or more.",
    "- content_type: 'resource' for tools, libraries, references and services; 'inspiration' for portfolios, studios, agencies, showcases and experiments.",
    "- inspiration_category: 'none' for resources.",
    "- tags: 3 to 6 short lowercase English keywords.",
    "- badges: only those that clearly apply (0 to 4).",
    "- creator_name: studio, agency or person behind the site if visible, otherwise empty.",
    `Categories: ${taxonomy.categories.map((c) => `${c.slug} (${c.name})`).join(", ")}.`,
    `Badges: ${taxonomy.badges.map((b) => `${b.slug} (${b.name})`).join(", ")}.`,
    "",
    `URL: ${capture.url}`,
    `Page title: ${capture.title}`,
    `Meta description: ${capture.description}`,
    `Page language: ${capture.lang || "unknown"}`,
    `Visible text (excerpt): ${capture.text.slice(0, 3000)}`,
  ].join("\n");
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const oneOf = (value: unknown, allowed: string[]) => (typeof value === "string" && allowed.includes(value) ? value : null);

export async function analyzeWithGemini(capture: PageCapture, taxonomy: Taxonomy): Promise<Partial<SiteInput>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("missing_key");

  const parts: unknown[] = [{ text: prompt(capture, taxonomy) }];
  if (capture.image) {
    const jpeg = await sharp(capture.image).resize(1280, 800, { fit: "cover", position: "top" }).jpeg({ quality: 70 }).toBuffer();
    parts.push({ inline_data: { mime_type: "image/jpeg", data: jpeg.toString("base64") } });
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema(taxonomy), temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (res.status === 429) throw new GeminiError("quota");
  if (!res.ok) throw new GeminiError("ai_failed", `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  let out: Record<string, unknown>;
  try {
    out = JSON.parse(raw);
  } catch {
    throw new GeminiError("ai_failed", "invalid_json");
  }

  const badgeSlugs = taxonomy.badges.map((b) => b.slug);
  const rating = typeof out.rating === "number" ? Math.round(Math.min(Math.max(out.rating, 0), 10) * 10) / 10 : null;
  const contentType = out.content_type === "inspiration" ? "inspiration" : "resource";

  // On ne garde que des valeurs connues : l'IA propose, l'admin valide
  return {
    title: str(out.title, 120),
    description_fr: str(out.description_fr, 600),
    description_en: str(out.description_en, 600),
    review_fr: str(out.review_fr, 1500),
    review_en: str(out.review_en, 1500),
    category: oneOf(out.category, taxonomy.categories.map((c) => c.slug)),
    badges: Array.isArray(out.badges) ? [...new Set(out.badges.filter((b): b is string => badgeSlugs.includes(b as string)))].slice(0, 6) : [],
    tags: Array.isArray(out.tags) ? out.tags.map((t) => str(t, 30).toLowerCase()).filter(Boolean).slice(0, 8) : [],
    content_type: contentType,
    inspiration_category: contentType === "inspiration" ? oneOf(out.inspiration_category, INSPIRATION) : null,
    creator_name: str(out.creator_name, 120) || null,
    visual_style: oneOf(out.visual_style, FACETS.visual_style),
    color_palette: oneOf(out.color_palette, FACETS.color_palette),
    layout_type: oneOf(out.layout_type, FACETS.layout_type),
    animation_type: oneOf(out.animation_type, FACETS.animation_type),
    industry: oneOf(out.industry, FACETS.industry),
    rating,
  };
}
