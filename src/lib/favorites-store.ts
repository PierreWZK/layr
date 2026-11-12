"use client";

import { useSyncExternalStore } from "react";

// Favoris anonymes : stockés sur l'appareil. La synchro par compte arrive à l'étape 3.
export type FavoriteEntry = { slug: string; savedAt: string };

const KEY = "layr-favorites";
const EMPTY: FavoriteEntry[] = [];
const listeners = new Set<() => void>();
let cache: FavoriteEntry[] | null = null;

function read(): FavoriteEntry[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed)
      ? parsed.filter(
          (item): item is FavoriteEntry =>
            typeof item?.slug === "string" && typeof item?.savedAt === "string",
        )
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: FavoriteEntry[]) {
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
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites(): FavoriteEntry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

// Renvoie true si le site vient d'être ajouté
export function toggleFavorite(slug: string): boolean {
  const list = read();
  const saved = list.some((entry) => entry.slug === slug);
  write(saved ? list.filter((entry) => entry.slug !== slug) : [{ slug, savedAt: new Date().toISOString() }, ...list]);
  return !saved;
}
