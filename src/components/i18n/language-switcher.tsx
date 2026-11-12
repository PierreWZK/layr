"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, locales } from "@/i18n/config";
import { useI18n } from "./locale-provider";

function persistLocale(target: string) {
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
}

// Bascule FR/EN en gardant la page courante. Le choix est mémorisé (cookie d'un an).
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict: t } = useI18n();
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  const hrefFor = (target: string) => (rest ? `/${target}/${rest}` : `/${target}`);


  return (
    <div
      role="group"
      aria-label={t.actions.language}
      className={`inline-flex h-9 items-stretch overflow-hidden rounded-full border border-line text-[12px] font-medium ${className ?? ""}`}
    >
      {locales.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={hrefFor(target)}
            hrefLang={target}
            lang={target}
            onClick={() => persistLocale(target)}
            aria-current={active ? "true" : undefined}
            className={`grid min-w-10 place-items-center px-2.5 tracking-[0.08em] transition-colors duration-300 ${
              active ? "bg-fg text-bg" : "text-muted hover:text-fg"
            }`}
          >
            {target.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
