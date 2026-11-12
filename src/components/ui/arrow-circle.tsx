// Flèche ↗ dans un cercle, comme les CTA du cadre (tourne légèrement au survol du parent .group)
export function ArrowCircle({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span
      aria-hidden
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-transform duration-500 ease-out-expo group-hover:rotate-45 ${
        tone === "dark" ? "border-charcoal/70 text-charcoal" : "border-current"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9 9 3M4 3h5v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
