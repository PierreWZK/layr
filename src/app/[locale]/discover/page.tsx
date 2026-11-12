import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DiscoverExplorer } from "@/components/discover/discover-explorer";
import { PageIntro } from "@/components/layout/page-intro";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { parseFilters } from "@/lib/discover-params";
import { listBadges, listCategoriesWithCounts, queryWebsites } from "@/lib/websites";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function DiscoverPage(props: PageProps) {
  return (
    <Suspense fallback={<GridSkeleton />}>
      <DiscoverContent {...props} />
    </Suspense>
  );
}

async function DiscoverContent({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const filters = parseFilters(await searchParams);

  let result: { items: Awaited<ReturnType<typeof queryWebsites>>; categories: Awaited<ReturnType<typeof listCategoriesWithCounts>>; badges: Awaited<ReturnType<typeof listBadges>> } | null = null;
  try {
    const [items, categories, badges] = await Promise.all([
      queryWebsites(locale, { ...filters, limit: 200 }),
      listCategoriesWithCounts(locale),
      listBadges(locale),
    ]);
    result = { items, categories, badges };
  } catch (error) {
    console.error("discover", error);
  }

  const content = !result ? (
    <p className="border border-line bg-surface p-6 text-muted">{t.common.dbError}</p>
  ) : result.items ? (
    <DiscoverExplorer items={result.items} filters={filters} categories={result.categories} badges={result.badges} />
  ) : (
    <p className="border border-line bg-surface p-6 text-muted">{t.common.dbMissing}</p>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-8">
      <PageIntro label={t.discover.label} title={t.discover.title} intro={t.discover.intro} />
      {content}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
      <div className="py-16">
        <div className="h-3 w-24 bg-surface-2" />
        <div className="mt-6 h-16 w-2/3 animate-pulse bg-surface-2" />
      </div>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:ml-[308px] 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[16/10] w-full animate-pulse bg-surface-2" />
            <div className="mt-4 h-4 w-1/2 bg-surface-2" />
            <div className="mt-2 h-3 w-3/4 bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
