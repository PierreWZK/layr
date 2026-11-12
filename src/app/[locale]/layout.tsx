import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const image = { url: `/og/${locale}.png`, width: 1200, height: 630, alt: "LayR" };
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://layr.projectp.fr"),
    title: { default: "LayR", template: `%s — LayR` },
    description: t.meta.description,
    alternates: {
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: "LayR",
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `/${locale}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [image.url],
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <LocaleShell params={params}>{children}</LocaleShell>
    </Suspense>
  );
}

async function LocaleShell({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <Providers locale={locale} dict={dict}>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </Providers>
  );
}
