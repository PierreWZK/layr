"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { useI18n } from "@/components/i18n/locale-provider";

export function Hero() {
  const { locale, dict: t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Position du curseur dans la section, de -0.5 à 0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stackY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const headlineLines = [t.hero.line1, t.hero.line2];

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative isolate overflow-hidden border-b border-line"
    >
      <GridField sx={sx} sy={sy} />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1440px] grid-rows-[auto_1fr] px-4 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14 lg:grid-cols-12 lg:grid-rows-1 lg:gap-0">
        <div className="flex flex-col justify-between gap-12 lg:col-span-7 lg:py-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="t-label flex items-center gap-3 text-muted"
          >
            <span aria-hidden className="h-2 w-2 bg-accent" />
            {t.hero.label}
          </motion.p>

          <h1 aria-label={headlineLines.join(" ")} className="t-display mt-auto">
            {headlineLines.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: 0.15 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {index === 1 ? <AccentLastWord text={line} /> : line}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="grid gap-8 md:grid-cols-[minmax(0,26rem)_auto] md:items-end md:justify-between">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="t-lead text-muted"
            >
              {t.hero.body}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <ButtonLink href={`/${locale}/discover`} size="lg">
                  {t.actions.explore}
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href={`/${locale}/submit`} variant="secondary" size="lg">
                  {t.actions.submit}
                </ButtonLink>
              </Magnetic>
            </motion.div>
          </div>
        </div>

        <motion.div
          style={{ y: stackY }}
          className="relative mt-4 h-[360px] sm:h-[460px] lg:col-span-5 lg:mt-0 lg:h-auto lg:min-h-[560px]"
        >
          <LayerSheet index={1} depth={0.35} sx={sx} sy={sy} label={`${t.hero.layer} 01`} className="left-[6%] top-[4%] w-[62%] h-[52%]" delay={0.9} />
          <LayerSheet index={2} depth={0.7} sx={sx} sy={sy} label={`${t.hero.layer} 02`} className="right-[4%] top-[20%] w-[58%] h-[56%]" delay={1.05} accent />
          <LayerSheet index={3} depth={1.1} sx={sx} sy={sy} label={`${t.hero.layer} 03`} className="left-[18%] bottom-[2%] w-[70%] h-[44%]" delay={1.2} />
        </motion.div>
      </div>
    </section>
  );
}

// Trame de calque : lignes fines qui glissent légèrement avec le curseur
function GridField({
  sx,
  sy,
}: {
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
}) {
  const x = useTransform(sx, (v) => v * -24);
  const y = useTransform(sy, (v) => v * -24);
  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none absolute -inset-12 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_60%_40%,black_30%,transparent_72%)]"
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />
    </motion.div>
  );
}

// Feuille de calque : cadre technique avec repères, pas une capture (les captures arrivent à l'étape 2)
function LayerSheet({
  index,
  depth,
  sx,
  sy,
  label,
  className,
  delay,
  accent,
}: {
  index: number;
  depth: number;
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  label: string;
  className: string;
  delay: number;
  accent?: boolean;
}) {
  const x = useTransform(sx, (v) => v * depth * 90);
  const y = useTransform(sy, (v) => v * depth * 70);

  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: index % 2 ? 1.5 : -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full w-full border border-line-strong bg-surface shadow-[0_40px_80px_-40px_rgb(23_23_23/0.45)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="t-label text-muted">{label}</span>
          <span aria-hidden className={`h-2 w-2 ${accent ? "bg-accent" : "bg-highlight"}`} />
        </div>
        <svg aria-hidden className="absolute inset-0 top-[41px] h-[calc(100%-41px)] w-full text-line" preserveAspectRatio="none">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeDasharray="3 5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeDasharray="3 5" />
          <line x1="12%" y1="0" x2="12%" y2="100%" stroke="currentColor" />
          <line x1="88%" y1="0" x2="88%" y2="100%" stroke="currentColor" />
        </svg>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="t-label text-muted">LayR / {String(index).padStart(2, "0")}</span>
          <span className="font-serif text-2xl italic leading-none text-accent">{index}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Met le dernier mot en accent ("RANDOM." / "HASARD.")
function AccentLastWord({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <>
      {words.length ? `${words.join(" ")} ` : null}
      <span className="text-accent">{last}</span>
    </>
  );
}
