import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { PageIntro } from "@/components/layout/page-intro";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

type PageProps = { params: Promise<{ locale: string }> };

export default function FavoritesPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <FavoritesContent {...props} />
    </Suspense>
  );
}

async function FavoritesContent({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-8">
      <PageIntro label={t.favoritesPage.label} title={t.favoritesPage.title} intro={t.favoritesPage.intro} />
      <div className="py-16">
        <FavoritesView />
      </div>
    </div>
  );
}
