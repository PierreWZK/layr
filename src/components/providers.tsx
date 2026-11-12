"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { LocaleProvider } from "./i18n/locale-provider";
import { ThemeProvider } from "./theme/theme-provider";

export function Providers({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <LocaleProvider locale={locale} dict={dict}>
        <ThemeProvider>{children}</ThemeProvider>
      </LocaleProvider>
    </MotionConfig>
  );
}
