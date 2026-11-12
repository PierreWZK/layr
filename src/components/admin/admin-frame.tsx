import Link from "next/link";
import type { ReactNode } from "react";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const ADMIN_TABS = {
  overview: "",
  sites: "/sites",
  new: "/sites/new",
  submissions: "/submissions",
  messages: "/messages",
  newsletter: "/newsletter",
  taxonomy: "/taxonomy",
} as const;
export type AdminTab = keyof typeof ADMIN_TABS;

// Cadre commun des pages admin : titre + onglets. L'accès est vérifié par chaque page avant ses lectures.
export function AdminFrame({ locale, current, children }: { locale: Locale; current: AdminTab; children: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8">
      <header className="border-b border-line py-10 md:py-14">
        <p className="t-label mb-4 flex items-center gap-3 text-muted">
          <span aria-hidden className="h-2 w-2 bg-accent" />
          {t.admin.label}
        </p>
        <h1 className="t-h1">{t.admin.nav[current]}</h1>
      </header>
      <nav aria-label={t.admin.label} className="-mx-4 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
        <ul className="flex min-w-max gap-6">
          {(Object.keys(ADMIN_TABS) as AdminTab[]).map((tab) => (
            <li key={tab}>
              <Link
                href={`/${locale}/admin${ADMIN_TABS[tab]}`}
                aria-current={tab === current ? "page" : undefined}
                className={`-mb-px block border-b-2 py-4 text-[14px] transition-colors ${
                  tab === current ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {t.admin.nav[tab]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="py-10">{children}</div>
    </div>
  );
}

export function AdminForbidden({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-4 py-24 md:px-8">
      <p className="t-label text-muted">{t.admin.label}</p>
      <p className="t-h2 max-w-2xl font-normal">{t.admin.forbidden}</p>
      <Link href={`/${locale}/account`} className="text-accent underline underline-offset-4">
        {t.admin.signIn}
      </Link>
    </div>
  );
}
