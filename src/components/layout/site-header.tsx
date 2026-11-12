"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SearchCommand } from "@/components/search/search-command";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ArrowCircle } from "@/components/ui/arrow-circle";

// En-tête « cadre » : barre charbon dans les deux thèmes (classe .dark = jetons sombres pour les contrôles)
export function SiteHeader() {
  const { locale, dict: t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === `/${locale}`;

  const links = [
    { key: "discover", label: t.nav.discover },
    { key: "inspiration", label: t.nav.inspiration },
    { key: "categories", label: t.nav.categories },
    { key: "trending", label: t.nav.trending },
    { key: "favorites", label: t.nav.favorites },
  ] as const;

  const hrefOf = (key: string) => `/${locale}/${key}`;
  const isActive = (key: string) => pathname === hrefOf(key) || pathname.startsWith(`${hrefOf(key)}/`);

  return (
    <header className={`dark sticky top-0 z-40 bg-charcoal text-fg ${isHome ? "" : "border-b border-line"}`}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-7">
        <Link href={`/${locale}`} aria-label={t.actions.home} className="group flex items-center gap-2.5">
          <span className="rounded-lg bg-champagne px-2 py-1 text-[15px] font-semibold leading-none tracking-[-0.03em] text-charcoal transition-colors duration-300 group-hover:bg-amber">
            LayR
          </span>
          <span className="hidden text-[14px] font-medium tracking-[-0.01em] sm:inline">{t.nav.tagline}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const active = isActive(link.key);
            return (
              <Link
                key={link.key}
                href={hrefOf(link.key)}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-[13px] transition-colors duration-300 ${active ? "text-fg" : "text-muted hover:text-fg"}`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-1 h-px bg-accent"
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <SearchCommand />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <Link
            href={hrefOf("account")}
            aria-label={t.account.label}
            title={t.account.label}
            aria-current={isActive("account") ? "page" : undefined}
            className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="12" cy="8.5" r="3.8" />
              <path d="M4.5 20.5c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" strokeLinecap="round" />
            </svg>
          </Link>
          {/* Sur l'accueil (grand écran), le bouton vit dans l'encoche du héro */}
          <Link
            href={hrefOf("submit")}
            className={`group hidden h-10 items-center gap-3 rounded-full bg-champagne pl-4 pr-1 text-[13px] font-medium text-charcoal transition-colors duration-300 hover:bg-amber md:flex ${
              isHome ? "lg:hidden" : ""
            }`}
          >
            {t.nav.submit}
            <ArrowCircle tone="dark" />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.actions.closeMenu : t.actions.openMenu}
            className="grid h-9 w-9 place-items-center rounded-full border border-line lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute inset-x-0 top-0 h-px bg-fg transition-transform duration-300 ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-fg transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <ul className="flex flex-col px-4 py-6 md:px-7">
              {links.map((link, index) => (
                <motion.li
                  key={link.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04, duration: 0.4 }}
                  className="border-b border-line"
                >
                  <Link
                    href={hrefOf(link.key)}
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 text-3xl font-semibold tracking-[-0.04em]"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <li className="flex flex-col gap-4 pt-6">
                <LanguageSwitcher />
                <Link
                  href={hrefOf("submit")}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-12 items-center justify-between rounded-full bg-champagne pl-5 pr-1.5 font-medium text-charcoal"
                >
                  {t.nav.submit}
                  <ArrowCircle tone="dark" />
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
