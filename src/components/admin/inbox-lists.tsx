"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { fmt } from "@/i18n/format";
import type { MessageRow, SubmissionRow } from "@/lib/admin-data";
import { ghostButtonClass } from "./admin-styles";

const JSON_HEADERS = { "content-type": "application/json" };

function useDate() {
  const { locale } = useI18n();
  return (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

// Propositions des visiteurs : analyser, marquer traitée, refuser, rouvrir
export function SubmissionsList({ rows }: { rows: SubmissionRow[] }) {
  const { locale, dict: t } = useI18n();
  const s = t.admin.submissions;
  const router = useRouter();
  const date = useDate();
  const [busy, setBusy] = useState<string | null>(null);

  const setStatus = async (id: string, status: "new" | "processed" | "rejected") => {
    setBusy(id);
    await fetch(`/api/admin/submissions/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ status }) }).catch(() => {});
    setBusy(null);
    router.refresh();
  };

  if (rows.length === 0) return <p className="text-muted">{s.empty}</p>;

  return (
    <ul className="flex flex-col border-t border-line">
      {rows.map((row) => (
        <li key={row.id} className={`flex flex-col gap-3 border-b border-line py-5 md:flex-row md:items-start md:justify-between ${busy === row.id ? "opacity-50" : ""}`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <a href={row.url} target="_blank" rel="noopener noreferrer" className="break-all text-[16px] font-medium hover:text-accent">
                {row.url} ↗
              </a>
              <span className={`border px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] ${row.status === "new" ? "border-accent text-accent" : "border-line-strong text-muted"}`}>
                {s.status[row.status as keyof typeof s.status]}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-muted">
              {row.email ? fmt(s.from, { email: row.email }) : s.anonymous} · {row.locale.toUpperCase()} · {date(row.created_at)}
            </p>
            {row.note && <p className="mt-2 max-w-2xl text-[15px]">{row.note}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href={`/${locale}/admin/sites/new?url=${encodeURIComponent(row.url)}&submission=${row.id}`} className={ghostButtonClass}>
              {s.analyze}
            </Link>
            {row.status === "new" ? (
              <>
                <button type="button" onClick={() => setStatus(row.id, "processed")} className={ghostButtonClass}>
                  {s.markProcessed}
                </button>
                <button type="button" onClick={() => setStatus(row.id, "rejected")} className={ghostButtonClass}>
                  {s.reject}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setStatus(row.id, "new")} className={ghostButtonClass}>
                {s.reopen}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Messages du formulaire de contact
export function MessagesList({ rows }: { rows: MessageRow[] }) {
  const { dict: t } = useI18n();
  const m = t.admin.messages;
  const router = useRouter();
  const date = useDate();

  const mark = async (id: string, read: boolean) => {
    await fetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify({ read }) }).catch(() => {});
    router.refresh();
  };

  if (rows.length === 0) return <p className="text-muted">{m.empty}</p>;

  return (
    <ul className="flex flex-col border-t border-line">
      {rows.map((row) => (
        <li key={row.id} className="grid gap-3 border-b border-line py-5 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[15px]">
              {!row.read && <span aria-hidden className="h-2 w-2 bg-accent" />}
              <span className={row.read ? "" : "font-semibold"}>{row.name}</span>
              <span className="font-mono text-[12px] text-muted">{row.email}</span>
              <span className="text-[12px] text-muted">· {row.locale.toUpperCase()} · {date(row.created_at)}</span>
            </p>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted">{row.message}</p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <a href={`mailto:${row.email}`} className={ghostButtonClass}>
              {m.reply}
            </a>
            <button type="button" onClick={() => mark(row.id, !row.read)} className={ghostButtonClass}>
              {row.read ? m.markUnread : m.markRead}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
