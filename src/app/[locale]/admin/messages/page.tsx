import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { MessagesList } from "@/components/admin/inbox-lists";
import { isLocale } from "@/i18n/config";
import { adminUser } from "@/lib/admin";
import { listMessages } from "@/lib/admin-data";

type PageProps = { params: Promise<{ locale: string }> };

export default function MessagesPage(props: PageProps) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await adminUser())) return <AdminForbidden locale={locale} />;
  return (
    <AdminFrame locale={locale} current="messages">
      <MessagesList rows={await listMessages()} />
    </AdminFrame>
  );
}
