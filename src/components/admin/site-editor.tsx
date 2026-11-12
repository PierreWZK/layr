"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { fmt } from "@/i18n/format";
import { facetLabel, facetValues } from "@/i18n/inspiration-labels";
import { STATUSES, emptySite, type SiteInput } from "@/lib/site-input";
import { buttonClass, ghostButtonClass, inputClass } from "./admin-styles";

type Option = { slug: string; name: string };
type Props = {
  mode: "new" | "edit";
  id?: string;
  slug?: string;
  initial?: SiteInput;
  initialUrl?: string;
  submissionId?: string;
  categories: Option[];
  badges: Option[];
};

const JSON_HEADERS = { "content-type": "application/json" };

// Création (analyse IA ou saisie manuelle) et édition d'une fiche. Rien n'est publié sans action de l'admin.
export function SiteEditor({ mode, id, slug, initial, initialUrl, submissionId, categories, badges }: Props) {
  const { locale, dict: t } = useI18n();
  const e = t.admin.editor;
  const a = t.admin.analyze;
  const router = useRouter();

  const [site, setSite] = useState<SiteInput | null>(initial ?? null);
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [visualText, setVisualText] = useState(initial?.visual_tags.join(", ") ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = (draft: SiteInput) => {
    setSite(draft);
    setTagsText(draft.tags.join(", "));
    setVisualText(draft.visual_tags.join(", "));
  };

  const set = <K extends keyof SiteInput>(key: K, value: SiteInput[K]) => {
    setSite((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  };

  const analyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnalyzing(true);
    setNotice(null);
    setError(null);
    setExistingId(null);
    try {
      const res = await fetch("/api/admin/analyze", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ url }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(a.errors[data.error as keyof typeof a.errors] ?? a.errors.generic);
        return;
      }
      load(data.draft as SiteInput);
      const notes: string[] = [];
      if (data.aiError) notes.push(a[data.aiError as "missing_key" | "quota" | "ai_failed"] ?? a.ai_failed);
      if (data.captureError) notes.push(fmt(a.captureFailed, { error: data.captureError }));
      setNotice({ tone: notes.length ? "warn" : "ok", text: notes.length ? notes.join(" ") : a.aiOk });
      setExistingId(data.existingId ?? null);
    } catch {
      setError(a.errors.generic);
    } finally {
      setAnalyzing(false);
    }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || !site) return;
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("name", site.title || "upload");
    const res = await fetch("/api/admin/upload", { method: "POST", body: form }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) set("screenshot_url", data.url);
    else setError(e.errors[data.error as keyof typeof e.errors] ?? e.errors.generic);
    setUploading(false);
    input.value = "";
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!site) return;
    setSaving(true);
    setError(null);
    const res = await fetch(mode === "edit" ? `/api/admin/sites/${id}` : "/api/admin/sites", {
      method: mode === "edit" ? "PUT" : "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ ...site, tags: tagsText, visual_tags: visualText }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setSaving(false);
    if (!res?.ok) {
      setError(e.errors[data.error as keyof typeof e.errors] ?? e.errors.generic);
      return;
    }
    if (mode === "new") {
      if (submissionId) {
        await fetch(`/api/admin/submissions/${submissionId}`, {
          method: "PATCH",
          headers: JSON_HEADERS,
          body: JSON.stringify({ status: "processed" }),
        }).catch(() => {});
      }
      router.push(`/${locale}/admin/sites/${data.id}`);
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-10">
      {mode === "new" && (
        <section className="border border-line bg-surface p-6 md:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{a.title}</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">{a.intro}</p>
          <form onSubmit={analyze} className="mt-6 flex flex-col gap-3 md:flex-row">
            <label className="sr-only" htmlFor="analyze-url">
              {a.url}
            </label>
            <input
              id="analyze-url"
              type="text"
              inputMode="url"
              required
              value={url}
              onChange={(ev) => setUrl(ev.target.value)}
              placeholder="https://"
              className={`${inputClass} md:flex-1`}
            />
            <button type="submit" disabled={analyzing} className={buttonClass}>
              {analyzing ? a.running : a.run}
            </button>
            <button
              type="button"
              disabled={analyzing}
              onClick={() => load({ ...emptySite, url: url.trim() })}
              className="inline-flex h-11 items-center justify-center border border-line-strong px-5 text-[14px] hover:bg-fg hover:text-bg"
            >
              {a.manual}
            </button>
          </form>
          {analyzing && <p className="mt-4 text-[14px] text-muted" role="status">{a.running}</p>}
          {notice && (
            <p role="status" className={`mt-4 border p-4 text-[14px] ${notice.tone === "ok" ? "border-line-strong" : "border-accent"}`}>
              {notice.text}
            </p>
          )}
          {existingId && (
            <p className="mt-3 text-[14px]">
              {a.existing}{" "}
              <Link href={`/${locale}/admin/sites/${existingId}`} className="text-accent underline underline-offset-4">
                {a.openExisting}
              </Link>
            </p>
          )}
        </section>
      )}

      {error && (
        <p role="alert" className="border border-accent p-4 text-[15px]">
          {error}
        </p>
      )}

      {site && (
        <form onSubmit={save} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-12">
            <Section title={e.sectionGeneral}>
              <Text label={e.url} value={site.url} onChange={(v) => set("url", v)} required />
              <Text label={e.title} value={site.title} onChange={(v) => set("title", v)} required />
              <div className="grid gap-6 md:grid-cols-2">
                <Text label={e.titleFr} value={site.title_fr ?? ""} onChange={(v) => set("title_fr", v || null)} />
                <Text label={e.titleEn} value={site.title_en ?? ""} onChange={(v) => set("title_en", v || null)} />
              </div>
            </Section>

            <Section title={e.sectionTexts}>
              <div className="grid gap-6 md:grid-cols-2">
                <Area label={e.descriptionFr} value={site.description_fr} onChange={(v) => set("description_fr", v)} rows={4} />
                <Area label={e.descriptionEn} value={site.description_en} onChange={(v) => set("description_en", v)} rows={4} />
                <Area label={e.reviewFr} value={site.review_fr} onChange={(v) => set("review_fr", v)} rows={7} />
                <Area label={e.reviewEn} value={site.review_en} onChange={(v) => set("review_en", v)} rows={7} />
              </div>
            </Section>

            <Section title={e.sectionClassification}>
              <div className="grid gap-6 md:grid-cols-2">
                <Choice
                  label={e.category}
                  value={site.category ?? ""}
                  onChange={(v) => set("category", v || null)}
                  options={[{ value: "", label: e.none }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
                />
                <Choice
                  label={e.contentType}
                  value={site.content_type}
                  onChange={(v) => set("content_type", v === "inspiration" ? "inspiration" : "resource")}
                  options={[
                    { value: "resource", label: e.resource },
                    { value: "inspiration", label: e.inspiration },
                  ]}
                />
              </div>
              <fieldset>
                <legend className="t-label mb-3 text-muted">{e.badges}</legend>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => {
                    const on = site.badges.includes(badge.slug);
                    return (
                      <button
                        key={badge.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("badges", on ? site.badges.filter((b) => b !== badge.slug) : [...site.badges, badge.slug])}
                        className={`border px-3 py-1.5 text-[13px] transition-colors ${on ? "border-accent bg-accent text-accent-fg" : "border-line-strong hover:border-accent"}`}
                      >
                        {badge.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <Text label={e.tags} hint={e.tagsHint} value={tagsText} onChange={setTagsText} />
            </Section>

            {site.content_type === "inspiration" && (
              <Section title={e.sectionInspiration}>
                <div className="grid gap-6 md:grid-cols-2">
                  <Choice
                    label={e.inspirationCategory}
                    value={site.inspiration_category ?? ""}
                    onChange={(v) => set("inspiration_category", v || null)}
                    options={[
                      { value: "", label: e.none },
                      ...Object.entries(t.inspirationCategories).map(([value, label]) => ({ value, label })),
                    ]}
                  />
                  <Text label={e.creator} value={site.creator_name ?? ""} onChange={(v) => set("creator_name", v || null)} />
                  {(
                    [
                      ["visual_style", "style", e.style],
                      ["color_palette", "palette", e.palette],
                      ["layout_type", "layout", e.layout],
                      ["animation_type", "animation", e.animation],
                      ["industry", "industry", e.industry],
                    ] as const
                  ).map(([key, facet, label]) => (
                    <Choice
                      key={key}
                      label={label}
                      value={site[key] ?? ""}
                      onChange={(v) => set(key, v || null)}
                      options={[{ value: "", label: e.none }, ...facetValues(facet).map((v) => ({ value: v, label: facetLabel(facet, v, locale) }))]}
                    />
                  ))}
                  <Text label={e.visualTags} hint={e.tagsHint} value={visualText} onChange={setVisualText} />
                </div>
              </Section>
            )}
          </div>

          {/* Colonne de publication : capture, note, statut */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="t-label mb-3 text-muted">{e.screenshot}</p>
              <div className="overflow-hidden border border-line-strong bg-surface-2">
                {site.screenshot_url ? (
                  <Image src={site.screenshot_url} alt="" width={1200} height={750} unoptimized className="aspect-[16/10] w-full object-cover object-top" />
                ) : (
                  <div className="grid aspect-[16/10] place-items-center text-[13px] text-muted">{e.noShot}</div>
                )}
              </div>
              <label className={`${ghostButtonClass} mt-3 cursor-pointer`}>
                {uploading ? e.uploading : e.upload}
                <input type="file" accept="image/*" onChange={upload} className="sr-only" disabled={uploading} />
              </label>
            </div>
            <Text
              label={e.rating}
              hint={e.ratingHint}
              type="number"
              value={site.rating === null ? "" : String(site.rating)}
              onChange={(v) => set("rating", v === "" ? null : Number(v))}
              step="0.1"
              min="0"
              max="10"
            />
            <Choice
              label={e.status}
              value={site.status}
              onChange={(v) => set("status", STATUSES.find((s) => s === v) ?? "draft")}
              options={STATUSES.map((s) => ({ value: s, label: t.admin.status[s] }))}
            />
            <label className="flex items-center gap-3 text-[15px]">
              <input type="checkbox" checked={site.is_featured} onChange={(ev) => set("is_featured", ev.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              {e.featured}
            </label>
            <button type="submit" disabled={saving || uploading} className={buttonClass}>
              {saving ? e.saving : mode === "new" ? e.create : e.save}
            </button>
            {saved && (
              <p role="status" className="text-[14px] text-accent">
                {e.saved}
              </p>
            )}
            {mode === "edit" && slug && site.status === "published" && (
              <Link href={`/${locale}/site/${slug}`} className="text-[14px] text-accent underline underline-offset-4">
                {t.admin.sites.view} ↗
              </Link>
            )}
          </aside>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="mb-6 w-full border-b border-line pb-3 text-[13px] font-medium uppercase tracking-[0.12em] text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function Text({
  label,
  hint,
  value,
  onChange,
  ...rest
}: { label: string; hint?: string; value: string; onChange: (value: string) => void } & Omit<
  ComponentProps<"input">,
  "value" | "onChange"
>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-label text-muted">{label}</span>
      <input {...rest} value={value} onChange={(ev) => onChange(ev.target.value)} className={inputClass} />
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

function Area({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-label text-muted">{label}</span>
      <textarea value={value} rows={rows} onChange={(ev) => onChange(ev.target.value)} className="border border-line-strong bg-bg p-3 text-[15px] leading-relaxed" />
    </label>
  );
}

function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-label text-muted">{label}</span>
      <select value={value} onChange={(ev) => onChange(ev.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
