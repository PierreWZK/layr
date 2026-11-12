"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { Field } from "@/components/ui/primitives";

const errorKeys = ["invalid_name", "invalid_email", "message_too_short", "db_missing"] as const;

// Formulaire de contact : message stocké en base, lu dans l'admin (étape 4)
export function ContactForm() {
  const { locale, dict: t } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          locale,
        }),
      });
      if (res.ok) {
        element.reset();
        setStatus("sent");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const key = (errorKeys as readonly string[]).includes(data.error ?? "") ? (data.error as (typeof errorKeys)[number]) : null;
      setMessage(key ? t.contact.errors[key] : t.contact.errors.generic);
      setStatus("error");
    } catch {
      setMessage(t.contact.errors.generic);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-6">
      <Field id="contact-name" name="name" label={t.contact.name} autoComplete="name" required maxLength={120} />
      <Field id="contact-email" name="email" type="email" label={t.contact.email} autoComplete="email" required maxLength={254} />
      <label htmlFor="contact-message" className="flex flex-col gap-2">
        <span className="t-label text-muted">{t.contact.message}</span>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={7}
          aria-describedby="contact-message-hint"
          className="border border-line-strong bg-bg p-3 text-[16px] leading-relaxed"
        />
        <span id="contact-message-hint" className="text-[13px] text-muted">
          {t.contact.messageHint}
        </span>
      </label>
      {message && (
        <p role="alert" className="border border-accent p-4 text-[15px]">
          {message}
        </p>
      )}
      {status === "sent" && (
        <p role="status" className="border border-line bg-surface p-4 text-[15px]">
          {t.contact.sent}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 items-center bg-accent px-6 font-medium text-accent-fg transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
        >
          {status === "sending" ? t.contact.sending : t.contact.send}
        </button>
      </div>
    </form>
  );
}
