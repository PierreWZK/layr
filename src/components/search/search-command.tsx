"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { fmt } from "@/i18n/format";
import type { Suggestions } from "@/lib/websites";

const RECENT_KEY = "layr-recent-searches";

function readRecent(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const term = query.trim();
  if (!term) return;
  try {
    const next = [term, ...readRecent().filter((v) => v.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // stockage indisponible
  }
}

type Item = { key: string; group: string; label: string; meta?: string; href: string; query?: string };

export function SearchCommand() {
  const { locale, dict: t } = useI18n();
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Suggestions | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openPalette = useCallback(() => {
    setRecent(readRecent());
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setData(null);
    setStatus("idle");
    setActive(0);
    triggerRef.current?.focus();
  }, []);

  // Raccourci « / » pour ouvrir la recherche (sauf pendant une saisie)
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || open || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      openPalette();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, openPalette]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(id);
    };
  }, [open]);

  // Suggestions instantanées (attente de 150 ms entre deux frappes)
  useEffect(() => {
    const term = query.trim();
    if (!open || !term) return;
    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?locale=${locale}&q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        setData((await response.json()) as Suggestions);
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    }, 150);
    return () => {
      controller.abort();
      window.clearTimeout(id);
    };
  }, [query, open, locale]);

  const term = query.trim();
  const discover = (q: string) => `/${locale}/discover?q=${encodeURIComponent(q)}`;

  const items: Item[] = term
    ? [
        ...(data?.sites ?? []).map((s) => ({
          key: `s-${s.slug}`,
          group: t.search.sites,
          label: s.title,
          meta: s.domain,
          href: `/${locale}/site/${s.slug}`,
          query: term,
        })),
        ...(data?.categories ?? []).map((c) => ({
          key: `c-${c.slug}`,
          group: t.search.categories,
          label: c.name,
          href: `/${locale}/discover?cat=${c.slug}`,
        })),
        ...(data?.badges ?? []).map((b) => ({
          key: `b-${b.slug}`,
          group: t.search.badges,
          label: b.name,
          href: `/${locale}/discover?badge=${b.slug}`,
        })),
        ...(data?.tags ?? []).map((tag) => ({
          key: `t-${tag}`,
          group: t.search.tags,
          label: `#${tag}`,
          href: discover(tag),
          query: tag,
        })),
        { key: "all", group: "", label: fmt(t.search.seeAll, { q: term }), href: discover(term), query: term },
      ]
    : recent.map((r) => ({ key: `r-${r}`, group: t.search.recent, label: r, href: discover(r), query: r }));

  const go = (item: Item | undefined) => {
    const target = item ?? (term ? { key: "all", group: "", label: term, href: discover(term), query: term } : undefined);
    if (!target) return;
    if (target.query) saveRecent(target.query);
    close();
    router.push(target.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(items[active]);
    }
  };

  const hasResults = Boolean(data && (data.sites.length || data.categories.length || data.badges.length || data.tags.length));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPalette}
        aria-label={t.search.open}
        aria-keyshortcuts="/"
        className="group flex h-9 items-center gap-3 border border-line px-2.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg xl:w-56 xl:justify-between"
      >
        <span className="flex items-center gap-2">
          <SearchIcon />
          <span className="hidden xl:inline">{t.search.label}…</span>
        </span>
        <kbd className="hidden border border-line px-1.5 font-mono text-[11px] xl:inline">/</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[10vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button type="button" tabIndex={-1} aria-label={t.search.close} onClick={close} className="absolute inset-0 bg-charcoal/55" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.search.label}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl border border-line-strong bg-bg shadow-[0_40px_80px_-40px_rgb(23_23_23/0.6)]"
            >
              <div className="flex items-center gap-3 border-b border-line px-5">
                <SearchIcon />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    const value = event.target.value;
                    setQuery(value);
                    setActive(0);
                    if (!value.trim()) {
                      setData(null);
                      setStatus("idle");
                    } else {
                      setStatus("loading");
                    }
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={t.search.placeholder}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={items[active] ? `${listId}-${items[active].key}` : undefined}
                  aria-autocomplete="list"
                  className="h-16 w-full bg-transparent text-lg text-fg placeholder:text-muted focus:outline-none"
                />
                <kbd className="font-mono text-[11px] text-muted">Esc</kbd>
              </div>

              <div className="max-h-[56vh] overflow-y-auto p-2">
                {term && status === "error" && <p className="px-3 py-6 text-sm text-muted">{t.search.error}</p>}
                {term && status !== "error" && data && !hasResults && (
                  <div className="px-3 py-8">
                    <p className="text-lg font-semibold tracking-[-0.02em]">{fmt(t.search.empty, { q: term })}</p>
                    <p className="mt-1 text-sm text-muted">{t.search.emptyBody}</p>
                  </div>
                )}
                {term && status === "loading" && !data && <p className="px-3 py-6 text-sm text-muted">{t.search.loading}</p>}
                {!term && recent.length === 0 && <p className="px-3 py-6 text-sm text-muted">{t.search.start}</p>}
                {!term && recent.length > 0 && (
                  <div className="flex items-center justify-between px-3 pb-1 pt-2">
                    <span className="t-label text-muted">{t.search.recent}</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem(RECENT_KEY);
                        } catch {}
                        setRecent([]);
                      }}
                      className="text-[12px] text-muted hover:text-accent"
                    >
                      {t.search.clearRecent}
                    </button>
                  </div>
                )}

                <ul id={listId} role="listbox" aria-label={t.search.label}>
                  {items.map((item, index) => {
                    const showGroup = term && item.group && item.group !== items[index - 1]?.group;
                    return (
                      <li key={item.key} role="presentation">
                        {showGroup && <p className="t-label px-3 pb-1 pt-3 text-muted">{item.group}</p>}
                        <div
                          id={`${listId}-${item.key}`}
                          role="option"
                          aria-selected={index === active}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(item)}
                          className={`flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5 text-[15px] ${
                            index === active ? "bg-surface text-fg" : "text-fg"
                          } ${item.key === "all" ? "mt-2 border-t border-line text-accent" : ""}`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.meta && <span className="shrink-0 font-mono text-[12px] text-muted">{item.meta}</span>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="hidden items-center gap-5 border-t border-line px-5 py-3 text-[12px] text-muted sm:flex">
                <span>
                  <kbd className="font-mono">↑↓</kbd> {t.search.navigate}
                </span>
                <span>
                  <kbd className="font-mono">↵</kbd> {t.search.select}
                </span>
                <span>
                  <kbd className="font-mono">Esc</kbd> {t.search.close}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden className="shrink-0">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}
