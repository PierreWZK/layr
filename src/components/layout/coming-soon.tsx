"use client";

import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/locale-provider";
import type { Dictionary } from "@/i18n/dictionaries/en";

// Page réservée à une étape ultérieure : affiche son nom et l'état réel, sans contenu factice
export function ComingSoon({ section }: { section: keyof Dictionary["nav"] }) {
  const { locale, dict: t } = useI18n();
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center gap-8 px-4 py-24 md:px-8">
      <p className="t-label text-muted">{t.common.comingSoon}</p>
      <h1 className="t-display">{t.nav[section]}</h1>
      <p className="t-lead max-w-lg text-muted">{t.common.comingSoonBody}</p>
      <div>
        <ButtonLink href={`/${locale}`} variant="secondary">
          {t.common.backHome}
        </ButtonLink>
      </div>
    </section>
  );
}
