"use client";

import { motion } from "framer-motion";
import type { CategoryItem } from "@/lib/taxonomy";

// Index éditorial : liste numérotée, pas de cartes
export function CategoryIndex({ items }: { items: CategoryItem[] }) {
  return (
    <ol className="border-t border-line">
      {items.map((item, index) => (
        <motion.li
          key={item.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: Math.min(index, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-b border-line py-5 transition-colors duration-300 hover:bg-surface md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.2fr)] md:gap-8 md:px-4"
        >
          <span className="t-label text-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="text-xl font-semibold tracking-[-0.03em] transition-colors duration-300 group-hover:text-accent md:text-2xl">
            {item.name}
          </h3>
          <p className="col-span-2 text-[15px] leading-relaxed text-muted md:col-span-1">{item.description}</p>
        </motion.li>
      ))}
    </ol>
  );
}
