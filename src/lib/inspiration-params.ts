import { SORT_KEYS, type SortKey } from "./discover-params";

// Filtres de la page Inspiration (client et serveur). Valeurs multiples séparées par des virgules.
export const INSPIRATION_KEYS = ["category", "style", "palette", "layout", "animation", "industry"] as const;
export type InspirationKey = (typeof INSPIRATION_KEYS)[number];
export const MIN_RATINGS = [0, 7, 8, 9] as const;

export type InspirationFilters = Record<InspirationKey, string[]> & {
  minRating: number;
  sort: SortKey;
};

export const emptyInspirationFilters: InspirationFilters = {
  category: [],
  style: [],
  palette: [],
  layout: [],
  animation: [],
  industry: [],
  minRating: 0,
  sort: "curated",
};

type ParamSource = Record<string, string | string[] | undefined>;

const read = (source: ParamSource, key: string) => {
  const value = source[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
};

const list = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length <= 80)
    .slice(0, 20);

export function parseInspirationFilters(source: ParamSource): InspirationFilters {
  const sort = read(source, "sort");
  const minRating = Number(read(source, "rating"));
  return {
    category: list(read(source, "category")),
    style: list(read(source, "style")),
    palette: list(read(source, "palette")),
    layout: list(read(source, "layout")),
    animation: list(read(source, "animation")),
    industry: list(read(source, "industry")),
    minRating: (MIN_RATINGS as readonly number[]).includes(minRating) ? minRating : 0,
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortKey) : "curated",
  };
}

export function inspirationSearchString(filters: InspirationFilters): string {
  const params = new URLSearchParams();
  for (const key of INSPIRATION_KEYS) {
    if (filters[key].length) params.set(key === "category" ? "category" : key, filters[key].join(","));
  }
  if (filters.minRating) params.set("rating", String(filters.minRating));
  if (filters.sort !== "curated") params.set("sort", filters.sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function activeInspirationCount(filters: InspirationFilters): number {
  return INSPIRATION_KEYS.reduce((sum, key) => sum + filters[key].length, 0) + (filters.minRating ? 1 : 0);
}
