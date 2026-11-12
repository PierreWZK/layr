"use client";

import { useEffect } from "react";

// Compte une ouverture de fiche (une fois par affichage) pour Tendances / Populaires
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const body = JSON.stringify({ slug });
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }, [slug]);
  return null;
}
