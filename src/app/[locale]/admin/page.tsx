import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminForbidden, AdminFrame } from "@/components/admin/admin-frame";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { adminUser } from "@/lib/admin";
import { adminStats, type AdminStats } from "@/lib/admin-data";

type PageProps = { params: Promise<{ locale: string }> };

export default function AdminPage(props: PageProps) {
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
  const t = getDictionary(locale);
  const stats = await adminStats();
  const base = `/${locale}/admin`;
  const tiles: { key: keyof AdminStats; href: string }[] = [
    { key: "pending", href: `${base}/sites?status=pending` },
    { key: "newSubmissions", href: `${base}/submissions` },
    { key: "unreadMessages", href: `${base}/messages` },
    { key: "published", href: `${base}/sites?status=published` },
    { key: "drafts", href: `${base}/sites?status=draft` },
    { key: "subscribers", href: `${base}/newsletter` },
    { key: "users", href: base },
  ];
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  return (
    <AdminFrame locale={locale} current="overview">
      <p className={`mb-10 border p-4 text-[15px] ${process.env.GEMINI_API_KEY ? "border-line-strong" : "border-accent"}`}>
        {process.env.GEMINI_API_KEY ? fmt(t.admin.geminiOn, { model }) : t.admin.geminiOff}
      </p>
      <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.key} className="bg-bg">
            <Link href={tile.href} className="flex h-full flex-col gap-3 p-6 transition-colors hover:bg-surface">
              <span className="t-label text-muted">{t.admin.stats[tile.key]}</span>
              <span className="text-5xl font-semibold tabular-nums tracking-[-0.05em]">{stats[tile.key]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminFrame>
  );
}
