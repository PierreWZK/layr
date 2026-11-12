import type { Locale } from "./config";
import type { InspirationKey } from "@/lib/inspiration-params";

// Valeurs des facettes d'inspiration (telles que stockées en base) avec leur libellé [fr, en]
type Facet = Exclude<InspirationKey, "category">;

const LABELS: Record<Facet, Record<string, [string, string]>> = {
  style: {
    "Playful 3D": ["Ludique 3D", "Playful 3D"],
    Playful: ["Ludique", "Playful"],
    Immersive: ["Immersif", "Immersive"],
    "Immersive 3D": ["Immersif 3D", "Immersive 3D"],
    "Bold minimal": ["Minimal audacieux", "Bold minimal"],
    Minimal: ["Minimal", "Minimal"],
    Clean: ["Épuré", "Clean"],
    Bold: ["Audacieux", "Bold"],
    Editorial: ["Éditorial", "Editorial"],
    Precise: ["Précis", "Precise"],
    Polished: ["Soigné", "Polished"],
  },
  palette: {
    Warm: ["Chaude", "Warm"],
    Vibrant: ["Vive", "Vibrant"],
    Dark: ["Sombre", "Dark"],
    Monochrome: ["Monochrome", "Monochrome"],
    Neutral: ["Neutre", "Neutral"],
  },
  layout: {
    Fullscreen: ["Plein écran", "Fullscreen"],
    Asymmetric: ["Asymétrique", "Asymmetric"],
    "Single column": ["Colonne unique", "Single column"],
    "Two columns": ["Deux colonnes", "Two columns"],
    Grid: ["Grille", "Grid"],
    "Scroll story": ["Récit au défilement", "Scroll story"],
  },
  animation: {
    WebGL: ["WebGL", "WebGL"],
    "Micro-interactions": ["Micro-interactions", "Micro-interactions"],
    Subtle: ["Discret", "Subtle"],
    "Scroll-driven": ["Piloté par le défilement", "Scroll-driven"],
    None: ["Aucune", "None"],
  },
  industry: {
    Personal: ["Personnel", "Personal"],
    Design: ["Design", "Design"],
    Technology: ["Technologie", "Technology"],
    Education: ["Éducation", "Education"],
    Fintech: ["Fintech", "Fintech"],
    Beauty: ["Beauté", "Beauty"],
    Music: ["Musique", "Music"],
    Culture: ["Culture", "Culture"],
    Media: ["Médias", "Media"],
  },
};

export const facetValues = (facet: Facet): string[] => Object.keys(LABELS[facet]);

export function facetLabel(facet: Facet, value: string, locale: Locale): string {
  const pair = LABELS[facet][value];
  return pair ? pair[locale === "fr" ? 0 : 1] : value;
}
