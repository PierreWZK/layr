import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { WebsiteCardList } from "@/components/home/website-card-list";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fmt } from "@/i18n/format";
import type { BadgeInfo, Website } from "@/lib/websites";

function SectionHead({ label, title, body, action }: { label: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
      <Reveal className="md:col-span-7">
        <p className="t-label mb-5 flex items-center gap-3 text-muted">
          <span aria-hidden className="h-2 w-2 bg-accent" />
          {label}
        </p>
        <h2 className="t-h2">{title}</h2>
      </Reveal>
      <Reveal delay={0.08} className="flex flex-col gap-4 md:col-span-5 md:items-end md:text-right">
        {body && <p className="max-w-md text-[15px] leading-relaxed text-muted">{body}</p>}
        {action}
      </Reveal>
    </div>
  );
}

// Chiffres réels du catalogue
export function StatsStrip({
  t,
  sites,
  categories,
  badges,
  universes,
}: {
  t: Dictionary;
  sites: number;
  categories: number;
  badges: number;
  universes: number;
}) {
  const stats = [
    [sites, t.home.statsSites],
    [categories, t.home.statsCategories],
    [badges, t.home.statsBadges],
    [universes, t.home.statsUniverses],
    [2, t.home.statsLanguages],
  ] as const;
  return (
    <section className="border-b border-line">
      <dl className="mx-auto grid w-full max-w-[1440px] grid-cols-2 md:grid-cols-5">
        {stats.map(([value, label], index) => (
          <div
            key={label}
            className={`border-line px-4 py-8 md:px-8 md:py-10 ${index % 2 === 0 ? "border-r" : ""} ${index < 4 ? "border-b md:border-b-0" : ""} md:border-r md:last:border-r-0`}
          >
            <dt className="sr-only">{label}</dt>
            <dd>
              <span className="block font-mono text-4xl tabular-nums tracking-[-0.04em] md:text-5xl">{value}</span>
              <span className="mt-2 block text-[13px] text-muted">{label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// Les quatre services de LayR
export function Pillars({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
      <SectionHead label={t.home.pillarsLabel} title={t.home.pillarsTitle} />
      <ol className="grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
        {t.home.pillars.map((pillar, index) => (
          <li key={pillar.key} className="bg-bg">
            <Reveal delay={index * 0.06} className="h-full">
              <Link href={`/${locale}/${pillar.key}`} className="group flex h-full flex-col p-7 transition-colors duration-300 hover:bg-surface md:p-8">
                <span className="font-serif text-5xl italic leading-none text-accent">{index + 1}</span>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.03em]">{pillar.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{pillar.body}</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2 border-t border-line pt-5 text-[14px]">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
                <span aria-hidden className="mt-8 text-xl transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Rangée de trois sites (défilement horizontal sur mobile)
export function Rail({
  label,
  title,
  note,
  sites,
  href,
  seeAll,
}: {
  label: string;
  title: string;
  note?: string;
  sites: Website[];
  href: string;
  seeAll: string;
}) {
  if (sites.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-20 md:px-8 md:py-24">
      <SectionHead
        label={label}
        title={title}
        body={note}
        action={
          <Link href={href} className="text-[14px] font-medium text-accent underline-offset-4 hover:underline">
            {seeAll} →
          </Link>
        }
      />
      <WebsiteCardList sites={sites} />
    </section>
  );
}

export function BadgeWall({ t, locale, badges }: { t: Dictionary; locale: Locale; badges: BadgeInfo[] }) {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
        <SectionHead label={t.home.badgesLabel} title={t.home.badgesTitle} body={t.home.badgesBody} />
        <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {badges.map((badge) => (
            <li key={badge.slug} className="border-b border-r border-line">
              <Link
                href={`/${locale}/discover?badge=${badge.slug}`}
                className="group flex h-full items-start gap-4 p-5 transition-colors duration-300 hover:bg-bg"
              >
                <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0" style={{ backgroundColor: badge.color }} />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold tracking-[-0.01em] group-hover:text-accent">{badge.name}</span>
                    <span className="font-mono text-[11px] tabular-nums text-muted">{badge.count}</span>
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted">{badge.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Les 14 univers d'inspiration, en grande typographie
export function Universes({ t }: { t: Dictionary }) {
  const names = Object.values(t.inspirationCategories);
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
      <SectionHead label={t.home.universesLabel} title={t.home.universesTitle} body={t.home.universesBody} />
      <Reveal>
        <p className="text-[clamp(1.75rem,4.2vw,3.75rem)] font-semibold leading-[1.12] tracking-[-0.04em]">
          {names.map((name, index) => (
            <span key={name}>
              <span className="transition-colors duration-300 hover:text-accent">{name.replace(/-/g, "‑")}</span>
              {index < names.length - 1 && <span className="mx-[0.25em] font-serif font-normal italic text-accent">/</span>}
            </span>
          ))}
        </p>
      </Reveal>
    </section>
  );
}

export function Process({ t }: { t: Dictionary }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
        <SectionHead label={t.home.processLabel} title={t.home.processTitle} body={t.home.processNote} />
        <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
          {t.home.process.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 0.08}>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[12px] tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="h-px flex-1 bg-line-strong" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ClosingCta({ t, locale, sites }: { t: Dictionary; locale: Locale; sites: number }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-24 md:flex-row md:items-end md:justify-between md:px-8">
        <Reveal>
          <h2 className="t-h1 max-w-[14ch]">{t.home.ctaTitle}</h2>
          <p className="t-lead mt-5 text-muted">{fmt(t.home.ctaBody, { n: sites })}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href={`/${locale}/discover`}
            className="inline-flex h-14 items-center bg-accent px-7 text-base font-medium text-accent-fg transition-colors duration-300 hover:bg-fg hover:text-bg"
          >
            {t.actions.explore}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
