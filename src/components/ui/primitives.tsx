import type { ComponentProps, ReactNode } from "react";

// Badge éditorial : bordure fine, capitales, pastille de couleur optionnelle
export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`t-label inline-flex items-center gap-2 border border-line px-2.5 py-1.5 text-fg ${className ?? ""}`}
    >
      {color && (
        <span aria-hidden className="h-1.5 w-1.5" style={{ backgroundColor: color }} />
      )}
      {children}
    </span>
  );
}

// Surface : bloc neutre, bordure fine, sans arrondi
export function Surface({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={`border border-line bg-surface ${className ?? ""}`} />;
}

// Champ : ligne de base, style éditorial
export function Field({
  label,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="t-label text-muted">{label}</span>
      <input
        id={id}
        {...props}
        className="h-12 border-b border-line-strong bg-transparent text-base text-fg placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none"
      />
    </label>
  );
}
