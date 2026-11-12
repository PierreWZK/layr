// Capture d'écran des sites du seed avec Playwright (Chromium headless).
// Usage : node scripts/capture.mjs [--force] [slug ...]
// Sortie : public/screenshots/<slug>.webp (1200x750) et rapport des échecs.
import { readFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((a) => !a.startsWith('--')));

const sites = JSON.parse(await readFile(path.join('db', 'seed', 'websites.json'), 'utf8'));
const outDir = path.join('public', 'screenshots');
await mkdir(outDir, { recursive: true });

// Masque les bannières cookies sans les accepter (aucun consentement donné)
const HIDE_BANNERS = `
  [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
  [id*="onetrust" i], [class*="onetrust" i], [id*="didomi" i], [class*="cc-window" i],
  [aria-label*="cookie" i], .fc-consent-root, [class*="fc-dialog"] { display: none !important; }
`;

const exists = (p) => access(p).then(() => true, () => false);

// Chromium complet + WebGL logiciel : les sites 3D refusent le shell headless sans GPU
const browser = await chromium.launch({
  channel: 'chromium',
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
});
const WAIT = Number(process.env.CAPTURE_WAIT ?? 3500);
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'en-US',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
});

const queue = sites.filter((s) => only.size === 0 || only.has(s.slug));
const failures = [];
let done = 0;

// Repli : image Open Graph publiée par le site lui-même (sites WebGL ou anti-robots)
async function ogImageOne(site, file) {
  const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36', accept: 'text/html' };
  const html = await (await fetch(site.url, { headers, redirect: 'follow' })).text();
  const match =
    html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::url)?["']/i) ??
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (!match) throw new Error('pas d\'image og:image');
  const imageUrl = new URL(match[1].replace(/&amp;/g, '&'), site.url).href;
  const response = await fetch(imageUrl, { headers: { 'user-agent': headers['user-agent'] } });
  if (!response.ok) throw new Error(`og:image HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer).resize(1200, 750, { fit: 'cover', position: 'centre' }).webp({ quality: 78 }).toFile(file);
}

const useOg = args.includes('--og');
const stripOverlays = args.includes('--strip-overlays');

async function captureOne(site) {
  const file = path.join(outDir, `${site.slug}.webp`);
  if (!force && (await exists(file))) return;
  if (useOg) {
    try {
      await ogImageOne(site, file);
      done += 1;
      console.log(`og  ${site.slug}`);
    } catch (error) {
      failures.push({ slug: site.slug, error: String(error.message ?? error).split('\n')[0] });
      console.log(`ERR ${site.slug} ${String(error.message ?? error).split('\n')[0]}`);
    }
    return;
  }
  const page = await context.newPage();
  try {
    const response = await page.goto(site.url, { waitUntil: 'load', timeout: 45000 });
    if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
    await page.addStyleTag({ content: HIDE_BANNERS }).catch(() => {});
    await page.waitForTimeout(WAIT);
    await page.addStyleTag({ content: HIDE_BANNERS }).catch(() => {});
    if (stripOverlays) {
      // Retire les calques fixes qui couvrent l'écran (modales de consentement) sans cliquer dessus
      await page.evaluate(() => {
        const area = innerWidth * innerHeight;
        for (const el of document.querySelectorAll('body *')) {
          const style = getComputedStyle(el);
          if (style.position !== 'fixed') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width * rect.height > area * 0.2 && Number(style.zIndex) >= 100) el.remove();
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      });
    }
    const raw = await page.screenshot({ type: 'png' });
    await sharp(raw).resize(1200, 750).webp({ quality: 74 }).toFile(file);
    done += 1;
    console.log(`ok  ${site.slug}`);
  } catch (error) {
    failures.push({ slug: site.slug, error: String(error.message ?? error).split('\n')[0] });
    console.log(`ERR ${site.slug} ${String(error.message ?? error).split('\n')[0]}`);
  } finally {
    await page.close();
  }
}

const CONCURRENCY = 4;
for (let i = 0; i < queue.length; i += CONCURRENCY) {
  await Promise.all(queue.slice(i, i + CONCURRENCY).map(captureOne));
}

await browser.close();
console.log(`\n${done} capturés, ${failures.length} échecs`);
if (failures.length) console.log(JSON.stringify(failures, null, 2));
