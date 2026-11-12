import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CategoryIndex } from "@/components/home/category-index";
import { Hero } from "@/components/home/hero";
import { Reveal } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { listCategories } from "@/lib/taxonomy";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <>
      <Hero />
      <Suspense fallback={<IndexSkeleton />}>
        <HomeIndex params={params} />
      </Suspense>
    </>
  );
}

async function HomeIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
      <div className="grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <p className="t-label mb-6 flex items-center gap-3 text-muted">
            <span aria-hidden className="h-2 w-2 bg-accent" />
            {t.home.indexLabel}
          </p>
          <h2 className="t-h2 font-serif font-normal normal-case italic tracking-[-0.02em]">
            {t.home.indexTitle}
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">{t.home.indexBody}</p>
        </Reveal>

        <div className="md:col-span-8 md:pt-2">
          <Suspense fallback={<IndexSkeleton />}>
            <CategoryBlock locale={locale} t={t} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

// Lecture de la base à chaque requête (dans Suspense : la coque de page reste statique)
async function CategoryBlock({ locale, t }: { locale: Locale; t: Dictionary }) {
  await connection();
  let categories: Awaited<ReturnType<typeof listCategories>> = null;
  try {
    categories = await listCategories(locale);
  } catch (error) {
    console.error("listCategories", error);
    return <p className="border border-line bg-surface p-6 text-muted">{t.common.dbError}</p>;
  }
  if (!categories) {
    return <p className="border border-line bg-surface p-6 text-muted">{t.common.dbMissing}</p>;
  }
  return <CategoryIndex items={categories} />;
}

function IndexSkeleton() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8">
      <div className="border-t border-line">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex h-[60px] items-center gap-6 border-b border-line">
            <span className="h-2.5 w-8 bg-line" />
            <span className="h-4 w-1/3 animate-pulse bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
