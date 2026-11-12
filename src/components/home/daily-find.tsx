"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/locale-provider";
import { Reveal } from "@/components/motion/reveal";
import { FavoriteButton } from "@/components/site/favorite-button";
import { Rating } from "@/components/site/rating";
import { Screenshot } from "@/components/site/screenshot";
import type { Website } from "@/lib/websites";

// « Une belle découverte par jour » : le même site pour tout le monde sur la journée
export function DailyFind({ site, dateLabel }: { site: Website; dateLabel: string }) {
  const { locale, dict: t } = useI18n();
  const href = `/${locale}/site/${site.slug}`;

  return (
    <section className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-12 lg:items-center">
        <Reveal className="relative lg:col-span-7">
          <span aria-hidden className="absolute inset-0 -translate-x-3 translate-y-3 bg-highlight md:-translate-x-5 md:translate-y-5" />
          <Link href={href} className="group relative block overflow-hidden border border-line-strong bg-surface" aria-label={site.title}>
            <Screenshot
              src={site.screenshot}
              alt=""
              domain={site.domain}
              emptyLabel={t.card.noShot}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.03]"
            />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5 lg:pl-6">
          <p className="t-label flex items-center gap-3 text-accent">
            <span aria-hidden className="h-2 w-2 bg-accent" />
            {t.home.dailyLabel}
          </p>
          <p className="mt-3 font-mono text-[12px] text-muted">{dateLabel}</p>
          <h2 className="t-h1 mt-8">{site.title}</h2>
          <p className="mt-2 font-mono text-[13px] text-muted">{site.domain}</p>
          <p className="t-lead mt-6 text-muted">{site.description}</p>
          <div className="mt-8 flex items-center gap-6">
            <Rating value={site.rating} locale={locale} size="lg" />
            {site.category && <span className="border border-line-strong px-2.5 py-1 text-[12px]">{site.category.name}</span>}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={href}
              className="inline-flex h-12 items-center bg-accent px-5 text-[15px] font-medium text-accent-fg transition-colors duration-300 hover:bg-fg hover:text-bg"
            >
              {site.title} →
            </Link>
            <a
              href={`/go/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center border border-line-strong px-5 text-[15px] font-medium transition-colors duration-300 hover:bg-fg hover:text-bg"
            >
              {t.site.visit}
            </a>
            <FavoriteButton slug={site.slug} title={site.title} variant="inline" />
          </div>
          <p className="mt-6 text-[13px] text-muted">{t.home.dailyNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
