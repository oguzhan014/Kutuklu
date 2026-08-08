import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const session = await auth();

    // Faturayı bul
    const invoice = await prisma.invoice.findFirst({
      where: {
        order: { orderNumber },
      },
      include: {
        order: {
          select: { userId: true, guestEmail: true },
        },
      },
    });

    if (!invoice) {
      return new Response(JSON.stringify({ ok: false, error: "Fatura bulunamadı." }), {
        status: 404,
      });
    }

    // Yetkilendirme kontrolü:
    // - Session sahibi mi (userId) veya misafir (accessToken'ın kontrolü)
    if (session?.user?.id !== invoice.order.userId) {
      return new Response(JSON.stringify({ ok: false, error: "Bu faturaya erişim yetkiniz yok." }), {
        status: 403,
      });
    }

    // Dosyayı oku
    const filePath = path.join(process.cwd(), invoice.filePath);
    const fileBuffer = await readFile(filePath);

    // PDF olarak dön
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fatura-${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[invoice-download] error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Fatura indirilemedi." }), {
      status: 500,
    });
  }
}
