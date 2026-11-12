"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};
import { useI18n } from "@/components/i18n/locale-provider";
import { useTheme, type ResolvedTheme, type ThemePref } from "./theme-provider";

const options: ThemePref[] = ["system", "light", "dark"];

export function ThemeToggle() {
  const { dict: t } = useI18n();
  const { pref, resolved, setPref } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const labels: Record<ThemePref, string> = {
    system: t.actions.themeSystem,
    light: t.actions.themeLight,
    dark: t.actions.themeDark,
  };

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.actions.theme}${mounted ? `: ${labels[pref]}` : ""}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-line text-fg transition-colors duration-300 hover:border-line-strong hover:text-accent"
      >
        <ThemeIcon pref={mounted ? pref : "system"} resolved={mounted ? resolved : "light"} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 z-50 w-44 origin-top-right overflow-hidden rounded-2xl border border-line-strong bg-surface p-1"
          >
            {options.map((option) => (
              <li key={option} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={pref === option}
                  onClick={(event) => {
                    const rect = (event.currentTarget.closest("[role=menu]") ?? event.currentTarget)
                      .getBoundingClientRect();
                    const origin = button.current?.getBoundingClientRect();
                    setPref(
                      option,
                      origin
                        ? { x: origin.left + origin.width / 2, y: origin.top + origin.height / 2 }
                        : { x: rect.right, y: rect.top },
                    );
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-2"
                >
                  {labels[option]}
                  {pref === option && <span aria-hidden className="h-1.5 w-1.5 bg-accent" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeIcon({ pref, resolved }: { pref: ThemePref; resolved: ResolvedTheme }) {
  const key = `${pref}-${resolved}`;
  return (
    <motion.svg
      key={key}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
      initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {pref === "system" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
        </>
      ) : resolved === "dark" ? (
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
    </motion.svg>
  );
}
