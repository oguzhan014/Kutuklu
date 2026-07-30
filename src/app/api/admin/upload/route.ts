import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin, AuthError } from "@/lib/auth-guards";
import { limitByIp } from "@/lib/rate-limit";

/**
 * Ürün görseli yükleme.
 *
 * Güvenlik kontrolleri:
 *  - Yalnızca ADMIN yükleyebilir (rol veritabanından doğrulanır).
 *  - Dosya boyutu sınırlı (5 MB).
 *  - Dosya türü hem MIME hem de DOSYA İMZASINDAN (magic bytes) doğrulanır;
 *    uzantı veya istemcinin bildirdiği MIME tek başına güvenilmez.
 *  - Dosya adı sunucuda rastgele üretilir. Kullanıcının verdiği ad asla
 *    kullanılmaz → yol geçişi (../../) ve ".php"/".html" gibi çalıştırılabilir
 *    uzantı yükleme riski ortadan kalkar.
 *  - Dosyalar `public/uploads` altına, statik içerik olarak yazılır.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: { mime: string; ext: string; matches: (bytes: Uint8Array) => boolean }[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    matches: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    ext: "webp",
    matches: (b) =>
      // "RIFF" .... "WEBP"
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
  {
    mime: "image/gif",
    ext: "gif",
    matches: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46,
  },
];

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ ok: false, error: error.message }, { status: 403 });
    }
    return Response.json({ ok: false, error: "Yetkilendirme hatası" }, { status: 500 });
  }

  const limit = await limitByIp("upload", 40, 60_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Çok fazla yükleme isteği. Lütfen bekleyin." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "Dosya bulunamadı." }, { status: 400 });
  }

  if (file.size === 0) {
    return Response.json({ ok: false, error: "Dosya boş." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { ok: false, error: "Dosya boyutu en fazla 5 MB olabilir." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Türü dosyanın kendi imzasından belirle — istemcinin beyanına güvenme.
  const detected = ALLOWED.find((candidate) => candidate.matches(buffer));

  if (!detected) {
    return Response.json(
      { ok: false, error: "Yalnızca JPG, PNG, WEBP veya GIF görseller yüklenebilir." },
      { status: 400 }
    );
  }

  // Dosya adı tamamen sunucuda üretilir.
  const fileName = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${detected.ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch (error) {
    console.error("[upload] dosya yazılamadı:", error);
    return Response.json({ ok: false, error: "Dosya kaydedilemedi." }, { status: 500 });
  }

  return Response.json({
    ok: true,
    url: `/uploads/${fileName}`,
    mime: detected.mime,
  });
}
