import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Captures créées après le build (admin) : hors de public/, servies par /media/[file].
// En production, monter un volume sur MEDIA_DIR pour les garder entre deux déploiements.
export const MEDIA_DIR = process.env.MEDIA_DIR ?? path.join(process.cwd(), "data", "media");
export const MEDIA_FILE = /^[a-z0-9-]{1,100}\.webp$/;

export async function saveScreenshot(image: Buffer, baseName: string): Promise<string> {
  const safe = baseName.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "site";
  const file = `${safe}-${Date.now().toString(36)}.webp`;
  const webp = await sharp(image).resize(1200, 750, { fit: "cover", position: "top" }).webp({ quality: 76 }).toBuffer();
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, file), webp);
  return `/media/${file}`;
}

export async function readMedia(file: string): Promise<Buffer | null> {
  if (!MEDIA_FILE.test(file)) return null;
  try {
    return await readFile(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, file));
  } catch {
    return null;
  }
}
