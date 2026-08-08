import "server-only";
import { existsSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import type { Order, OrderItem } from "@/generated/prisma/client";

/**
 * ─────────────────────────────────────────────────────────────
 * FATURA ÜRETİMİ
 * ─────────────────────────────────────────────────────────────
 *
 * Ödeme onaylandığında (PayTR bildirimi) çağrılır. PDF, herkese açık
 * `public/` altına DEĞİL, sunucudaki `private/invoices/` klasörüne yazılır;
 * indirme yalnızca kimliği doğrulanmış sahibine `/api/invoices/.../download`
 * üzerinden açılır.
 *
 * TUTARLAR: Veritabanında para birimi TL cinsinden `Decimal(10,2)` olarak
 * saklanır (ör. 149.90). Kuruşa çevirme/bölme YAPILMAZ — değerler doğrudan
 * biçimlendirilir.
 */

interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Fatura fontu.
 *
 * PDFKit'in yerleşik fontları (Helvetica vb.) WinAnsi kodlaması kullanır ve
 * Türkçeye özgü `ğ Ğ ı İ ş Ş` harflerini İÇERMEZ — bu harfler faturada bozuk
 * çıkar. Gömülü TrueType font ile Unicode eşlemesi doğru yapılır.
 *
 * Geist'in kalın kesimi projede yok; vurgu punto ve renkle sağlanır.
 *
 * Font bulunamazsa fatura üretimi durdurulmaz: standart fonta düşülür ve
 * uyarı loglanır (bozuk Türkçe, hiç fatura olmamasından iyidir).
 */
const FONT_PATH = path.join(process.cwd(), "assets", "fonts", "Geist-Regular.ttf");

let fontWarningLogged = false;

function resolveFont(): string {
  if (existsSync(FONT_PATH)) return FONT_PATH;

  if (!fontWarningLogged) {
    fontWarningLogged = true;
    console.error(
      `[invoice] Fatura fontu bulunamadı (${FONT_PATH}). Standart fonta düşülüyor — Türkçe karakterler bozuk görünecek.`
    );
  }

  return "Helvetica";
}

const trNumber = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Tutarı fatura biçiminde yazar: "149,90 TL".
 * ₺ sembolü bilinçli kullanılmaz — gömülü fontta bu glif yoktur.
 */
function tl(amount: unknown): string {
  return `${trNumber.format(Number(amount))} TL`;
}

/** Yıl bazlı sıralı fatura numarası: 2026-001, 2026-002, … */
async function getNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: `${year}-` } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  let next = 1;
  if (lastInvoice) {
    const match = lastInvoice.invoiceNumber.match(/-(\d+)$/);
    if (match) next = Number.parseInt(match[1]!, 10) + 1;
  }

  return `${year}-${String(next).padStart(3, "0")}`;
}

/** PDF'i bellekte üretir. */
function renderPdf(order: OrderWithItems, invoiceNumber: string): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const font = resolveFont();
  const buffers: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => buffers.push(chunk));

  const promise = new Promise<Buffer>((resolve, reject) => {
    // PDFDocument bir Readable stream'dir: yazma bittiğinde "end" tetiklenir.
    // ("finish" yazılabilir stream olayıdır ve burada HİÇ tetiklenmez —
    //  kullanılırsa fatura sözü sonsuza kadar askıda kalır.)
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });

  doc.font(font).fillColor("#000000");

  // ── Başlık ───────────────────────────────────────────────
  doc.fontSize(24).text("FATURA", 50, 50);
  doc.fontSize(10).fillColor("#444444");
  doc.text(`Fatura No: ${invoiceNumber}`, 50, 85);
  doc.text(`Tarih: ${new Date(order.createdAt).toLocaleDateString("tr-TR")}`, 50, 100);
  doc.text(`Sipariş No: ${order.orderNumber}`, 50, 115);

  // ── Satıcı ───────────────────────────────────────────────
  doc.fontSize(13).fillColor("#000000").text("Kütüklü Zeytinyağı", 50, 145);
  doc.fontSize(10).fillColor("#444444");
  doc.text("Zeytinyağı Ürünleri", 50, 165);
  doc.text("E-posta: siparis@kutuklu.com", 50, 180);

  // ── Adresler ─────────────────────────────────────────────
  const addressTop = 215;

  doc.fontSize(11).fillColor("#000000").text("Fatura Adresi", 50, addressTop);
  doc.fontSize(10).fillColor("#444444");

  const billingLines = [
    order.billingCompany,
    order.billingFullName || order.shippingName,
    order.billingAddress || order.shippingAddress,
    [
      order.billingCity || order.shippingCity,
      order.billingDistrict || order.shippingDistrict,
      order.billingPostalCode || order.shippingPostalCode,
    ]
      .filter(Boolean)
      .join(", "),
    order.billingTaxId ? `Vergi No: ${order.billingTaxId}` : null,
  ].filter((line): line is string => Boolean(line));

  doc.text(billingLines.join("\n"), 50, addressTop + 20, { width: 220 });

  doc.fontSize(11).fillColor("#000000").text("Teslimat Adresi", 310, addressTop);
  doc.fontSize(10).fillColor("#444444");

  const shippingLines = [
    order.shippingName,
    order.shippingAddress,
    [order.shippingCity, order.shippingDistrict, order.shippingPostalCode]
      .filter(Boolean)
      .join(", "),
    order.shippingPhone,
  ].filter((line): line is string => Boolean(line));

  doc.text(shippingLines.join("\n"), 310, addressTop + 20, { width: 220 });

  // ── Ürün tablosu ─────────────────────────────────────────
  const col = { name: 50, qty: 300, unit: 370, total: 470 };
  const colWidth = { name: 240, qty: 50, unit: 90, total: 80 };
  let y = 340;

  doc.fontSize(10).fillColor("#000000");
  doc.text("Ürün", col.name, y, { width: colWidth.name });
  doc.text("Adet", col.qty, y, { width: colWidth.qty, align: "right" });
  doc.text("Birim Fiyat", col.unit, y, { width: colWidth.unit, align: "right" });
  doc.text("Toplam", col.total, y, { width: colWidth.total, align: "right" });

  y += 18;
  doc.moveTo(50, y).lineTo(550, y).strokeColor("#cccccc").stroke();
  y += 10;

  doc.fontSize(9).fillColor("#444444");

  for (const item of order.items) {
    const name = item.variantLabel
      ? `${item.productName} (${item.variantLabel})`
      : item.productName;

    const nameHeight = doc.heightOfString(name, { width: colWidth.name });

    doc.text(name, col.name, y, { width: colWidth.name });
    doc.text(String(item.quantity), col.qty, y, { width: colWidth.qty, align: "right" });
    doc.text(tl(item.unitPrice), col.unit, y, { width: colWidth.unit, align: "right" });
    doc.text(tl(item.totalPrice), col.total, y, { width: colWidth.total, align: "right" });

    // Uzun ürün adları satır kaydırınca bir sonraki satırın üstüne binmesin.
    y += Math.max(nameHeight, 12) + 8;
  }

  y += 4;
  doc.moveTo(50, y).lineTo(550, y).strokeColor("#cccccc").stroke();
  y += 14;

  // ── Özet ─────────────────────────────────────────────────
  const labelX = 330;

  doc.fontSize(10).fillColor("#444444");
  doc.text("Ara Toplam", labelX, y, { width: 120 });
  doc.text(tl(order.subtotal), col.total, y, { width: colWidth.total, align: "right" });
  y += 18;

  if (Number(order.discountAmount) > 0) {
    const label = order.couponCode ? `İndirim (${order.couponCode})` : "İndirim";
    doc.text(label, labelX, y, { width: 120 });
    doc.text(`-${tl(order.discountAmount)}`, col.total, y, {
      width: colWidth.total,
      align: "right",
    });
    y += 18;
  }

  doc.text("Kargo", labelX, y, { width: 120 });
  doc.text(
    Number(order.shippingCost) === 0 ? "Ücretsiz" : tl(order.shippingCost),
    col.total,
    y,
    { width: colWidth.total, align: "right" }
  );
  y += 24;

  doc.fontSize(13).fillColor("#000000");
  doc.text("GENEL TOPLAM", labelX, y, { width: 120 });
  doc.text(tl(order.total), col.total, y, { width: colWidth.total, align: "right" });

  // ── Dipnot ───────────────────────────────────────────────
  doc.fontSize(8).fillColor("#999999");
  doc.text(
    "Bu belge ödeme kaydıdır. Sorularınız için siparis@kutuklu.com adresinden bize ulaşabilirsiniz.",
    50,
    760,
    { width: 500, align: "center" }
  );

  doc.end();

  return promise;
}

export type EnsuredInvoice = {
  invoiceNumber: string;
  /** Proje köküne göre yol, ör. /private/invoices/invoice-2026-001.pdf */
  filePath: string;
  /** Bu çağrı faturayı yeni mi üretti? */
  created: boolean;
};

/**
 * Siparişin faturasını garantiler: varsa mevcut kaydı döner, yoksa üretir.
 *
 * Ödeme onayı akışının her iki kolundan da (kart bildirimi ve havale onayı)
 * çağrılır; `orderId` üzerinde unique kısıt olduğu için mükerrer fatura
 * oluşmaz.
 */
export async function ensureInvoice(orderId: string): Promise<EnsuredInvoice | null> {
  const existing = await prisma.invoice.findUnique({
    where: { orderId },
    select: { invoiceNumber: true, filePath: true },
  });

  if (existing) {
    return { ...existing, created: false };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return null;

  const filePath = await generateInvoicePDF(order);

  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
    select: { invoiceNumber: true },
  });

  return {
    invoiceNumber: invoice?.invoiceNumber ?? "",
    filePath,
    created: true,
  };
}

/** Faturanın PDF içeriğini okur. Dosya yoksa null döner. */
export async function readInvoiceFile(filePath: string): Promise<Buffer | null> {
  const absolute = path.join(process.cwd(), filePath);
  if (!existsSync(absolute)) return null;
  const { readFile } = await import("node:fs/promises");
  return readFile(absolute);
}

/**
 * Sipariş için faturayı üretir, diske yazar ve veritabanına kaydeder.
 * Oluşturulan dosyanın proje köküne göre yolunu döner.
 */
export async function generateInvoicePDF(order: OrderWithItems): Promise<string> {
  const invoicesDir = path.join(process.cwd(), "private", "invoices");
  await mkdir(invoicesDir, { recursive: true });

  // Eşzamanlı iki ödeme aynı numarayı hesaplayabilir; `invoiceNumber` unique
  // olduğu için çakışan kayıt reddedilir ve numara yeniden hesaplanır.
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const invoiceNumber = await getNextInvoiceNumber();
    const fileName = `invoice-${invoiceNumber}.pdf`;
    const relativePath = `/private/invoices/${fileName}`;

    try {
      const buffer = await renderPdf(order, invoiceNumber);
      await writeFile(path.join(invoicesDir, fileName), buffer);

      await prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          filePath: relativePath,
          status: "generated",
        },
      });

      return relativePath;
    } catch (error) {
      lastError = error;
      // P2002 = unique ihlali (numara veya sipariş çakışması) → tekrar dene.
      if ((error as { code?: string })?.code !== "P2002") throw error;
    }
  }

  throw lastError ?? new Error("Fatura oluşturulamadı.");
}
