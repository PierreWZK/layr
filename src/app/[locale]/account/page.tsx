import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccountPanel } from "@/components/account/account-panel";
import { PageIntro } from "@/components/layout/page-intro";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

type PageProps = { params: Promise<{ locale: string }> };

export default function AccountPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <AccountContent {...props} />
    </Suspense>
  );
}

async function AccountContent({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-8">
      <PageIntro label={t.account.label} title={t.account.title} />
      <div className="py-16">
        <AccountPanel />
      </div>
    </div>
  );
}
