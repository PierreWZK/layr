import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CategoryIndex } from "@/components/home/category-index";
import { DailyFind } from "@/components/home/daily-find";
import { Hero } from "@/components/home/hero";
import { BadgeWall, ClosingCta, Pillars, Process, Rail, StatsStrip, Universes } from "@/components/home/sections";
import { Reveal } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import {
  catalogueStats,
  listBadges,
  listCategoriesWithCounts,
  queryWebsites,
  siteOfTheDay,
} from "@/lib/websites";

type PageProps = { params: Promise<{ locale: string }> };

export default function HomePage({ params }: PageProps) {
  return (
    <>
      <Hero />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent params={params} />
      </Suspense>
    </>
  );
}

async function HomeContent({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  await connection();

  let data;
  try {
    const now = new Date();
    const [stats, daily, trending, picks, recent, saved, categories, badges] = await Promise.all([
      catalogueStats(),
      siteOfTheDay(locale, now),
      queryWebsites(locale, { sort: "trending", limit: 3 }),
      queryWebsites(locale, { badges: ["editors-pick"], sort: "rating", limit: 6 }),
      queryWebsites(locale, { sort: "recent", limit: 3 }),
      queryWebsites(locale, { sort: "saved", savedOnly: true, limit: 3 }),
      listCategoriesWithCounts(locale),
      listBadges(locale),
    ]);
    const dateLabel = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Paris",
    }).format(now);
    data = { stats, daily, trending, picks, recent, saved, categories, badges, dateLabel };
  } catch (error) {
    console.error("home", error);
    return <Notice text={t.common.dbError} />;
  }

  if (!data.stats) return <Notice text={t.common.dbMissing} />;
  const { stats, daily, trending, picks, recent, saved, categories, badges, dateLabel } = data;
  const universes = Object.keys(t.inspirationCategories).length;
  // Tendances seulement s'il y a eu de l'activité cette semaine ; la sélection évite les doublons
  const trendingSites = (trending ?? []).filter((s) => s.weekCount > 0);
  const shown = new Set(trendingSites.map((s) => s.slug));
  const pickSites = (picks ?? []).filter((s) => !shown.has(s.slug)).slice(0, 3);

  return (
    <>
      <StatsStrip t={t} sites={stats.sites} categories={categories.length} badges={badges.length} universes={universes} />
      {daily && <DailyFind site={daily} dateLabel={dateLabel} />}
      <Pillars t={t} locale={locale} />
      <Rail
        label={t.nav.trending}
        title={t.home.railTrending}
        note={t.home.railTrendingNote}
        sites={trendingSites}
        href={`/${locale}/trending`}
        seeAll={t.actions.seeAll}
      />
      <Rail
        label={t.discover.sort.curated}
        title={t.home.railPicks}
        sites={pickSites}
        href={`/${locale}/discover?badge=editors-pick`}
        seeAll={t.actions.seeAll}
      />

      <section className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="t-label mb-6 flex items-center gap-3 text-muted">
              <span aria-hidden className="h-2 w-2 bg-accent" />
              {t.home.indexLabel}
            </p>
            <h2 className="t-h2 font-serif font-normal normal-case italic tracking-[-0.02em]">{t.home.indexTitle}</h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">{t.home.indexBody}</p>
          </Reveal>
          <div className="md:col-span-8 md:pt-2">
            <CategoryIndex items={categories} />
          </div>
        </div>
      </section>

      <BadgeWall t={t} locale={locale} badges={badges} />
      <Rail
        label={t.discover.label}
        title={t.home.railRecent}
        sites={recent ?? []}
        href={`/${locale}/discover?sort=recent`}
        seeAll={t.actions.seeAll}
      />
      <Rail
        label={t.nav.favorites}
        title={t.home.railSaved}
        sites={saved ?? []}
        href={`/${locale}/discover?sort=saved`}
        seeAll={t.actions.seeAll}
      />
      <Universes t={t} />
      <Process t={t} />
      <ClosingCta t={t} locale={locale} sites={stats.sites} />
    </>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8">
      <p className="border border-line bg-surface p-6 text-muted">{text}</p>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse bg-surface-2" />
        ))}
      </div>
      <div className="mt-24 aspect-[16/7] w-full animate-pulse bg-surface-2" />
    </div>
  );
}
