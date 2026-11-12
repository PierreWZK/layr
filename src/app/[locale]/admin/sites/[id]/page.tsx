import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { SiteEditor } from "@/components/admin/site-editor";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { adminUser } from "@/lib/admin";
import { getAdminSite, listTaxonomy } from "@/lib/admin-data";
import { UUID } from "@/lib/api";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default function EditSitePage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await adminUser())) return <AdminForbidden locale={locale} />;
  const t = getDictionary(locale);
  const [site, categories, badges] = await Promise.all([
    UUID.test(id) ? getAdminSite(id) : Promise.resolve(null),
    listTaxonomy("categories"),
    listTaxonomy("badges"),
  ]);
  const name = (row: { name_fr: string; name_en: string }) => (locale === "fr" ? row.name_fr : row.name_en);

  return (
    <AdminFrame locale={locale} current="sites">
      {!site ? (
        <p className="text-muted">{t.admin.sites.empty}</p>
      ) : (
        <>
          <h2 className="mb-8 text-3xl font-semibold tracking-[-0.03em]">{site.title}</h2>
          <SiteEditor
            mode="edit"
            id={site.id}
            slug={site.slug}
            initial={site}
            categories={categories.map((c) => ({ slug: c.slug, name: name(c) }))}
            badges={badges.map((b) => ({ slug: b.slug, name: name(b) }))}
          />
        </>
      )}
    </AdminFrame>
  );
}
