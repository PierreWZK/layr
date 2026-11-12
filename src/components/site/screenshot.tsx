import Image from "next/image";

// Capture du site, ou cadre neutre avec le domaine si aucune capture n'existe
export function Screenshot({
  src,
  alt,
  domain,
  emptyLabel,
  sizes,
  priority,
  className,
}: {
  src: string | null;
  alt: string;
  domain: string;
  emptyLabel: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-surface-2 ${className ?? ""}`}>
        <span className="font-mono text-sm text-fg">{domain}</span>
        <span className="t-label text-muted">{emptyLabel}</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={750}
      sizes={sizes}
      priority={priority}
      className={`aspect-[16/10] w-full object-cover object-top ${className ?? ""}`}
    />
  );
}
