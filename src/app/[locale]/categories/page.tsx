import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { plural } from "@/i18n/format";
import { listCategoriesWithCounts } from "@/lib/websites";

type PageProps = { params: Promise<{ locale: string }> };

export default function CategoriesPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <CategoriesContent {...props} />
    </Suspense>
  );
}

async function CategoriesContent({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  await connection();

  let categories: Awaited<ReturnType<typeof listCategoriesWithCounts>> = [];
  let failed = false;
  try {
    categories = await listCategoriesWithCounts(locale);
  } catch (error) {
    console.error("categories", error);
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
      <PageIntro label={t.categoriesPage.label} title={t.categoriesPage.title} intro={t.categoriesPage.intro} />
      {failed || categories.length === 0 ? (
        <p className="mt-10 border border-line bg-surface p-6 text-muted">{failed ? t.common.dbError : t.common.dbMissing}</p>
      ) : (
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <li key={category.slug} className="bg-bg">
              <Reveal delay={Math.min(index % 4, 3) * 0.05} className="h-full">
                <Link
                  href={`/${locale}/discover?cat=${category.slug}`}
                  className="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-surface"
                >
                  {/* Trois captures empilées en calques */}
                  <div className="relative mb-8 aspect-[16/11]">
                    {category.shots.length === 0 && (
                      <div className="absolute inset-0 grid place-items-center border border-dashed border-line-strong">
                        <span className="t-label text-muted">{t.categoriesPage.empty}</span>
                      </div>
                    )}
                    {category.shots.map((shot, i) => (
                      <div
                        key={shot}
                        className="absolute w-[78%] overflow-hidden border border-line-strong bg-surface shadow-[0_20px_40px_-24px_rgb(23_23_23/0.45)] transition-transform duration-500 ease-out-expo"
                        style={{
                          left: `${i * 11}%`,
                          top: `${i * 14}%`,
                          zIndex: 3 - i,
                          transform: `rotate(${(i - 1) * 1.5}deg)`,
                        }}
                      >
                        <Image src={shot} alt="" width={600} height={375} sizes="300px" className="aspect-[16/10] w-full object-cover object-top" />
                      </div>
                    ))}
                  </div>
                  <span className="t-label text-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-accent">{category.name}</h2>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{category.description}</p>
                  <p className="mt-6 font-mono text-[12px] text-fg">
                    {plural(category.count, t.categoriesPage.countOne, t.categoriesPage.countMany)} →
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
