"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { Field } from "@/components/ui/primitives";
import { fmt } from "@/i18n/format";
import { useAccount } from "./account-provider";

const errorKeys = ["invalid_email", "weak_password", "invalid_credentials", "email_taken", "db_missing"] as const;

// Connexion et inscription par e-mail. Le mot de passe ne quitte jamais le navigateur en clair hors de cette requête.
export function AccountPanel() {
  const { locale, dict: t } = useI18n();
  const { user, ready, setUser, signOut } = useAccount();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!ready) return <p className="text-muted">{t.account.loading}</p>;

  if (user) {
    const since = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(user.createdAt),
    );
    return (
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-4xl font-semibold tracking-[-0.04em]">
            {fmt(t.account.hello, { name: user.displayName ?? user.email })}
          </p>
          <p className="mt-3 font-mono text-[13px] text-muted">{user.email}</p>
          <p className="mt-1 text-[13px] text-muted">{fmt(t.account.memberSince, { date: since })}</p>
        </div>
        <div className="flex flex-col items-start gap-4 md:col-span-5">
          <Link href={`/${locale}/favorites`} className="inline-flex h-12 items-center bg-accent px-5 font-medium text-accent-fg hover:bg-fg hover:text-bg">
            {t.account.goFavorites} ↗
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex h-12 items-center border border-line-strong px-5 font-medium hover:bg-fg hover:text-bg"
          >
            {t.account.signOut}
          </button>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const register = mode === "register";
    setPending(true);
    setError(null);
    try {
      const res = await fetch(register ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          displayName: form.get("name") ?? "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { user?: Parameters<typeof setUser>[0]; error?: string };
      if (!res.ok || !data.user) {
        const key = (errorKeys as readonly string[]).includes(data.error ?? "")
          ? (data.error as (typeof errorKeys)[number])
          : null;
        setError(key ? t.account.errors[key] : t.account.errors.generic);
        return;
      }
      setUser(data.user);
    } catch {
      setError(t.account.errors.generic);
    } finally {
      setPending(false);
    }
  };

  const register = mode === "register";

  return (
    <div className="grid gap-12 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="text-muted">{t.account.intro}</p>
        <div className="mt-8 flex gap-6 border-b border-line">
          {(["signin", "register"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setError(null);
              }}
              aria-pressed={mode === key}
              className={`-mb-px border-b-2 pb-3 text-[15px] font-medium transition-colors ${
                mode === key ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {key === "signin" ? t.account.signIn : t.account.register}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6 md:col-span-7">
        {register && <Field id="account-name" name="name" label={t.account.name} autoComplete="name" maxLength={80} />}
        <Field id="account-email" name="email" type="email" label={t.account.email} autoComplete="email" required maxLength={254} />
        <Field
          id="account-password"
          name="password"
          type="password"
          label={t.account.password}
          autoComplete={register ? "new-password" : "current-password"}
          required
          minLength={register ? 8 : undefined}
          maxLength={200}
          aria-describedby={register ? "password-hint" : undefined}
        />
        {register && (
          <p id="password-hint" className="-mt-4 text-[13px] text-muted">
            {t.account.passwordHint}
          </p>
        )}
        {error && (
          <p role="alert" className="border border-accent p-4 text-[15px]">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center bg-accent px-6 font-medium text-accent-fg transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
          >
            {register ? t.account.submitRegister : t.account.submitSignIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(register ? "signin" : "register");
              setError(null);
            }}
            className="text-[14px] text-accent underline underline-offset-4"
          >
            {register ? t.account.toSignIn : t.account.toRegister}
          </button>
        </div>
      </form>
    </div>
  );
}
