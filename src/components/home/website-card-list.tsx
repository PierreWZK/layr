"use client";

import { motion } from "framer-motion";
import { WebsiteCard } from "@/components/site/website-card";
import type { Website } from "@/lib/websites";

// Grille de 3 sur bureau, carrousel horizontal sur mobile, apparition décalée
export function WebsiteCardList({ sites }: { sites: Website[] }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
      {sites.map((site, index) => (
        <motion.div
          key={site.slug}
          className="w-[82%] shrink-0 snap-start md:w-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <WebsiteCard site={site} />
        </motion.div>
      ))}
    </div>
  );
}
