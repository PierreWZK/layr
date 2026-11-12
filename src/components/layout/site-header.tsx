"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "./logo";

export function SiteHeader() {
  const { locale, dict: t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 md:px-8">
        <Link href={`/${locale}`} aria-label={t.actions.home} className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[17px] font-semibold tracking-[-0.03em]">LayR</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const active = isActive(link.key);
            return (
              <Link
                key={link.key}
                href={hrefOf(link.key)}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-[14px] transition-colors duration-300 ${
                  active ? "text-fg" : "text-muted hover:text-fg"
                }`}
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
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <ThemeToggle />
          <div className="hidden md:block">
            <ButtonLink href={hrefOf("submit")} size="sm">
              {t.nav.submit}
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.actions.closeMenu : t.actions.openMenu}
            className="grid h-9 w-9 place-items-center border border-line lg:hidden"
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
            <ul className="flex flex-col px-4 py-6 md:px-8">
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
                <ButtonLink href={hrefOf("submit")} onClick={() => setMenuOpen(false)} className="w-full">
                  {t.nav.submit}
                </ButtonLink>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
