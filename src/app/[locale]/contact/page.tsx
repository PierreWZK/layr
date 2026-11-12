import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/contact-form";
import { PageIntro } from "@/components/layout/page-intro";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

type PageProps = { params: Promise<{ locale: string }> };

export default function ContactPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <ContactContent {...props} />
    </Suspense>
  );
}

async function ContactContent({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-8">
      <PageIntro label={t.contact.label} title={t.contact.title} intro={t.contact.intro} />
      <div className="py-16">
        <ContactForm />
      </div>
    </div>
  );
}
