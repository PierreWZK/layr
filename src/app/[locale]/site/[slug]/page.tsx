import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { FavoriteButton } from "@/components/site/favorite-button";
import { Rating } from "@/components/site/rating";
import { Screenshot } from "@/components/site/screenshot";
import { ViewBeacon } from "@/components/site/view-beacon";
import { WebsiteCard } from "@/components/site/website-card";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getWebsiteBySlug, relatedWebsites } from "@/lib/websites";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export default function SitePage(props: PageProps) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <SiteDetail {...props} />
    </Suspense>
  );
}

async function SiteDetail({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !/^[a-z0-9-]{1,80}$/.test(slug)) notFound();
  const t = getDictionary(locale);

  const site = await getWebsiteBySlug(locale, slug);
  if (!site) notFound();
  const related = await relatedWebsites(locale, site, 4);

  const added = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(site.createdAt),
  );

  const facts: [string, string | null][] = [
    [t.site.creator, site.creator],
    [t.site.inspiration, site.inspirationCategory ? (t.inspirationCategories[site.inspirationCategory] ?? null) : null],
    [t.site.style, site.visualStyle],
    [t.site.palette, site.colorPalette],
    [t.site.layout, site.layoutType],
    [t.site.animation, site.animationType],
    [t.site.industry, site.industry],
    [t.site.added, added],
  ];

  return (
    <article className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
      <ViewBeacon slug={site.slug} />

      <nav aria-label="Breadcrumb" className="t-label flex flex-wrap items-center gap-2 pt-10 text-muted">
        <Link href={`/${locale}/discover`} className="hover:text-accent">
          {t.site.back}
        </Link>
        {site.category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/${locale}/discover?cat=${site.category.slug}`} className="hover:text-accent">
              {site.category.name}
            </Link>
          </>
        )}
      </nav>

      <header className="grid gap-8 border-b border-line pb-10 pt-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h1 className="t-h1">{site.title}</h1>
          <p className="mt-4 font-mono text-[14px] text-muted">{site.domain}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-4 md:justify-end">
          <a
            href={`/go/${site.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-full bg-champagne px-6 text-[15px] font-medium text-charcoal ring-1 ring-inset ring-charcoal/15 transition-colors duration-300 hover:bg-amber"
          >
            {t.site.visit}
          </a>
          <FavoriteButton slug={site.slug} title={site.title} variant="inline" />
        </div>
      </header>

      {/* Capture en grand, posée sur un calque décalé */}
      <Reveal className="relative mt-10 md:mt-14">
        <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 border border-accent md:translate-x-5 md:translate-y-5" />
        <div className="relative overflow-hidden rounded-[22px] border border-line-strong bg-surface">
          <Screenshot
            src={site.screenshot}
            alt={site.title}
            domain={site.domain}
            emptyLabel={t.card.noShot}
            sizes="(min-width: 1440px) 1376px, 100vw"
            priority
          />
        </div>
      </Reveal>

      <div className="mt-20 grid gap-14 md:grid-cols-12">
        <aside className="flex flex-col gap-8 md:col-span-4">
          <div>
            <p className="t-label mb-3 text-muted">{t.site.rating}</p>
            <Rating value={site.rating} locale={locale} size="lg" />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">{t.site.ratingNote}</p>
          </div>
          {site.category && (
            <div>
              <p className="t-label mb-3 text-muted">{t.site.category}</p>
              <Link
                href={`/${locale}/discover?cat=${site.category.slug}`}
                className="inline-flex rounded-full border border-line-strong px-3.5 py-1.5 text-[14px] hover:border-accent hover:text-accent"
              >
                {site.category.name}
              </Link>
            </div>
          )}
          {site.badges.length > 0 && (
            <div>
              <p className="t-label mb-3 text-muted">{t.site.badges}</p>
              <div className="flex flex-wrap gap-1.5">
                {site.badges.map((badge) => (
                  <Link
                    key={badge.slug}
                    href={`/${locale}/discover?badge=${badge.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[12px] hover:border-line-strong"
                  >
                    <span aria-hidden className="h-1.5 w-1.5" style={{ backgroundColor: badge.color }} />
                    {badge.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {site.tags.length > 0 && (
            <div>
              <p className="t-label mb-3 text-muted">{t.site.tags}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[14px]">
                {[...new Set([...site.tags, ...site.visualTags])].map((tag) => (
                  <Link key={tag} href={`/${locale}/discover?q=${encodeURIComponent(tag)}`} className="text-muted hover:text-accent">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="md:col-span-7 md:col-start-6">
          <p className="t-label mb-4 text-muted">{t.site.about}</p>
          <p className="text-2xl leading-snug tracking-[-0.02em] md:text-3xl">{site.description}</p>

          {site.review && (
            <section className="mt-14 border-t border-line pt-10">
              <p className="t-label mb-4 text-muted">{t.site.review}</p>
              <p className="font-serif text-2xl italic leading-relaxed md:text-[1.75rem]">{site.review}</p>
              <p className="mt-4 text-[12px] text-muted">{t.site.reviewNote}</p>
            </section>
          )}

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-10 sm:grid-cols-3">
            {facts
              .filter((fact): fact is [string, string] => Boolean(fact[1]))
              .map(([label, value], index) => (
                <div key={`${index}-${label}`}>
                  <dt className="t-label text-muted">{label}</dt>
                  <dd className="mt-2 text-[15px]">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28 border-t border-line pt-14">
          <h2 className="t-h2 mb-10">{t.site.related}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <WebsiteCard key={item.slug} site={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-[1440px] px-4 pt-16 md:px-8">
      <div className="h-14 w-1/2 animate-pulse bg-surface-2" />
      <div className="mt-12 aspect-[16/10] w-full animate-pulse bg-surface-2" />
    </div>
  );
}
