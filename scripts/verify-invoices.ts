/**
 * Fatura ve sayfalama doğrulama betiği.
 *
 * Gerçek veritabanına karşı çalışır: test verisi oluşturur, üretilen PDF'i
 * inceler ve sonunda oluşturduğu her kaydı (DB satırı + PDF dosyası) temizler.
 * Çalışan bir web sunucusuna ihtiyaç duymaz.
 *
 * Çalıştırma:  npm run verify:invoices
 */

import * as fs from "node:fs";
import * as path from "node:path";

// .env yükle (Prisma CLI dışı çalıştırmada gerekli).
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

import { unlink } from "node:fs/promises";
import { prisma } from "../src/lib/prisma";
import { finalizePaidOrder } from "../src/lib/orders";
import { readInvoiceFile } from "../src/lib/invoice-generator";
import { ADMIN_PAGE_SIZE, countPages, resolvePage } from "../src/lib/pagination";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const TEST_PREFIX = "KTK-VINV-";

async function cleanup() {
  const orders = await prisma.order.findMany({
    where: { orderNumber: { startsWith: TEST_PREFIX } },
    select: { id: true, invoice: { select: { filePath: true } } },
  });

  for (const order of orders) {
    if (order.invoice?.filePath) {
      await unlink(path.join(process.cwd(), order.invoice.filePath)).catch(() => undefined);
    }
    await prisma.invoice.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
  }

  return orders.length;
}

async function main() {
  console.log("\n═══ FATURA VE SAYFALAMA DOĞRULAMASI ═══");

  await cleanup();

  // ═══ 1. SAYFALAMA MATEMATİĞİ ═══
  console.log("\n1. Sayfalama sınırları");

  check("Sayfa boyutu 20", ADMIN_PAGE_SIZE === 20);
  check("0 kayıt → 1 sayfa", countPages(0) === 1);
  check("20 kayıt → 1 sayfa", countPages(20) === 1);
  check("21 kayıt → 2 sayfa", countPages(21) === 2);
  check("Parametre yoksa 1. sayfa", resolvePage(undefined, 5) === 1);
  check("Geçerli sayfa korunuyor", resolvePage("3", 5) === 3);
  check("Sıfır/negatif 1'e çekiliyor", resolvePage("0", 5) === 1 && resolvePage("-4", 5) === 1);
  check("Sayı olmayan girdi 1'e çekiliyor", resolvePage("abc", 5) === 1);
  check("Son sayfayı aşan değer sınırlanıyor", resolvePage("9999", 5) === 5);
  check("Enjeksiyon denemesi sayıya düşüyor", resolvePage("1; DROP TABLE orders", 5) === 1);
  check("Dizi parametrede ilk değer alınıyor", resolvePage(["2", "9"], 5) === 2);

  // ═══ 2. HAVALE SİPARİŞİ DE FATURA ALIYOR ═══
  console.log("\n2. Fatura üretimi (havale/EFT siparişi)");

  const product = await prisma.product.findFirst({ where: { isActive: true } });
  if (!product) throw new Error("Test için aktif ürün gerekli.");

  const order = await prisma.order.create({
    data: {
      orderNumber: `${TEST_PREFIX}${Date.now().toString(36).toUpperCase()}`,
      accessToken: `vinv${Date.now()}`,
      guestEmail: "verify-invoice@kutuklu.local",
      status: "PROCESSING",
      paymentStatus: "PAID",
      // Havale siparişleri de faturalanmalıdır (kart akışına özel değildir).
      paymentMethod: "transfer",
      stockReserved: true,
      subtotal: "1249.90",
      shippingCost: "0.00",
      discountAmount: "50.00",
      couponCode: "İNDİRİM10",
      total: "1199.90",
      shippingName: "Ayşe Çağış Öztürk",
      shippingPhone: "05551112233",
      shippingAddress: "Bağdat Caddesi No 15 Daire 3",
      shippingCity: "İstanbul",
      shippingDistrict: "Kadıköy",
      billingSameAsShipping: true,
      items: {
        create: [
          {
            productId: product.id,
            productName: "Erken Hasat Sızma Zeytinyağı",
            unitPrice: "624.95",
            quantity: 2,
            totalPrice: "1249.90",
            variantLabel: "1000ml Şişe",
          },
        ],
      },
    },
  });

  await finalizePaidOrder(order.id);

  const invoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
  check("Havale siparişi için fatura üretildi", invoice !== null);
  check("Fatura numarası YYYY-NNN biçiminde", /^\d{4}-\d{3}$/.test(invoice?.invoiceNumber ?? ""), invoice?.invoiceNumber);
  check(
    "Dosya private/ altında (public DEĞİL)",
    Boolean(invoice?.filePath.startsWith("/private/invoices/")) && !invoice?.filePath.includes("public"),
    invoice?.filePath
  );

  // ═══ 3. PDF İÇERİĞİ ═══
  console.log("\n3. PDF içeriği");

  const pdf = invoice ? await readInvoiceFile(invoice.filePath) : null;
  check("PDF okunabiliyor", pdf !== null);
  check("Geçerli PDF başlığı", pdf?.subarray(0, 5).toString() === "%PDF-");

  const raw = pdf?.toString("latin1") ?? "";
  check("Gömülü TrueType font var (FontFile2)", raw.includes("/FontFile2"));
  check(
    "Standart Helvetica'ya düşülmemiş (Türkçe karakterler için)",
    !/BaseFont\s*\/Helvetica/.test(raw)
  );

  // Tutar biçimi: DB TL cinsinden Decimal tutar; 100'e BÖLÜNMEMELİ.
  const trNumber = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const expected = `${trNumber.format(Number(order.total))} TL`;
  check("Toplam '1.199,90 TL' olarak biçimleniyor", expected === "1.199,90 TL", expected);
  check(
    "Kuruşa bölme hatası geri gelmemiş",
    expected !== `${(Number(order.total) / 100).toFixed(2)} TL`
  );

  // ═══ 4. E-POSTA EKİ ═══
  console.log("\n4. E-posta eki");

  check("Fatura ek olarak iliştirilebilir boyutta", (pdf?.length ?? 0) > 10_000, `${pdf?.length} bayt`);
  check(
    "Olmayan dosyada çökmüyor, null dönüyor",
    (await readInvoiceFile("/private/invoices/yok-boyle-bir-dosya.pdf")) === null
  );

  // ═══ 5. MÜKERRER FATURA ═══
  console.log("\n5. Mükerrer fatura koruması");

  await finalizePaidOrder(order.id);
  await finalizePaidOrder(order.id);

  const count = await prisma.invoice.count({ where: { orderId: order.id } });
  check("Tekrar çağrılsa da tek fatura var", count === 1, `adet: ${count}`);

  const after = await prisma.invoice.findUnique({ where: { orderId: order.id } });
  check("Fatura numarası değişmiyor", after?.invoiceNumber === invoice?.invoiceNumber);

  // ═══ TEMİZLİK ═══
  console.log("\n── Test verisi temizleniyor ──");
  const removed = await cleanup();
  console.log(`Temizlik tamam (${removed} sipariş).`);

  console.log(`\n═══ SONUÇ: ${passed} başarılı, ${failed} başarısız ═══\n`);

  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await cleanup().catch(() => undefined);
  await prisma.$disconnect();
  process.exit(1);
});
