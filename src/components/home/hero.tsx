"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { Magnetic } from "@/components/motion/magnetic";
import { ArrowCircle } from "@/components/ui/arrow-circle";

// Couleur du cadre : identique à l'en-tête, dans les deux thèmes
const FRAME = "#171717";
const EASE = [0.16, 1, 0.3, 1] as const;

// Trois vraies captures du catalogue, empilées en calques décalés
const SHOTS = [
  { src: "/screenshots/linear.webp", className: "left-[2%] top-[14%] w-[62%]", depth: 0.35, rotate: -5, delay: 0.7 },
  { src: "/screenshots/stripe.webp", className: "right-[-6%] top-[4%] w-[58%]", depth: 0.7, rotate: 4, delay: 0.85 },
  { src: "/screenshots/bruno-simon.webp", className: "left-[16%] top-[42%] w-[78%]", depth: 1.1, rotate: -1.5, delay: 1 },
];

export function Hero() {
  const { locale, dict: t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Position du curseur dans le panneau, de -0.5 à 0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stackY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const lines = [t.hero.line1, t.hero.line2];
  const explore = t.actions.explore.replace(/\s*[↗+]\s*$/, "");

  return (
    <section ref={ref} onPointerMove={onPointerMove} className="bg-charcoal px-2 pb-2 md:px-3 md:pb-3">
      <div
        className="relative isolate flex min-h-[calc(100svh-4.75rem)] flex-col overflow-hidden rounded-[22px] text-[#f6f1e7] md:rounded-[30px] lg:block"
        style={{
          background:
            "radial-gradient(55% 75% at 76% 62%, rgb(200 121 44 / 0.95) 0%, rgb(200 121 44 / 0.35) 45%, transparent 75%), linear-gradient(140deg, #6a523a 0%, #5b4632 45%, #3b2d20 100%)",
        }}
      >
        {/* Texte */}
        <div className="relative z-10 flex flex-col gap-7 px-6 pb-8 pt-10 md:px-12 md:pt-14 lg:min-h-[calc(100svh-4.75rem)] lg:max-w-[60%] lg:justify-center lg:pb-32 lg:pl-14 lg:pt-12">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="self-start rounded-full border border-[#f6f1e7]/40 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em]"
          >
            {t.hero.label}
          </motion.p>

          <h1 aria-label={lines.join(" ")} className="hero-title font-semibold uppercase">
            {lines.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: 0.15 + index * 0.12, ease: EASE }}
                >
                  {index === 1 ? <AccentLastWord text={line} /> : line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
            className="flex flex-col gap-6"
          >
            <p className="max-w-[30rem] text-[15px] leading-relaxed text-[#f6f1e7]/80 md:text-[17px]">{t.hero.body}</p>
            <span aria-hidden className="h-px w-40 bg-[#f6f1e7]/35" />
          </motion.div>

          {/* Petits écrans : CTA dans le flux (les encoches n'apparaissent qu'en grand écran) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
            className="flex flex-col gap-3 sm:flex-row lg:hidden"
          >
            <Link
              href={`/${locale}/discover`}
              className="group flex h-14 items-center justify-between gap-6 rounded-2xl bg-champagne pl-5 pr-3 font-medium text-charcoal"
            >
              {explore}
              <ArrowCircle tone="dark" />
            </Link>
            <Link
              href={`/${locale}/submit`}
              className="group flex h-14 items-center justify-between gap-6 rounded-2xl border border-[#f6f1e7]/35 pl-5 pr-3 font-medium"
            >
              {t.nav.submit}
              <ArrowCircle tone="light" />
            </Link>
          </motion.div>
        </div>

        {/* Calques : captures réelles, parallaxe au curseur et au défilement */}
        <motion.div
          aria-hidden
          style={{ y: stackY }}
          className="relative h-[300px] flex-1 sm:h-[420px] lg:absolute lg:bottom-0 lg:right-0 lg:top-0 lg:h-auto lg:w-[48%]"
        >
          {SHOTS.map((shot) => (
            <Shot key={shot.src} {...shot} sx={sx} sy={sy} />
          ))}
        </motion.div>

        {/* Encoche haut droite : proposer un site */}
        <Notch position="top-right">
          <Link href={`/${locale}/submit`} className="group flex h-12 items-center gap-3 pl-5 pr-2 text-[14px] font-medium text-[#f6f1e7]">
            {t.nav.submit}
            <ArrowCircle tone="light" />
          </Link>
        </Notch>

        {/* Encoche bas gauche : CTA principal */}
        <Notch position="bottom-left">
          <Magnetic strength={0.12}>
            <Link
              href={`/${locale}/discover`}
              className="group flex h-[72px] w-[400px] items-center justify-between rounded-[20px] bg-champagne pl-7 pr-4 text-[17px] font-medium text-charcoal transition-colors duration-300 hover:bg-[#f9e6bd]"
            >
              {explore}
              <ArrowCircle tone="dark" />
            </Link>
          </Magnetic>
        </Notch>

        {/* Encoche bas droite : invitation à défiler (pas de faux carrousel) */}
        <Notch position="bottom-right">
          <span className="flex h-10 items-center gap-3 px-5 text-[12px] font-medium tracking-[0.12em] text-[#f6f1e7]/70 uppercase">
            {t.hero.scroll}
            <span aria-hidden className="relative block h-5 w-px overflow-hidden bg-[#f6f1e7]/20">
              <motion.span
                className="absolute inset-x-0 top-0 h-2 bg-champagne"
                animate={reduce ? undefined : { y: [-8, 20] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </span>
        </Notch>
      </div>
    </section>
  );
}

function Shot({
  src,
  className,
  depth,
  rotate,
  delay,
  sx,
  sy,
}: {
  src: string;
  className: string;
  depth: number;
  rotate: number;
  delay: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}) {
  const x = useTransform(sx, (v) => v * depth * 70);
  const y = useTransform(sy, (v) => v * depth * 50);
  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 80, rotate: rotate * 2 }}
        animate={{ opacity: 1, y: 0, rotate }}
        transition={{ duration: 1.2, delay, ease: EASE }}
        className="overflow-hidden rounded-xl border border-[#f6f1e7]/20 bg-charcoal shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] md:rounded-2xl"
      >
        <Image src={src} alt="" width={1200} height={750} sizes="(min-width: 1024px) 34vw, 80vw" priority className="h-auto w-full" />
      </motion.div>
    </motion.div>
  );
}

// Coin concave : un quart de disque transparent dans un carré couleur cadre
function Corner({ className, at }: { className: string; at: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-6 w-6 ${className}`}
      style={{ background: `radial-gradient(circle at ${at}, transparent 23.5px, ${FRAME} 24px)` }}
    />
  );
}

// Encoche taillée dans le panneau : bloc couleur cadre + deux coins concaves pour raccorder les bords
function Notch({ position, children }: { position: "top-right" | "bottom-left" | "bottom-right"; children: ReactNode }) {
  const layout = {
    "top-right": {
      box: "right-0 top-0 rounded-bl-[24px] pb-2.5 pl-2.5",
      corners: [
        { className: "-left-6 top-0", at: "0 100%" },
        { className: "-bottom-6 right-0", at: "0 100%" },
      ],
    },
    "bottom-left": {
      box: "bottom-0 left-0 rounded-tr-[28px] pr-3 pt-3",
      corners: [
        { className: "-top-6 left-0", at: "100% 0" },
        { className: "-right-6 bottom-0", at: "100% 0" },
      ],
    },
    "bottom-right": {
      box: "bottom-0 right-0 rounded-tl-[24px] pl-2.5 pt-2.5",
      corners: [
        { className: "-top-6 right-0", at: "0 0" },
        { className: "-left-6 bottom-0", at: "0 0" },
      ],
    },
  }[position];

  return (
    <div className={`absolute z-20 hidden bg-charcoal lg:block ${layout.box}`}>
      {layout.corners.map((corner) => (
        <Corner key={corner.className} {...corner} />
      ))}
      {children}
    </div>
  );
}

// Met le dernier mot en champagne ("RANDOM." / "HASARD.")
function AccentLastWord({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <>
      {words.length ? `${words.join(" ")} ` : null}
      <span className="text-champagne">{last}</span>
    </>
  );
}
