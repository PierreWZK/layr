"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { LocaleProvider } from "./i18n/locale-provider";
import { ThemeProvider } from "./theme/theme-provider";
import { ToastProvider } from "./ui/toast";

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
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </MotionConfig>
  );
}
