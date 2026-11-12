"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { fmt } from "@/i18n/format";
import type { AdminSiteRow } from "@/lib/admin-data";
import type { SiteStatus } from "@/lib/site-input";
import { ghostButtonClass } from "./admin-styles";

const JSON_HEADERS = { "content-type": "application/json" };

// Liste admin : statut, mise en avant, publication rapide, suppression
export function SitesTable({ rows }: { rows: AdminSiteRow[] }) {
  const { locale, dict: t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const patch = async (id: string, body: { status?: SiteStatus; is_featured?: boolean }) => {
    setBusy(id);
    await fetch(`/api/admin/sites/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(body) }).catch(() => {});
    setBusy(null);
    router.refresh();
  };

  const remove = async (row: AdminSiteRow) => {
    if (!window.confirm(fmt(t.admin.sites.confirmDelete, { title: row.title }))) return;
    setBusy(row.id);
    await fetch(`/api/admin/sites/${row.id}`, { method: "DELETE" }).catch(() => {});
    setBusy(null);
    router.refresh();
  };

  if (rows.length === 0) return <p className="text-muted">{t.admin.sites.empty}</p>;

  return (
    <ul className="flex flex-col border-t border-line">
      {rows.map((row) => (
        <li
          key={row.id}
          className={`grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-b border-line py-4 md:grid-cols-[96px_minmax(0,1fr)_auto] ${busy === row.id ? "opacity-50" : ""}`}
        >
          <div className="overflow-hidden border border-line bg-surface-2">
            {row.screenshot_url ? (
              <Image src={row.screenshot_url} alt="" width={192} height={120} unoptimized className="aspect-[16/10] w-full object-cover object-top" />
            ) : (
              <div className="aspect-[16/10]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/${locale}/admin/sites/${row.id}`} className="truncate text-[16px] font-medium hover:text-accent">
                {row.title}
              </Link>
              <span className={`border px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] ${row.status === "pending" ? "border-accent text-accent" : "border-line-strong text-muted"}`}>
                {t.admin.status[row.status]}
              </span>
              {row.is_featured && <span className="text-[11px] uppercase tracking-[0.1em] text-accent">{t.admin.sites.featured}</span>}
            </div>
            <p className="mt-1 font-mono text-[12px] text-muted">
              {row.domain} · {row.content_type} · {row.rating ?? "–"}/10
            </p>
          </div>
          <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1 md:justify-end">
            {row.status !== "published" && (
              <button type="button" disabled={busy === row.id} onClick={() => patch(row.id, { status: "published" })} className={ghostButtonClass}>
                {t.admin.sites.publish}
              </button>
            )}
            {row.status === "pending" && (
              <button type="button" disabled={busy === row.id} onClick={() => patch(row.id, { status: "rejected" })} className={ghostButtonClass}>
                {t.admin.sites.reject}
              </button>
            )}
            <button
              type="button"
              aria-pressed={row.is_featured}
              disabled={busy === row.id}
              onClick={() => patch(row.id, { is_featured: !row.is_featured })}
              className={`${ghostButtonClass} ${row.is_featured ? "border-accent text-accent" : ""}`}
            >
              {t.admin.sites.featured}
            </button>
            <Link href={`/${locale}/admin/sites/${row.id}`} className={ghostButtonClass}>
              {t.admin.sites.edit}
            </Link>
            <button type="button" disabled={busy === row.id} onClick={() => remove(row)} className={`${ghostButtonClass} hover:border-accent hover:bg-transparent hover:text-accent`}>
              {t.admin.sites.delete}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
