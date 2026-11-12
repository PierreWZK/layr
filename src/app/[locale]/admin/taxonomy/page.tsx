import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { TaxonomyEditor } from "@/components/admin/taxonomy-editor";
import { isLocale } from "@/i18n/config";
import { adminUser } from "@/lib/admin";
import { listTaxonomy } from "@/lib/admin-data";

type PageProps = { params: Promise<{ locale: string }> };

export default function TaxonomyPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await adminUser())) return <AdminForbidden locale={locale} />;
  const [categories, badges] = await Promise.all([listTaxonomy("categories"), listTaxonomy("badges")]);
  return (
    <AdminFrame locale={locale} current="taxonomy">
      <TaxonomyEditor categories={categories} badges={badges} />
    </AdminFrame>
  );
}
