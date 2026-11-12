"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAccount } from "@/components/account/account-provider";
import { useI18n } from "@/components/i18n/locale-provider";
import { Field } from "@/components/ui/primitives";

const errorKeys = ["invalid_url", "invalid_email", "db_missing"] as const;

// Proposition publique : l'URL part dans la file de l'admin, rien n'est publié directement
export function SubmitForm() {
  const { locale, dict: t } = useI18n();
  const s = t.submitPage;
  const { user } = useAccount();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: form.get("url"), email: form.get("email"), note: form.get("note"), locale }),
      });
      if (res.ok) {
        element.reset();
        setStatus("sent");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const key = errorKeys.find((k) => k === data.error);
      setMessage(key ? s.errors[key] : s.errors.generic);
      setStatus("error");
    } catch {
      setMessage(s.errors.generic);
      setStatus("error");
    }
  };

  return (
    <div className="grid gap-12 md:grid-cols-12">
      <form onSubmit={submit} className="grid gap-6 md:col-span-7">
        <Field id="submit-url" name="url" type="text" inputMode="url" label={s.url} placeholder="https://" required maxLength={500} />
        <Field id="submit-email" name="email" type="email" label={s.email} autoComplete="email" maxLength={254} defaultValue={user?.email ?? ""} aria-describedby="submit-email-hint" />
        <p id="submit-email-hint" className="-mt-4 text-[13px] text-muted">
          {s.emailHint}
        </p>
        <label htmlFor="submit-note" className="flex flex-col gap-2">
          <span className="t-label text-muted">{s.note}</span>
          <textarea id="submit-note" name="note" rows={5} maxLength={1000} className="border border-line-strong bg-bg p-3 text-[16px] leading-relaxed" />
        </label>
        {message && (
          <p role="alert" className="border border-accent p-4 text-[15px]">
            {message}
          </p>
        )}
        {status === "sent" && (
          <p role="status" className="border border-line bg-surface p-4 text-[15px]">
            {s.sent}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex h-12 items-center bg-accent px-6 font-medium text-accent-fg transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
          >
            {status === "sending" ? s.sending : s.send}
          </button>
        </div>
      </form>
      {user?.role === "admin" && (
        <div className="md:col-span-5">
          <Link href={`/${locale}/admin/sites/new`} className="inline-flex text-[15px] font-medium text-accent underline underline-offset-4">
            {s.adminCta} →
          </Link>
        </div>
      )}
    </div>
  );
}
