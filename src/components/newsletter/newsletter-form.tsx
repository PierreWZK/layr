"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/locale-provider";

// Inscription à la liste : stockée en base, sans envoi en V1
export function NewsletterForm() {
  const { locale, dict: t } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      element.reset();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <p className="text-[15px] text-muted">{t.newsletter.body}</p>
      {status === "done" ? (
        <p role="status" className="mt-6 text-[15px] font-medium text-accent">
          {t.newsletter.done}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">
            {t.newsletter.label}
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder={t.newsletter.placeholder}
            className="h-11 min-w-0 flex-1 border border-line-strong bg-bg px-3 text-[15px] placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-11 bg-accent px-5 font-medium text-accent-fg transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
          >
            {t.newsletter.submit}
          </button>
        </form>
      )}
      {status === "error" && (
        <p role="alert" className="mt-3 text-[14px] text-accent">
          {t.newsletter.error}
        </p>
      )}
    </div>
  );
}
