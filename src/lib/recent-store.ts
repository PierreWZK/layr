"use client";

import { useSyncExternalStore } from "react";

// Sites récemment ouverts : sur l'appareil, pour tous les visiteurs (connectés ou non)
export type RecentEntry = { slug: string; viewedAt: string };

const KEY = "layr-recent";
const MAX = 12;
const EMPTY: RecentEntry[] = [];
const listeners = new Set<() => void>();
let cache: RecentEntry[] | null = null;

function read(): RecentEntry[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed)
      ? parsed.filter(
          (item): item is RecentEntry => typeof item?.slug === "string" && typeof item?.viewedAt === "string",
        )
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: RecentEntry[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // stockage indisponible : la liste vit pour la session
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRecent(): RecentEntry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function recordRecent(slug: string) {
  const list = read().filter((entry) => entry.slug !== slug);
  write([{ slug, viewedAt: new Date().toISOString() }, ...list].slice(0, MAX));
}
