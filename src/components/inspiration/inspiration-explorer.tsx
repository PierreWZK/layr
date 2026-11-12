"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { FavoriteButton } from "@/components/site/favorite-button";
import { Rating } from "@/components/site/rating";
import { Screenshot } from "@/components/site/screenshot";
import type { SortKey } from "@/lib/discover-params";
import {
  INSPIRATION_KEYS,
  MIN_RATINGS,
  activeInspirationCount,
  emptyInspirationFilters,
  inspirationSearchString,
  type InspirationFilters,
  type InspirationKey,
} from "@/lib/inspiration-params";
import { fmt, plural } from "@/i18n/format";
import { facetLabel, facetValues } from "@/i18n/inspiration-labels";
import type { Website } from "@/lib/websites";

type Facet = Exclude<InspirationKey, "category">;
const FACET_KEYS: Facet[] = INSPIRATION_KEYS.filter((k): k is Facet => k !== "category");
const SORTS: SortKey[] = ["curated", "rating", "recent"];

// Filtres et résultats : l'URL porte l'état, le serveur relit les filtres à chaque changement
export function InspirationExplorer({ items, filters }: { items: Website[]; filters: InspirationFilters }) {
  const { locale, dict: t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const update = (next: InspirationFilters) => {
    startTransition(() => router.replace(`${pathname}${inspirationSearchString(next)}`, { scroll: false }));
  };

  const toggle = (key: InspirationKey, value: string) => {
    const current = filters[key];
    update({ ...filters, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  };

  const categories = Object.keys(t.inspirationCategories);
  const active = activeInspirationCount(filters);
  const facetLabels: Record<Facet, string> = {
    style: t.inspirationPage.style,
    palette: t.inspirationPage.palette,
    layout: t.inspirationPage.layout,
    animation: t.inspirationPage.animation,
    industry: t.inspirationPage.industry,
  };

  return (
    <div className={`grid gap-12 transition-opacity duration-300 lg:grid-cols-[260px_minmax(0,1fr)] ${pending ? "opacity-60" : ""}`}>
      <aside aria-label={t.inspirationPage.filters} className="lg:sticky lg:top-24 lg:self-start">
        <fieldset>
          <legend className="t-label mb-4 text-muted">{t.inspirationPage.category}</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((slug) => (
              <Chip key={slug} pressed={filters.category.includes(slug)} onClick={() => toggle("category", slug)}>
                {t.inspirationCategories[slug]}
              </Chip>
            ))}
          </div>
        </fieldset>

        {FACET_KEYS.map((key) => (
          <fieldset key={key} className="mt-8">
            <legend className="t-label mb-4 text-muted">{facetLabels[key]}</legend>
            <div className="flex flex-wrap gap-2">
              {facetValues(key).map((value) => (
                <Chip key={value} pressed={filters[key].includes(value)} onClick={() => toggle(key, value)}>
                  {facetLabel(key, value, locale)}
                </Chip>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="mt-8 grid gap-6">
          <label className="flex flex-col gap-2">
            <span className="t-label text-muted">{t.inspirationPage.minRating}</span>
            <select
              value={filters.minRating}
              onChange={(event) => update({ ...filters, minRating: Number(event.target.value) })}
              className="h-11 border border-line-strong bg-bg px-3 text-[15px]"
            >
              {MIN_RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating === 0 ? t.inspirationPage.anyRating : `${rating}+ / 10`}
                </option>
              ))}
            </select>
          </label>
          {active > 0 && (
            <button
              type="button"
              onClick={() => update(emptyInspirationFilters)}
              className="justify-self-start text-[14px] text-accent underline underline-offset-4"
            >
              {t.inspirationPage.clearAll}
            </button>
          )}
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-[14px] text-muted" aria-live="polite">
            {plural(items.length, t.inspirationPage.countOne, t.inspirationPage.countMany)}
          </p>
          <label className="flex items-center gap-3 text-[14px]">
            <span className="text-muted">{t.inspirationPage.sortBy}</span>
            <select
              value={filters.sort}
              onChange={(event) => update({ ...filters, sort: event.target.value as SortKey })}
              className="h-10 border border-line-strong bg-bg px-3"
            >
              {SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {t.discover.sort[sort]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 border border-line bg-surface p-8">
            <p className="text-xl font-semibold">{t.inspirationPage.emptyTitle}</p>
            <p className="mt-2 text-muted">{t.inspirationPage.emptyBody}</p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {items.map((site) => (
              <li key={site.id}>
                <InspirationCard site={site} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`border px-3 py-1.5 text-[13px] transition-colors duration-300 ${
        pressed ? "border-accent bg-accent text-accent-fg" : "border-line-strong hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

function InspirationCard({ site }: { site: Website }) {
  const { locale, dict: t } = useI18n();
  const href = `/${locale}/site/${site.slug}`;
  const tags = [
    site.visualStyle && facetLabel("style", site.visualStyle, locale),
    site.layoutType && facetLabel("layout", site.layoutType, locale),
    site.animationType && facetLabel("animation", site.animationType, locale),
  ].filter((v): v is string => Boolean(v));
  const kind = site.inspirationCategory ? t.inspirationCategories[site.inspirationCategory] : site.category?.name;

  return (
    <article className="group">
      <div className="relative">
        <Link href={href} aria-label={site.title} className="block overflow-hidden border border-line-strong bg-surface">
          <Screenshot
            src={site.screenshot}
            alt=""
            domain={site.domain}
            emptyLabel={t.card.noShot}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <FavoriteButton slug={site.slug} title={site.title} />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {kind && <p className="t-label text-muted">{kind}</p>}
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            <Link href={href} className="hover:text-accent">
              {site.title}
            </Link>
          </h2>
          {site.creator && <p className="mt-1 text-[13px] text-muted">{fmt(t.inspirationPage.by, { name: site.creator })}</p>}
        </div>
        <Rating value={site.rating} locale={locale} />
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-muted">{site.description}</p>
      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag} className="border border-line px-2 py-1 text-[12px]">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
