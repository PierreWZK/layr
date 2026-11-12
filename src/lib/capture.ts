import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Capture d'un site pour l'admin : Chromium headless, sans accepter de bannière cookies.
export type PageCapture = {
  url: string;
  domain: string;
  image: Buffer | null;
  title: string;
  description: string;
  lang: string;
  text: string;
  error: string | null;
};

const HIDE_BANNERS = `
  [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
  [id*="onetrust" i], [class*="onetrust" i], [id*="didomi" i], [class*="cc-window" i],
  [aria-label*="cookie" i], .fc-consent-root, [class*="fc-dialog"] { display: none !important; }
`;

function isPrivateAddress(address: string): boolean {
  if (address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80")) return true;
  const v4 = address.replace(/^::ffff:/, "");
  if (isIP(v4) !== 4) return false;
  const [a, b] = v4.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

// Refuse ce qui n'est pas un site public (protection SSRF : pas d'adresse locale ni privée)
export async function normalizePublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim().match(/^https?:\/\//i) ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    throw new Error("invalid_url");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("invalid_url");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("private_url");
  }
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (addresses.length === 0) throw new Error("unreachable");
  if (addresses.some(isPrivateAddress)) throw new Error("private_url");
  url.hash = "";
  return url;
}

export async function captureSite(url: URL): Promise<PageCapture> {
  const domain = url.hostname.replace(/^www\./, "");
  const empty: PageCapture = { url: url.href, domain, image: null, title: "", description: "", lang: "", text: "", error: null };
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "en-US",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
    });
    const page = await context.newPage();
    const response = await page.goto(url.href, { waitUntil: "load", timeout: 40000 });
    if (response && response.status() >= 400) return { ...empty, error: `http_${response.status()}` };
    await page.addStyleTag({ content: HIDE_BANNERS }).catch(() => {});
    await page.waitForTimeout(Number(process.env.CAPTURE_WAIT ?? 3000));
    await page.addStyleTag({ content: HIDE_BANNERS }).catch(() => {});
    const meta = await page.evaluate(() => {
      const pick = (selector: string) => document.querySelector<HTMLMetaElement>(selector)?.content ?? "";
      return {
        title: document.title || pick('meta[property="og:title"]'),
        description: pick('meta[name="description"]') || pick('meta[property="og:description"]'),
        lang: document.documentElement.lang || "",
        text: (document.body?.innerText ?? "").replace(/\s+/g, " ").slice(0, 4000),
      };
    });
    const image = await page.screenshot({ type: "png" });
    return { ...empty, ...meta, url: page.url(), image };
  } catch (error) {
    return { ...empty, error: String((error as Error).message ?? error).split("\n")[0].slice(0, 200) };
  } finally {
    await browser.close();
  }
}
