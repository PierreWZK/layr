import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { SiteEditor } from "@/components/admin/site-editor";
import { isLocale } from "@/i18n/config";
import { adminUser } from "@/lib/admin";
import { listTaxonomy } from "@/lib/admin-data";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewSitePage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await adminUser())) return <AdminForbidden locale={locale} />;
  const sp = await searchParams;
  const [categories, badges] = await Promise.all([listTaxonomy("categories"), listTaxonomy("badges")]);
  const name = (row: { name_fr: string; name_en: string }) => (locale === "fr" ? row.name_fr : row.name_en);
  const submission = typeof sp.submission === "string" && /^\d{1,18}$/.test(sp.submission) ? sp.submission : undefined;

  return (
    <AdminFrame locale={locale} current="new">
      <SiteEditor
        mode="new"
        initialUrl={typeof sp.url === "string" ? sp.url.slice(0, 500) : ""}
        submissionId={submission}
        categories={categories.map((c) => ({ slug: c.slug, name: name(c) }))}
        badges={badges.map((b) => ({ slug: b.slug, name: name(b) }))}
      />
    </AdminFrame>
  );
}
