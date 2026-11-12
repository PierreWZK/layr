"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import type { TaxonomyRow } from "@/lib/admin-data";
import { buttonClass, inputClass } from "./admin-styles";

type Kind = "categories" | "badges";

// Catégories et badges : noms et descriptions FR/EN, couleur des badges, ajout d'entrées
export function TaxonomyEditor({ categories, badges }: { categories: TaxonomyRow[]; badges: TaxonomyRow[] }) {
  const { dict: t } = useI18n();
  return (
    <div className="grid gap-16">
      <Group kind="categories" title={t.admin.taxonomy.categories} rows={categories} />
      <Group kind="badges" title={t.admin.taxonomy.badges} rows={badges} />
    </div>
  );
}

function Group({ kind, title, rows }: { kind: Kind; title: string; rows: TaxonomyRow[] }) {
  const { dict: t } = useI18n();
  return (
    <section>
      <h2 className="mb-6 border-b border-line pb-3 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <Row key={row.id} kind={kind} row={row} />
        ))}
        <details className="border border-dashed border-line-strong p-4">
          <summary className="cursor-pointer text-[14px] font-medium">{t.admin.taxonomy.newItem}</summary>
          <div className="mt-4">
            <Row kind={kind} />
          </div>
        </details>
      </div>
    </section>
  );
}

function Row({ kind, row }: { kind: Kind; row?: TaxonomyRow }) {
  const { dict: t } = useI18n();
  const x = t.admin.taxonomy;
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setPending(true);
    setStatus(null);
    const res = await fetch("/api/admin/taxonomy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, id: row?.id, ...Object.fromEntries(form.entries()) }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setPending(false);
    if (!res?.ok) {
      setStatus(x.errors[data.error as keyof typeof x.errors] ?? x.errors.generic);
      return;
    }
    setStatus(x.saved);
    if (!row) element.reset();
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="grid gap-3 border-b border-line pb-4 md:grid-cols-[160px_repeat(2,minmax(0,1fr))_auto] md:items-end">
      <label className="flex flex-col gap-1.5">
        <span className="t-label text-muted">{x.slug}</span>
        <input name="slug" defaultValue={row?.slug} readOnly={Boolean(row)} title={row ? x.slugLocked : undefined} required className={`${inputClass} font-mono ${row ? "text-muted" : ""}`} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="t-label text-muted">{x.nameFr}</span>
        <input name="name_fr" defaultValue={row?.name_fr} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="t-label text-muted">{x.nameEn}</span>
        <input name="name_en" defaultValue={row?.name_en} required className={inputClass} />
      </label>
      <div className="flex items-end gap-2">
        {kind === "badges" && (
          <label className="flex flex-col gap-1.5">
            <span className="t-label text-muted">{x.color}</span>
            <input type="color" name="color" defaultValue={row?.color ?? "#5B4632"} className="h-11 w-14 border border-line-strong bg-bg" />
          </label>
        )}
        <button type="submit" disabled={pending} className={buttonClass}>
          {row ? x.save : x.add}
        </button>
      </div>
      <label className="flex flex-col gap-1.5 md:col-span-2 md:col-start-2">
        <span className="t-label text-muted">{x.descriptionFr}</span>
        <input name="description_fr" defaultValue={row?.description_fr} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 md:col-span-1">
        <span className="t-label text-muted">{x.descriptionEn}</span>
        <input name="description_en" defaultValue={row?.description_en} className={inputClass} />
      </label>
      {status && (
        <p role="status" className="text-[13px] text-accent md:col-span-4">
          {status}
        </p>
      )}
    </form>
  );
}
