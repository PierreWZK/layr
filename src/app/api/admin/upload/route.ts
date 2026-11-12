import { adminUser } from "@/lib/admin";
import { saveScreenshot } from "@/lib/media";
import { error, json } from "@/lib/api";

const MAX_BYTES = 8 * 1024 * 1024;

// Envoi manuel d'une capture : convertie en WebP 1200×750 par sharp
export async function POST(request: Request) {
  if (!(await adminUser())) return error("forbidden", 403);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("invalid_body", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return error("invalid_file", 400);
  if (file.size > MAX_BYTES) return error("file_too_large", 413);
  try {
    const url = await saveScreenshot(Buffer.from(await file.arrayBuffer()), String(form.get("name") ?? "upload"));
    return json({ url }, 201);
  } catch (err) {
    console.error("upload", err);
    return error("invalid_file", 400);
  }
}
