"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useI18n } from "@/components/i18n/locale-provider";
import { useToast } from "@/components/ui/toast";
import { fmt } from "@/i18n/format";
import { toggleFavorite, useFavorites } from "@/lib/favorites-store";

export function FavoriteButton({
  slug,
  title,
  variant = "overlay",
}: {
  slug: string;
  title: string;
  variant?: "overlay" | "inline";
}) {
  const { locale, dict: t } = useI18n();
  const favorites = useFavorites();
  const toast = useToast();
  const controls = useAnimationControls();
  const saved = favorites.some((entry) => entry.slug === slug);

  const onClick = () => {
    const added = toggleFavorite(slug);
    controls.start({ scale: [1, 1.35, 0.92, 1], transition: { duration: 0.45, ease: "easeOut" } });
    toast({
      message: added ? t.card.saved : t.card.removed,
      action: added ? { label: t.actions.viewFavorites, href: `/${locale}/favorites` } : undefined,
    });
  };

  const label = fmt(saved ? t.card.unsave : t.card.save, { title });

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={
        variant === "overlay"
          ? `grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300 ${
              saved
                ? "border-accent bg-accent text-accent-fg"
                : "border-line-strong bg-bg/90 text-fg hover:border-accent hover:text-accent"
            }`
          : `inline-flex h-12 items-center gap-2 border px-5 text-[15px] font-medium transition-colors duration-300 ${
              saved ? "border-accent bg-accent text-accent-fg" : "border-line-strong text-fg hover:border-accent"
            }`
      }
    >
      <motion.svg animate={controls} width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.7 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.2 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </motion.svg>
      {variant === "inline" && <span>{saved ? t.site.saved : t.site.save}</span>}
    </button>
  );
}
