// Filtres de Découvrir <-> paramètres d'URL. Partagé serveur et client.

export const SORT_KEYS = ["curated", "rating", "recent", "popular", "saved"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type DiscoverFilters = {
  q: string;
  categories: string[];
  badges: string[];
  sort: SortKey;
  featured: boolean;
  free: boolean;
  premium: boolean;
  view: "grid" | "list";
};

export const emptyFilters: DiscoverFilters = {
  q: "",
  categories: [],
  badges: [],
  sort: "curated",
  featured: false,
  free: false,
  premium: false,
  view: "grid",
};

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(source: ParamSource, key: string): string {
  if (source instanceof URLSearchParams) return source.get(key) ?? "";
  const value = source[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const SLUG = /^[a-z0-9-]{1,40}$/;
const list = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => SLUG.test(v))
    .slice(0, 20);

export function parseFilters(source: ParamSource): DiscoverFilters {
  const sort = read(source, "sort");
  return {
    q: read(source, "q").slice(0, 100),
    categories: list(read(source, "cat")),
    badges: list(read(source, "badge")),
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortKey) : "curated",
    featured: read(source, "featured") === "1",
    free: read(source, "free") === "1",
    premium: read(source, "premium") === "1",
    view: read(source, "view") === "list" ? "list" : "grid",
  };
}

export function toSearchString(filters: DiscoverFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categories.length) params.set("cat", filters.categories.join(","));
  if (filters.badges.length) params.set("badge", filters.badges.join(","));
  if (filters.sort !== "curated") params.set("sort", filters.sort);
  if (filters.featured) params.set("featured", "1");
  if (filters.free) params.set("free", "1");
  if (filters.premium) params.set("premium", "1");
  if (filters.view === "list") params.set("view", "list");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function activeFilterCount(filters: DiscoverFilters): number {
  return (
    filters.categories.length +
    filters.badges.length +
    (filters.featured ? 1 : 0) +
    (filters.free ? 1 : 0) +
    (filters.premium ? 1 : 0) +
    (filters.q.trim() ? 1 : 0)
  );
}
