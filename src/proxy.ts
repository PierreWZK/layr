import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from '@/i18n/config';

// Pays utilisés seulement en repli, quand la langue du navigateur n'est ni FR ni EN.
const FRENCH_COUNTRIES = new Set(['FR', 'BE', 'CH', 'LU', 'MC']);

// Premier tag supporté dans Accept-Language (ordre de préférence du navigateur).
function fromBrowserLanguage(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(',')) {
    const primary = part.split(';')[0]?.trim().toLowerCase().split('-')[0];
    if (isLocale(primary)) return primary;
  }
  return null;
}

function detectLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const byLanguage = fromBrowserLanguage(request.headers.get('accept-language'));
  if (byLanguage) return byLanguage;

  const country = (
    request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry') ?? ''
  ).toUpperCase();
  return FRENCH_COUNTRIES.has(country) ? 'fr' : defaultLocale;
}

// Redirige toute URL sans préfixe de langue vers /fr/... ou /en/...
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split('/')[1])) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(url, 307);
  response.headers.set('Vary', 'Accept-Language, Cookie');
  return response;
}

export const config = {
  matcher: ['/((?!_next/|api/|go/|icon\\.svg|.*\\..*).*)'],
};
