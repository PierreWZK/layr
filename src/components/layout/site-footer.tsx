"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { Reveal } from "@/components/motion/reveal";
import { LogoMark } from "./logo";

export function SiteFooter() {
  const { locale, dict: t } = useI18n();

  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <h2 className="t-h1 max-w-[16ch] text-balance">{t.footer.headline}</h2>
        </Reveal>

        <div className="mt-20 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="t-lead max-w-sm text-muted">{t.footer.tagline}</p>
            <div className="mt-8">
              <LanguageSwitcher />
            </div>
          </div>

          <nav aria-label={t.footer.navigation} className="md:col-span-3">
            <p className="t-label mb-5 text-muted">{t.footer.navigation}</p>
            <ul className="flex flex-col gap-3 text-[15px]">
              {["discover", "inspiration", "categories", "trending", "favorites"].map((key) => (
                <li key={key}>
                  <Link href={`/${locale}/${key}`} className="hover:text-accent">
                    {t.nav[key as keyof typeof t.nav]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="t-label mb-5 text-muted">{t.footer.project}</p>
            <ul className="flex flex-col gap-3 text-[15px]">
              <li>
                <Link href={`/${locale}/submit`} className="hover:text-accent">
                  {t.nav.submit}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/PierreWZK/layr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  {t.footer.github} ↗
                </a>
              </li>
              <li>
                <a
                  href="https://projectp.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  {t.footer.studio} ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-3 text-fg">
            <LogoMark size={18} />
            LayR ©
          </span>
          <span>{t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
