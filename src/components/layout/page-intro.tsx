import type { ReactNode } from "react";

// En-tête éditorial commun aux pages de liste
export function PageIntro({
  label,
  title,
  intro,
  aside,
}: {
  label: string;
  title: string;
  intro?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="grid gap-6 border-b border-line py-14 md:grid-cols-12 md:items-end md:py-20">
      <div className="md:col-span-8">
        <p className="t-label mb-5 flex items-center gap-3 text-muted">
          <span aria-hidden className="h-2 w-2 bg-accent" />
          {label}
        </p>
        <h1 className="t-h1">{title}</h1>
      </div>
      <div className="md:col-span-4">
        {intro && <p className="t-lead text-muted">{intro}</p>}
        {aside}
      </div>
    </header>
  );
}
