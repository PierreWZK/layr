"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/i18n/locale-provider";
import type { CategoryInfo } from "@/lib/websites";

// Index éditorial : liste numérotée, chaque ligne ouvre Découvrir filtré
export function CategoryIndex({ items }: { items: CategoryInfo[] }) {
  const { locale } = useI18n();
  return (
    <ol className="border-t border-line">
      {items.map((item, index) => (
        <motion.li
          key={item.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: Math.min(index, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-line"
        >
          <Link
            href={`/${locale}/discover?cat=${item.slug}`}
            className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5 transition-colors duration-300 hover:bg-surface md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.2fr)_3rem] md:gap-8 md:px-4"
          >
            <span className="t-label text-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="text-xl font-semibold tracking-[-0.03em] transition-colors duration-300 group-hover:text-accent md:text-2xl">
              {item.name}
            </h3>
            <span className="font-mono text-[12px] tabular-nums text-muted md:order-last md:text-right">{item.count}</span>
            <p className="col-span-3 text-[15px] leading-relaxed text-muted md:col-span-1">{item.description}</p>
          </Link>
        </motion.li>
      ))}
    </ol>
  );
}
