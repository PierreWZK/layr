import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageIntro } from "@/components/layout/page-intro";
import { FavoriteButton } from "@/components/site/favorite-button";
import { Rating } from "@/components/site/rating";
import { Screenshot } from "@/components/site/screenshot";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { queryWebsites } from "@/lib/websites";

type PageProps = { params: Promise<{ locale: string }> };

export default function TrendingPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <TrendingContent {...props} />
    </Suspense>
  );
}

async function TrendingContent({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  await connection();

  let sites: Awaited<ReturnType<typeof queryWebsites>> = null;
  let failed = false;
  try {
    sites = await queryWebsites(locale, { sort: "trending", limit: 20 });
  } catch (error) {
    console.error("trending", error);
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
      <PageIntro
        label={t.trendingPage.label}
        title={t.trendingPage.title}
        intro={t.trendingPage.intro}
        aside={<p className="mt-4 text-[13px] leading-relaxed text-muted">{t.trendingPage.method}</p>}
      />
      {!sites ? (
        <p className="mt-10 border border-line bg-surface p-6 text-muted">{failed ? t.common.dbError : t.common.dbMissing}</p>
      ) : (
        <ol className="border-b border-line">
          {sites.map((site, index) => (
            <li
              key={site.slug}
              className="group grid grid-cols-[3rem_96px_minmax(0,1fr)] items-center gap-4 border-t border-line py-5 md:grid-cols-[5rem_200px_minmax(0,1fr)_auto] md:gap-8"
            >
              <span className={`font-mono tabular-nums ${index < 3 ? "text-3xl text-accent md:text-5xl" : "text-xl text-muted md:text-3xl"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <Link href={`/${locale}/site/${site.slug}`} className="block overflow-hidden border border-line" aria-label={site.title}>
                <Screenshot
                  src={site.screenshot}
                  alt=""
                  domain={site.domain}
                  emptyLabel={t.card.noShot}
                  sizes="200px"
                  className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
                />
              </Link>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
                  <Link href={`/${locale}/site/${site.slug}`} className="hover:text-accent">
                    {site.title}
                  </Link>
                </h2>
                <p className="mt-1 line-clamp-1 text-[14px] text-muted">{site.description}</p>
                <p className="mt-1 font-mono text-[12px] text-muted">
                  {site.domain} · {fmt(t.trendingPage.week, { n: site.weekCount })}
                </p>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-3 md:col-span-1">
                <Rating value={site.rating} locale={locale} />
                <FavoriteButton slug={site.slug} title={site.title} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
