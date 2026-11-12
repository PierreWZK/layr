import { readMedia } from "@/lib/media";

// Captures créées par l'admin (stockées hors de public/)
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const data = await readMedia(file);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000, immutable" },
  });
}
