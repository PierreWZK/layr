import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageIntro } from "@/components/layout/page-intro";
import { SubmitForm } from "@/components/submit/submit-form";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

type PageProps = { params: Promise<{ locale: string }> };

export default function SubmitPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-8">
      <PageIntro label={t.submitPage.label} title={t.submitPage.title} intro={t.submitPage.intro} />
      <div className="py-16">
        <SubmitForm />
      </div>
    </div>
  );
}
