"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/locale-provider";
import { fmt } from "@/i18n/format";
import type { Website } from "@/lib/websites";
import { FavoriteButton } from "./favorite-button";
import { Rating } from "./rating";
import { Screenshot } from "./screenshot";

export function WebsiteCard({
  site,
  view = "grid",
  priority,
}: {
  site: Website;
  view?: "grid" | "list";
  priority?: boolean;
}) {
  const { locale, dict: t } = useI18n();
  const href = `/${locale}/site/${site.slug}`;
  const visitLabel = fmt(t.card.visit, { title: site.title });

  if (view === "list") {
    return (
      <article className="group grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4 border-b border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:gap-6">
        <Link href={href} aria-label={fmt(t.card.open, { title: site.title })} className="block overflow-hidden border border-line">
          <Screenshot
            src={site.screenshot}
            alt=""
            domain={site.domain}
            emptyLabel={t.card.noShot}
            sizes="160px"
            className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
          />
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold tracking-[-0.02em]">
              <Link href={href} className="hover:text-accent">
                {site.title}
              </Link>
            </h3>
            <span className="font-mono text-[12px] text-muted">{site.domain}</span>
            {site.isFeatured && <span className="t-label text-accent">{t.card.featured}</span>}
          </div>
          <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-muted">{site.description}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
            {site.category && <span className="text-fg">{site.category.name}</span>}
            {site.badges.slice(0, 3).map((badge) => (
              <span key={badge.slug} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5" style={{ backgroundColor: badge.color }} />
                {badge.name}
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
          <Rating value={site.rating} locale={locale} />
          <div className="flex items-center gap-2">
            <FavoriteButton slug={site.slug} title={site.title} />
            <a
              href={`/go/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={visitLabel}
              title={visitLabel}
              className="grid h-9 w-9 place-items-center border border-line-strong transition-colors hover:border-accent hover:text-accent"
            >
              ↗
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative">
      <div className="relative">
        {/* Calque décalé qui apparaît au survol : signature visuelle de LayR */}
        <span
          aria-hidden
          className="absolute inset-0 border border-accent opacity-0 transition-[transform,opacity] duration-500 ease-out-expo group-hover:translate-x-2 group-hover:translate-y-2 group-hover:opacity-100 motion-reduce:transition-none"
        />
        <Link
          href={href}
          aria-label={fmt(t.card.open, { title: site.title })}
          className="relative block overflow-hidden border border-line bg-surface transition-[border-color,transform] duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:border-line-strong motion-reduce:transform-none"
        >
          <Screenshot
            src={site.screenshot}
            alt=""
            domain={site.domain}
            emptyLabel={t.card.noShot}
            priority={priority}
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.04] motion-reduce:transform-none"
          />
        </Link>
        {site.isFeatured && (
          <span className="t-label pointer-events-none absolute left-3 top-3 bg-accent px-2 py-1.5 text-accent-fg">
            {t.card.featured}
          </span>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <FavoriteButton slug={site.slug} title={site.title} />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">
            <Link href={href} className="hover:text-accent">
              {site.title}
            </Link>
          </h3>
          <a
            href={`/go/${site.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={visitLabel}
            className="font-mono text-[12px] text-muted hover:text-accent"
          >
            {site.domain} ↗
          </a>
        </div>
        <Rating value={site.rating} locale={locale} />
      </div>

      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted">{site.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {site.category && (
          <span className="border border-line-strong px-2 py-1 text-[11px] font-medium text-fg">{site.category.name}</span>
        )}
        {site.badges.slice(0, 2).map((badge) => (
          <span key={badge.slug} className="inline-flex items-center gap-1.5 border border-line px-2 py-1 text-[11px] text-muted">
            <span aria-hidden className="h-1.5 w-1.5" style={{ backgroundColor: badge.color }} />
            {badge.name}
          </span>
        ))}
        {site.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="px-1 text-[11px] text-muted">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
