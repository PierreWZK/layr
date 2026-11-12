import { adminUser } from "@/lib/admin";
import { listSubscribers } from "@/lib/admin-data";
import { error } from "@/lib/api";

// Export CSV des inscrits (séparateur virgule, UTF-8 avec BOM pour Excel)
export async function GET() {
  if (!(await adminUser())) return error("forbidden", 403);
  const rows = await listSubscribers();
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = ["email,locale,created_at", ...rows.map((r) => [r.email, r.locale, r.created_at].map(cell).join(","))].join("\r\n");
  return new Response(`﻿${csv}\r\n`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="layr-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
