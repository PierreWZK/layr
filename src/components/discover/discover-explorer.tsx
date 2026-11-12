"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { WebsiteCard } from "@/components/site/website-card";
import { Button } from "@/components/ui/button";
import { fmt, plural } from "@/i18n/format";
import {
  activeFilterCount,
  emptyFilters,
  SORT_KEYS,
  toSearchString,
  type DiscoverFilters,
  type SortKey,
} from "@/lib/discover-params";
import type { BadgeInfo, CategoryInfo, Website } from "@/lib/websites";

type Props = {
  items: Website[];
  filters: DiscoverFilters;
  categories: CategoryInfo[];
  badges: BadgeInfo[];
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function DiscoverExplorer({ items, filters, categories, badges }: Props) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [current, setOptimistic] = useOptimistic(filters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Champ de recherche local, resynchronisé si l'URL change ailleurs (recherche du menu, retour arrière)
  const [query, setQuery] = useState(filters.q);
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    if (filters.q !== query.trim()) setQuery(filters.q);
  }

  const apply = useCallback(
    (next: DiscoverFilters) => {
      startTransition(() => {
        setOptimistic(next);
        router.replace(`${pathname}${toSearchString(next)}`, { scroll: false });
      });
    },
    [pathname, router, setOptimistic],
  );

  useEffect(() => {
    const term = query.trim();
    if (term === current.q) return;
    const id = window.setTimeout(() => apply({ ...current, q: term }), 250);
    return () => window.clearTimeout(id);
  }, [query, current, apply]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const count = items.length;
  const countLabel = plural(count, t.discover.resultsOne, t.discover.resultsMany);
  const activeCount = activeFilterCount(current);
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const badgeName = new Map(badges.map((b) => [b.slug, b.name]));

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(current.q
      ? [{ key: "q", label: fmt(t.discover.query, { q: current.q }), remove: () => { setQuery(""); apply({ ...current, q: "" }); } }]
      : []),
    ...current.categories.map((slug) => ({
      key: `c-${slug}`,
      label: categoryName.get(slug) ?? slug,
      remove: () => apply({ ...current, categories: current.categories.filter((s) => s !== slug) }),
    })),
    ...current.badges.map((slug) => ({
      key: `b-${slug}`,
      label: badgeName.get(slug) ?? slug,
      remove: () => apply({ ...current, badges: current.badges.filter((s) => s !== slug) }),
    })),
    ...(current.featured ? [{ key: "featured", label: t.discover.featured, remove: () => apply({ ...current, featured: false }) }] : []),
    ...(current.free ? [{ key: "free", label: t.discover.free, remove: () => apply({ ...current, free: false }) }] : []),
    ...(current.premium ? [{ key: "premium", label: t.discover.premium, remove: () => apply({ ...current, premium: false }) }] : []),
  ];

  const clearAll = () => {
    setQuery("");
    apply({ ...emptyFilters, sort: current.sort, view: current.view });
  };

  const panel = (
    <FilterPanel current={current} categories={categories} badges={badges} onChange={apply} />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block" aria-label={t.discover.filters}>
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pr-2">{panel}</div>
      </aside>

      <div className="min-w-0">
        {/* Barre d'outils : recherche, tri, affichage */}
        <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center">
          <label className="flex h-12 flex-1 items-center gap-3 border border-line-strong px-4 focus-within:border-accent">
            <span className="sr-only">{t.discover.searchLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden className="text-muted">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search.placeholder}
              className="h-full w-full bg-transparent text-[15px] text-fg placeholder:text-muted focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-12 items-center gap-2 border border-line-strong px-4 text-[14px] lg:hidden"
            >
              {t.discover.filters}
              {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center bg-accent px-1 text-[11px] text-accent-fg">{activeCount}</span>}
            </button>
            <label className="relative flex h-12 items-center border border-line-strong">
              <span className="sr-only">{t.discover.sortBy}</span>
              <select
                value={current.sort}
                onChange={(event) => apply({ ...current, sort: event.target.value as SortKey })}
                className="h-full appearance-none bg-transparent pl-4 pr-9 text-[14px] text-fg focus:outline-none"
              >
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key} className="bg-bg text-fg">
                    {t.discover.sort[key]}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3 text-muted">▾</span>
            </label>
            <div role="group" aria-label={t.discover.view} className="hidden h-12 border border-line-strong sm:flex">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={current.view === mode}
                  onClick={() => apply({ ...current, view: mode })}
                  className={`px-3.5 text-[13px] transition-colors ${current.view === mode ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
                >
                  {mode === "grid" ? t.discover.viewGrid : t.discover.viewList}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compteur et filtres actifs */}
        <div className="flex flex-wrap items-center gap-2 py-5" aria-live="polite">
          <span className="mr-2 font-mono text-[13px] tabular-nums text-fg">{countLabel}</span>
          <AnimatePresence initial={false}>
            {chips.map((chip) => (
              <motion.button
                key={chip.key}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={chip.remove}
                aria-label={fmt(t.discover.remove, { x: chip.label })}
                className="inline-flex items-center gap-2 border border-line-strong px-2.5 py-1 text-[12px] text-fg hover:border-accent"
              >
                {chip.label}
                <span aria-hidden className="text-muted">×</span>
              </motion.button>
            ))}
          </AnimatePresence>
          {chips.length > 0 && (
            <button type="button" onClick={clearAll} className="ml-1 text-[12px] text-accent underline-offset-4 hover:underline">
              {t.discover.clearAll}
            </button>
          )}
        </div>

        <div aria-busy={pending} className={`transition-opacity duration-300 ${pending ? "opacity-50" : "opacity-100"}`}>
          {count === 0 ? (
            <div className="border border-line px-6 py-20 text-center">
              <p className="t-h2">{t.discover.emptyTitle}</p>
              <p className="mx-auto mt-3 max-w-md text-muted">{t.discover.emptyBody}</p>
              {chips.length > 0 && (
                <Button variant="secondary" className="mt-8" onClick={clearAll}>
                  {t.discover.clearAll}
                </Button>
              )}
            </div>
          ) : current.view === "list" ? (
            <div className="border-t border-line">
              {items.map((site) => (
                <WebsiteCard key={site.slug} site={site} view="list" />
              ))}
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3">
              {items.map((site, index) => (
                <motion.div
                  key={site.slug}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: Math.min(index, 9) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <WebsiteCard site={site} priority={index < 2} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tiroir de filtres mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="fixed inset-0 z-[65] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" tabIndex={-1} aria-label={t.actions.closeMenu} onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-charcoal/55" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.discover.filters}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col border-l border-line-strong bg-bg"
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <span className="font-semibold">{t.discover.filters}</span>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label={t.actions.closeMenu} className="grid h-9 w-9 place-items-center border border-line">
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
              <div className="flex gap-3 border-t border-line p-4">
                {chips.length > 0 && (
                  <Button variant="secondary" onClick={clearAll} className="flex-1">
                    {t.discover.clearAll}
                  </Button>
                )}
                <Button onClick={() => setDrawerOpen(false)} className="flex-1">
                  {fmt(t.discover.showResults, { n: count })}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({
  current,
  categories,
  badges,
  onChange,
}: {
  current: DiscoverFilters;
  categories: CategoryInfo[];
  badges: BadgeInfo[];
  onChange: (next: DiscoverFilters) => void;
}) {
  const { dict: t } = useI18n();
  const quick = [
    { key: "featured" as const, label: t.discover.featured },
    { key: "free" as const, label: t.discover.free },
    { key: "premium" as const, label: t.discover.premium },
  ];

  return (
    <div className="flex flex-col gap-9">
      <fieldset>
        <legend className="t-label mb-3 text-muted">{t.discover.quick}</legend>
        <div className="flex flex-wrap gap-2">
          {quick.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={current[item.key]}
              onClick={() => onChange({ ...current, [item.key]: !current[item.key] })}
              className={`border px-3 py-1.5 text-[13px] transition-colors ${
                current[item.key] ? "border-accent bg-accent text-accent-fg" : "border-line-strong text-fg hover:border-accent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-label mb-3 text-muted">{t.discover.categories}</legend>
        <ul className="flex flex-col">
          {categories.map((category) => {
            const checked = current.categories.includes(category.slug);
            return (
              <li key={category.slug}>
                <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-[14px]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange({ ...current, categories: toggle(current.categories, category.slug) })}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${
                      checked ? "border-accent bg-accent" : "border-line-strong group-hover:border-fg"
                    }`}
                  >
                    {checked && <span className="h-1.5 w-1.5 bg-accent-fg" />}
                  </span>
                  <span className={`flex-1 ${checked ? "text-fg" : "text-muted group-hover:text-fg"}`}>{category.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted">{category.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="t-label mb-3 text-muted">{t.discover.badges}</legend>
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => {
            const checked = current.badges.includes(badge.slug);
            return (
              <button
                key={badge.slug}
                type="button"
                aria-pressed={checked}
                onClick={() => onChange({ ...current, badges: toggle(current.badges, badge.slug) })}
                className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-[12px] transition-colors ${
                  checked ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                <span aria-hidden className="h-1.5 w-1.5" style={{ backgroundColor: badge.color }} />
                {badge.name}
                <span className="font-mono text-[10px] opacity-70">{badge.count}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
