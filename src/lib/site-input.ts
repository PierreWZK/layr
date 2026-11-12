// Fiche telle que l'admin la saisit (création, édition, aperçu de l'analyse IA)
export const STATUSES = ["draft", "pending", "published", "rejected"] as const;
export type SiteStatus = (typeof STATUSES)[number];

export type SiteInput = {
  url: string;
  title: string;
  title_fr: string | null;
  title_en: string | null;
  description_fr: string;
  description_en: string;
  review_fr: string;
  review_en: string;
  screenshot_url: string | null;
  rating: number | null;
  category: string | null;
  tags: string[];
  badges: string[];
  is_featured: boolean;
  status: SiteStatus;
  content_type: "resource" | "inspiration";
  inspiration_category: string | null;
  creator_name: string | null;
  visual_tags: string[];
  visual_style: string | null;
  color_palette: string | null;
  layout_type: string | null;
  animation_type: string | null;
  industry: string | null;
};

export const emptySite: SiteInput = {
  url: "",
  title: "",
  title_fr: null,
  title_en: null,
  description_fr: "",
  description_en: "",
  review_fr: "",
  review_en: "",
  screenshot_url: null,
  rating: null,
  category: null,
  tags: [],
  badges: [],
  is_featured: false,
  status: "pending",
  content_type: "resource",
  inspiration_category: null,
  creator_name: null,
  visual_tags: [],
  visual_style: null,
  color_palette: null,
  layout_type: null,
  animation_type: null,
  industry: null,
};

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const optional = (value: unknown, max: number) => text(value, max) || null;
const list = (value: unknown, max: number) =>
  Array.isArray(value)
    ? [...new Set(value.map((v) => text(v, 40)).filter(Boolean))].slice(0, max)
    : typeof value === "string"
      ? [...new Set(value.split(",").map((v) => v.trim().slice(0, 40)).filter(Boolean))].slice(0, max)
      : [];

// Valide un corps de requête. Renvoie un code d'erreur traduisible, ou la fiche propre.
export function parseSiteInput(body: Record<string, unknown>): { error: string } | { data: SiteInput } {
  const url = text(body.url, 500);
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return { error: "invalid_url" };
  } catch {
    return { error: "invalid_url" };
  }
  const title = text(body.title, 120);
  if (!title) return { error: "missing_title" };
  const rating = body.rating === null || body.rating === "" || body.rating === undefined ? null : Number(body.rating);
  if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 10)) return { error: "invalid_rating" };
  const status = STATUSES.includes(body.status as SiteStatus) ? (body.status as SiteStatus) : "draft";
  const screenshot = optional(body.screenshot_url, 300);
  if (screenshot && !/^\/(screenshots|media)\/[a-z0-9-]+\.webp$/.test(screenshot)) return { error: "invalid_screenshot" };

  return {
    data: {
      url,
      title,
      title_fr: optional(body.title_fr, 120),
      title_en: optional(body.title_en, 120),
      description_fr: text(body.description_fr, 600),
      description_en: text(body.description_en, 600),
      review_fr: text(body.review_fr, 1500),
      review_en: text(body.review_en, 1500),
      screenshot_url: screenshot,
      rating: rating === null ? null : Math.round(rating * 10) / 10,
      category: optional(body.category, 80),
      tags: list(body.tags, 12).map((t) => t.toLowerCase()),
      badges: list(body.badges, 13),
      is_featured: body.is_featured === true,
      status,
      content_type: body.content_type === "inspiration" ? "inspiration" : "resource",
      inspiration_category: optional(body.inspiration_category, 80),
      creator_name: optional(body.creator_name, 120),
      visual_tags: list(body.visual_tags, 12),
      visual_style: optional(body.visual_style, 60),
      color_palette: optional(body.color_palette, 60),
      layout_type: optional(body.layout_type, 60),
      animation_type: optional(body.animation_type, 60),
      industry: optional(body.industry, 60),
    },
  };
}
