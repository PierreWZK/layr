import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { buttonClass, inputClass } from "@/components/admin/admin-styles";
import { SitesTable } from "@/components/admin/sites-table";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { adminUser } from "@/lib/admin";
import { listAdminSites } from "@/lib/admin-data";
import { STATUSES } from "@/lib/site-input";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminSitesPage(props: PageProps) {
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
  const t = getDictionary(locale);
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").slice(0, 100);
  const status = typeof sp.status === "string" ? sp.status : "";
  const rows = await listAdminSites(q, status);

  return (
    <AdminFrame locale={locale} current="sites">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Formulaire GET : fonctionne sans JavaScript */}
        <form className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input name="q" defaultValue={q} placeholder={t.admin.sites.search} aria-label={t.admin.sites.search} className={`${inputClass} sm:max-w-sm`} />
          <select name="status" defaultValue={status} aria-label={t.admin.sites.allStatuses} className={`${inputClass} sm:max-w-[200px]`}>
            <option value="">{t.admin.sites.allStatuses}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.admin.status[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="inline-flex h-11 items-center border border-line-strong px-5 text-[14px] hover:bg-fg hover:text-bg">
            {t.admin.sites.filter}
          </button>
        </form>
        <Link href={`/${locale}/admin/sites/new`} className={buttonClass}>
          {t.admin.nav.new}
        </Link>
      </div>
      <SitesTable rows={rows} />
    </AdminFrame>
  );
}
