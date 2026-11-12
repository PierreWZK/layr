"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAccount } from "@/components/account/account-provider";
import { useI18n } from "@/components/i18n/locale-provider";
import { WebsiteCard } from "@/components/site/website-card";
import { fmt, plural } from "@/i18n/format";
import { useFavorites } from "@/lib/favorites-store";
import { useRecent } from "@/lib/recent-store";
import { useWebsitesBySlugs } from "@/lib/use-websites";
import type { Website } from "@/lib/websites";

type Collection = { id: string; name: string; description: string; slugs: string[] };
type SortKey = "saved" | "rating" | "title";

// Favoris (local, synchronisés si connecté), collections et sites récemment consultés
export function FavoritesView() {
  const { locale, dict: t } = useI18n();
  const { user } = useAccount();
  const entries = useFavorites();
  const recent = useRecent();
  const saved = useWebsitesBySlugs(entries.map((e) => e.slug));
  const recentSites = useWebsitesBySlugs(recent.slice(0, 8).map((e) => e.slug));

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortKey>("saved");

  const sites = useMemo(() => saved.sites ?? [], [saved.sites]);
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    sites.forEach((s) => s.category && map.set(s.category.slug, s.category.name));
    return [...map.entries()];
  }, [sites]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = sites.filter(
      (s) =>
        (!category || s.category?.slug === category) &&
        (!q || `${s.title} ${s.domain} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(q)),
    );
    if (sort === "rating") return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title, locale));
    return list;
  }, [sites, query, category, sort, locale]);

  const signedIn = Boolean(user);

  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-muted">{signedIn ? t.favoritesPage.synced : t.favoritesPage.deviceOnly}</p>
        {!signedIn && (
          <Link href={`/${locale}/account`} className="text-[15px] font-medium text-accent underline underline-offset-4">
            {t.favoritesPage.signInCta}
          </Link>
        )}
      </div>

      <section aria-label={t.favoritesPage.label}>
        {entries.length === 0 ? (
          <div className="border border-line bg-surface p-8 md:p-12">
            <p className="text-2xl font-semibold tracking-[-0.03em]">{t.favoritesPage.emptyTitle}</p>
            <p className="mt-2 text-muted">{t.favoritesPage.emptyBody}</p>
            <Link href={`/${locale}/discover`} className="mt-8 inline-flex h-12 items-center bg-accent px-5 font-medium text-accent-fg hover:bg-fg hover:text-bg">
              {t.favoritesPage.explore} ↗
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
              <label className="flex w-full max-w-md flex-col gap-2">
                <span className="sr-only">{t.favoritesPage.searchPlaceholder}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.favoritesPage.searchPlaceholder}
                  className="h-11 border border-line-strong bg-bg px-3 text-[15px] placeholder:text-muted"
                />
              </label>
              <div className="flex flex-wrap items-center gap-4 text-[14px]">
                <label className="flex items-center gap-2">
                  <span className="text-muted">{t.favoritesPage.category}</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 border border-line-strong bg-bg px-3">
                    <option value="">{t.favoritesPage.allCategories}</option>
                    {categories.map(([slug, name]) => (
                      <option key={slug} value={slug}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-muted">{t.favoritesPage.sortBy}</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 border border-line-strong bg-bg px-3">
                    <option value="saved">{t.favoritesPage.sortSaved}</option>
                    <option value="rating">{t.favoritesPage.sortRating}</option>
                    <option value="title">{t.favoritesPage.sortTitle}</option>
                  </select>
                </label>
                <span className="text-muted" aria-live="polite">
                  {plural(visible.length, t.favoritesPage.countOne, t.favoritesPage.countMany)}
                </span>
              </div>
            </div>

            {saved.failed ? (
              <p className="border border-line bg-surface p-6 text-muted">{t.favoritesPage.loadFailed}</p>
            ) : saved.sites === null ? (
              <p className="text-muted">{t.favoritesPage.loading}</p>
            ) : visible.length === 0 ? (
              <p className="text-muted">{t.favoritesPage.noMatch}</p>
            ) : (
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((site) => (
                  <li key={site.id}>
                    <WebsiteCard site={site} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <CollectionsSection signedIn={signedIn} sites={sites} />

      {recent.length > 0 && (
        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="t-label mb-6 text-muted">
            {t.favoritesPage.recentTitle}
          </h2>
          {recentSites.sites && (
            <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
              {recentSites.sites.map((site: Website) => (
                <li key={site.id} className="bg-bg">
                  <Link href={`/${locale}/site/${site.slug}`} className="flex flex-col gap-1 p-5 transition-colors hover:bg-surface">
                    <span className="text-[16px] font-medium">{site.title}</span>
                    <span className="font-mono text-[12px] text-muted">{site.domain}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

// Collections : nécessitent un compte. Un seul panneau ouvert à la fois.
function CollectionsSection({ signedIn, sites }: { signedIn: boolean; sites: Website[] }) {
  const { locale, dict: t } = useI18n();
  const [version, setVersion] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const collections = useCollections(signedIn, version);

  const active = collections?.find((c) => c.id === activeId) ?? collections?.[0] ?? null;
  const activeSites = useWebsitesBySlugs(active?.slugs ?? []);
  const addable = sites.filter((s) => !active?.slugs.includes(s.slug));

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { id: string };
    setNewName("");
    setActiveId(data.id);
    setVersion((v) => v + 1);
  };

  const addSite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!active || !addSlug) return;
    await fetch(`/api/collections/${active.id}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: addSlug }),
    });
    setAddSlug("");
    setVersion((v) => v + 1);
  };

  const removeSite = async (slug: string) => {
    if (!active) return;
    await fetch(`/api/collections/${active.id}/items`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setVersion((v) => v + 1);
  };

  const remove = async () => {
    if (!active) return;
    await fetch(`/api/collections/${active.id}`, { method: "DELETE" });
    setActiveId(null);
    setVersion((v) => v + 1);
  };

  return (
    <section aria-labelledby="collections-title" className="border-t border-line pt-16">
      <h2 id="collections-title" className="t-h2 font-normal">
        {t.favoritesPage.collectionsTitle}
      </h2>
      {!signedIn ? (
        <p className="mt-4 max-w-xl text-muted">
          {t.favoritesPage.collectionsSignedOut}{" "}
          <Link href={`/${locale}/account`} className="text-accent underline underline-offset-4">
            {t.favoritesPage.signInCta}
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <p className="text-muted">{t.favoritesPage.collectionsBody}</p>
            <form onSubmit={create} className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                aria-label={t.favoritesPage.collectionName}
                placeholder={t.favoritesPage.collectionName}
                maxLength={80}
                className="h-11 min-w-0 flex-1 border border-line-strong bg-bg px-3"
              />
              <button type="submit" className="h-11 bg-accent px-4 font-medium text-accent-fg hover:bg-fg hover:text-bg">
                {t.favoritesPage.create}
              </button>
            </form>
            <ul className="flex flex-col border-t border-line">
              {(collections ?? []).map((c) => (
                <li key={c.id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    aria-current={active?.id === c.id}
                    className={`flex w-full items-center justify-between gap-4 py-4 text-left transition-colors ${
                      active?.id === c.id ? "text-accent" : "hover:text-accent"
                    }`}
                  >
                    <span className="text-[16px] font-medium">{c.name}</span>
                    <span className="font-mono text-[12px] text-muted">
                      {plural(c.slugs.length, t.favoritesPage.collectionCountOne, t.favoritesPage.collectionCountMany)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {!active ? (
              <p className="text-muted">{t.favoritesPage.newCollection}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{active.name}</h3>
                  <button type="button" onClick={remove} className="text-[14px] text-muted underline underline-offset-4 hover:text-accent">
                    {t.favoritesPage.deleteCollection}
                  </button>
                </div>
                {addable.length > 0 && (
                  <form onSubmit={addSite} className="mt-6 flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="add-favorite">
                      {t.favoritesPage.addSite}
                    </label>
                    <select
                      id="add-favorite"
                      value={addSlug}
                      onChange={(e) => setAddSlug(e.target.value)}
                      className="h-11 min-w-0 flex-1 border border-line-strong bg-bg px-3"
                    >
                      <option value="">{t.favoritesPage.addSite}</option>
                      {addable.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <button type="submit" disabled={!addSlug} className="h-11 border border-line-strong px-4 hover:bg-fg hover:text-bg disabled:opacity-40">
                      {t.favoritesPage.addButton}
                    </button>
                  </form>
                )}
                {active.slugs.length === 0 ? (
                  <p className="mt-8 text-muted">{t.favoritesPage.emptyCollection}</p>
                ) : activeSites.sites ? (
                  <ul className="mt-8 flex flex-col border-t border-line">
                    {activeSites.sites.map((site) => (
                      <li key={site.id} className="flex items-center justify-between gap-4 border-b border-line py-4">
                        <Link href={`/${locale}/site/${site.slug}`} className="min-w-0 hover:text-accent">
                          <span className="block truncate text-[16px] font-medium">{site.title}</span>
                          <span className="font-mono text-[12px] text-muted">{site.domain}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeSite(site.slug)}
                          aria-label={fmt(t.favoritesPage.removeFromCollection, { title: site.title })}
                          className="shrink-0 text-[14px] text-muted underline underline-offset-4 hover:text-accent"
                        >
                          {t.favoritesPage.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Collections du compte, rechargées quand `version` change. Renvoie null pendant le chargement.
function useCollections(enabled: boolean, version: number): Collection[] | null {
  const [state, setState] = useState<{ version: number; list: Collection[] } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetch("/api/collections", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { collections: Collection[] }) => {
        if (alive) setState({ version, list: data.collections });
      })
      .catch(() => {
        if (alive) setState({ version, list: [] });
      });
    return () => {
      alive = false;
    };
  }, [enabled, version]);

  if (!enabled) return null;
  return state?.version === version ? state.list : null;
}
