import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { buttonClass } from "@/components/admin/admin-styles";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { plural } from "@/i18n/format";
import { adminUser } from "@/lib/admin";
import { listSubscribers } from "@/lib/admin-data";

type PageProps = { params: Promise<{ locale: string }> };

export default function NewsletterPage(props: PageProps) {
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
  const t = getDictionary(locale);
  const rows = await listSubscribers();
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <AdminFrame locale={locale} current="newsletter">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted">{plural(rows.length, t.admin.newsletter.countOne, t.admin.newsletter.countMany)}</p>
        {rows.length > 0 && (
          <a href="/api/admin/newsletter" className={buttonClass} download>
            {t.admin.newsletter.export}
          </a>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-muted">{t.admin.newsletter.empty}</p>
      ) : (
        <ul className="flex flex-col border-t border-line">
          {rows.map((row) => (
            <li key={row.email} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
              <span className="font-mono text-[14px]">{row.email}</span>
              <span className="text-[13px] text-muted">
                {row.locale.toUpperCase()} · {date.format(new Date(row.created_at))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminFrame>
  );
}
