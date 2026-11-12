"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePref = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export type ThemeOrigin = { x: number; y: number };

type ThemeContextValue = {
  pref: ThemePref;
  resolved: ResolvedTheme;
  setPref: (next: ThemePref, origin?: ThemeOrigin) => void;
};

const STORAGE_KEY = "layr-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

function readPref(): ThemePref {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
}

function writePref(pref: ThemePref) {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // stockage indisponible (navigation privée) : le choix vaut pour la session
  }
}

function resolve(pref: ThemePref): ResolvedTheme {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function paint(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => (typeof window === "undefined" ? "system" : readPref()));
  const [resolved, setResolved] = useState<ResolvedTheme>(() => (typeof window === "undefined" ? "light" : resolve(readPref())));

  // Applique le thème à la racine (le script du <head> a déjà peint le bon thème au premier rendu).
  useEffect(() => {
    paint(resolved);
  }, [resolved]);

  // En mode Système, suit les changements de préférence de l'OS.
  useEffect(() => {
    if (pref !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const theme = resolve("system");
      setResolved(theme);
      paint(theme);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((next: ThemePref, origin?: ThemeOrigin) => {
    const apply = () => {
      writePref(next);
      setPrefState(next);
      const theme = resolve(next);
      setResolved(theme);
      paint(theme);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      apply();
      return;
    }

    const doc = document as ViewTransitionDocument;
    if (origin && doc.startViewTransition) {
      // Révélation circulaire depuis le bouton de thème
      const { x, y } = origin;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const transition = doc.startViewTransition(apply);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 550,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
      return;
    }

    // Repli : fondu des couleurs pendant 500 ms
    const root = document.documentElement;
    root.classList.add("theme-switching");
    apply();
    window.setTimeout(() => root.classList.remove("theme-switching"), 600);
  }, []);

  const value = useMemo(() => ({ pref, resolved, setPref }), [pref, resolved, setPref]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme doit être utilisé dans ThemeProvider");
  return context;
}
