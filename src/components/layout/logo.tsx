// Marque LayR : trois calques décalés (champagne, ambre, moka à liseré champagne).
// Couleurs fixes, lisibles sur fond clair comme sombre.
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect x="2" y="2" width="16" height="16" rx="3.5" fill="#F4D9A0" />
      <rect x="7" y="7" width="16" height="16" rx="3.5" fill="#C8792C" />
      <rect x="12" y="12" width="17" height="17" rx="3.5" fill="#5B4632" stroke="#F4D9A0" strokeWidth="1.5" />
      <rect x="17" y="17" width="7" height="7" rx="1.5" fill="#171717" />
    </svg>
  );
}

// Logotype complet : marque + mot « LayR »
export function Wordmark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-[18px] font-semibold leading-none tracking-[-0.04em]">LayR</span>
    </span>
  );
}
