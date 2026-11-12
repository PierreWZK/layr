// Marque : trois calques décalés (carré mocha, contour ambre, carré champagne)
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect x="4" y="4" width="16" height="16" fill="#5B4632" />
      <rect x="9" y="9" width="16" height="16" fill="none" stroke="#C8792C" strokeWidth="2" />
      <rect x="14" y="14" width="14" height="14" fill="#F4D9A0" />
    </svg>
  );
}
