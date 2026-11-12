"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import type { Website } from "./websites";

// Fiches pour une liste de slugs. Les données sont rattachées à leur clé : pas de setState synchrone dans l'effet.
export function useWebsitesBySlugs(slugs: string[]): { sites: Website[] | null; failed: boolean } {
  const { locale } = useI18n();
  const key = slugs.join(",");
  const [state, setState] = useState<{ key: string; sites: Website[] | null; failed: boolean } | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    fetch(`/api/websites?locale=${locale}&slugs=${encodeURIComponent(key)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { items: Website[] }) => {
        if (alive) setState({ key, sites: data.items, failed: false });
      })
      .catch(() => {
        if (alive) setState({ key, sites: null, failed: true });
      });
    return () => {
      alive = false;
    };
  }, [key, locale]);

  if (!key) return { sites: [], failed: false };
  if (state?.key !== key) return { sites: null, failed: false };
  return { sites: state.sites, failed: state.failed };
}
