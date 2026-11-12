"use client";

import { useEffect } from "react";
import { recordRecent } from "@/lib/recent-store";

// Compte une ouverture de fiche (une fois par affichage) pour Tendances / Populaires, et la note en « récemment vus »
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    recordRecent(slug);
    const body = JSON.stringify({ slug });
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }, [slug]);
  return null;
}
