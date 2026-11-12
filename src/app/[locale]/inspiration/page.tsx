import { Suspense } from "react";
import { notFound } from "next/navigation";
import { InspirationExplorer } from "@/components/inspiration/inspiration-explorer";
import { PageIntro } from "@/components/layout/page-intro";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { parseInspirationFilters } from "@/lib/inspiration-params";
import { queryWebsites } from "@/lib/websites";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function InspirationPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <InspirationContent {...props} />
    </Suspense>
  );
}

async function InspirationContent({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const filters = parseInspirationFilters(await searchParams);

  let items: Awaited<ReturnType<typeof queryWebsites>> = null;
  let failed = false;
  try {
    items = await queryWebsites(locale, {
      type: "inspiration",
      inspiration: {
        category: filters.category,
        style: filters.style,
        palette: filters.palette,
        layout: filters.layout,
        animation: filters.animation,
        industry: filters.industry,
      },
      minRating: filters.minRating || undefined,
      sort: filters.sort,
      limit: 200,
    });
  } catch (error) {
    console.error("inspiration", error);
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-8">
      <PageIntro label={t.inspirationPage.label} title={t.inspirationPage.title} intro={t.inspirationPage.intro} />
      {failed || !items ? (
        <p className="border border-line bg-surface p-6 text-muted">{failed ? t.common.dbError : t.common.dbMissing}</p>
      ) : (
        <InspirationExplorer items={items} filters={filters} />
      )}
    </div>
  );
}
