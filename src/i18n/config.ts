export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Choix manuel de la langue (posé par le sélecteur FR/EN). Prioritaire sur la détection.
export const LOCALE_COOKIE = 'layr-locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
