import type { Locale } from "@/i18n/config";

// Note éditoriale sur 10, toujours au même format (9,2/10 en FR, 9.2/10 en EN)
export function Rating({
  value,
  locale,
  size = "sm",
}: {
  value: number | null;
  locale: Locale;
  size?: "sm" | "lg";
}) {
  if (value === null) return null;
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap tabular-nums ${size === "lg" ? "font-sans" : "font-mono"}`}>
      <span className={size === "lg" ? "text-6xl font-semibold tracking-[-0.05em] md:text-7xl" : "text-[15px] font-medium"}>
        {formatted}
      </span>
      <span className={`text-muted ${size === "lg" ? "ml-1 text-xl" : "text-[12px]"}`}>/10</span>
    </span>
  );
}
