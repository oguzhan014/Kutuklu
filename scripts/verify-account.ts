/**
 * Faz 3 doğrulama betiği: kişi başı kupon limiti, hesap anonimleştirme,
 * e-posta doğrulama.
 *
 * Gerçek veritabanına karşı çalışır; oluşturduğu her kaydı sonunda temizler.
 *
 * Çalıştırma:  npm run verify:account
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

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { createOrder, releaseOrderReservation } from "../src/lib/orders";
import { priceCart, CheckoutError } from "../src/lib/pricing";
import { anonymizeUserAccount, ANONYMIZED_NAME } from "../src/lib/account-deletion";
import {
  createEmailVerificationToken,
  verifyEmailToken,
  isEmailVerified,
} from "../src/lib/email-verification";

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

const TAG = "vacct";
const CUSTOMER_EMAIL = `${TAG}-musteri@kutuklu.local`;
const OTHER_EMAIL = `${TAG}-baska@kutuklu.local`;

const customer = {
  email: CUSTOMER_EMAIL,
  phone: "05551112233",
  firstName: "Ayşe",
  lastName: "Yılmaz",
  city: "İstanbul",
  district: "Kadıköy",
  address: "Bağdat Caddesi No 15 Daire 3",
  postalCode: "34710",
  notes: null,
  billingSameAsShipping: true,
};

/**
 * Oluşturulan kullanıcıların kimlikleri.
 *
 * E-posta/isme göre temizlik YETMEZ: anonimleştirme testinden sonra kaydın
 * e-postası `deleted-…@deleted.invalid`, adı "Silinmiş Kullanıcı" olur ve
 * etiketle bulunamaz.
 */
const createdUserIds: string[] = [];

async function cleanup() {
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { guestEmail: { contains: TAG } },
        { userId: { in: createdUserIds.length > 0 ? createdUserIds : ["-"] } },
      ],
    },
    select: { id: true },
  });

  for (const order of orders) {
    await prisma.couponRedemption.deleteMany({ where: { orderId: order.id } });
    await prisma.invoice.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
  }

  await prisma.coupon.deleteMany({ where: { code: { startsWith: "VACCT" } } });

  const byTag = await prisma.user.findMany({
    where: { OR: [{ email: { contains: TAG } }, { name: { contains: TAG } }] },
    select: { id: true },
  });

  const ids = [...new Set([...createdUserIds, ...byTag.map((u) => u.id)])];
  for (const id of ids) {
    await prisma.couponRedemption.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } }).catch(() => undefined);
  }

  createdUserIds.length = 0;
}

async function main() {
  console.log("\n═══ FAZ 3 DOĞRULAMASI ═══");

  await cleanup();

  const product = await prisma.product.findFirst({
    where: { isActive: true, type: "SIMPLE", stock: { gt: 0 } },
  });
  if (!product) throw new Error("Test için stoklu, basit bir ürün gerekli.");

  // Testler boyunca stok yetmezliği yaşanmasın.
  await prisma.product.update({ where: { id: product.id }, data: { stock: 100 } });

  // ═══ 1. KİŞİ BAŞI KUPON LİMİTİ ═══
  console.log("\n1. Kişi başı kupon limiti (misafir)");

  const coupon = await prisma.coupon.create({
    data: {
      code: "VACCTBIRKEZ",
      type: "PERCENTAGE",
      value: "10",
      maxUses: 100,
      maxUsesPerUser: 1, // kişi başı tek kullanım
      isActive: true,
    },
  });

  const first = await createOrder({
    items: [{ productId: product.id, quantity: 1 }],
    couponCode: coupon.code,
    paymentMethod: "transfer",
    customer,
  });
  check("İlk kullanım kabul ediliyor", Boolean(first.id));

  const redemption = await prisma.couponRedemption.findUnique({
    where: { orderId: first.id },
  });
  check("Kullanım kaydı oluşuyor", redemption !== null);
  check("Kullanım e-postası küçük harfe normalize", redemption?.email === CUSTOMER_EMAIL.toLowerCase());
  check("İlk kullanımın sırası 0", redemption?.useIndex === 0);

  let secondError: CheckoutError | null = null;
  try {
    await createOrder({
      items: [{ productId: product.id, quantity: 1 }],
      couponCode: coupon.code,
      paymentMethod: "transfer",
      customer,
    });
  } catch (error) {
    secondError = error instanceof CheckoutError ? error : null;
  }
  check("İkinci kullanım reddediliyor", secondError?.code === "COUPON_USER_LIMIT", secondError?.message);

  const orderCount = await prisma.order.count({ where: { guestEmail: CUSTOMER_EMAIL } });
  check("Reddedilen denemede sipariş oluşmuyor", orderCount === 1, `${orderCount} sipariş`);

  const stockAfter = await prisma.product.findUnique({
    where: { id: product.id },
    select: { stock: true },
  });
  check("Reddedilen denemede stok düşmüyor (99)", stockAfter?.stock === 99, `stok: ${stockAfter?.stock}`);

  const couponAfter = await prisma.coupon.findUnique({ where: { id: coupon.id } });
  check("Reddedilen denemede toplam sayaç artmıyor", couponAfter?.usedCount === 1, `usedCount: ${couponAfter?.usedCount}`);

  console.log("\n2. Limit yalnızca ilgili müşteriyi bağlıyor");

  const otherOrder = await createOrder({
    items: [{ productId: product.id, quantity: 1 }],
    couponCode: coupon.code,
    paymentMethod: "transfer",
    customer: { ...customer, email: OTHER_EMAIL },
  });
  check("Başka müşteri aynı kuponu kullanabiliyor", Boolean(otherOrder.id));

  console.log("\n3. Önizlemede uyarı");

  const priced = await priceCart([{ productId: product.id, quantity: 1 }], {
    couponCode: coupon.code,
    checkStock: false,
    buyerEmail: CUSTOMER_EMAIL,
  });
  check("Limiti dolan müşteriye indirim uygulanmıyor", priced.discountKurus === 0);
  check("Uyarı mesajı dönüyor", (priced.couponError ?? "").includes("daha önce kullandınız"), priced.couponError ?? "");

  const pricedOther = await priceCart([{ productId: product.id, quantity: 1 }], {
    couponCode: coupon.code,
    checkStock: false,
    buyerEmail: `${TAG}-yeni@kutuklu.local`,
  });
  check("Hakkı olan müşteriye indirim uygulanıyor", pricedOther.discountKurus > 0);

  console.log("\n4. İptalde kullanım hakkı iade ediliyor");

  await releaseOrderReservation(first.id);
  const afterRelease = await prisma.couponRedemption.findUnique({ where: { orderId: first.id } });
  check("İptalde kullanım kaydı siliniyor", afterRelease === null);

  const reuse = await createOrder({
    items: [{ productId: product.id, quantity: 1 }],
    couponCode: coupon.code,
    paymentMethod: "transfer",
    customer,
  });
  check("İptal sonrası müşteri kuponu tekrar kullanabiliyor", Boolean(reuse.id));

  // ═══ 5. E-POSTA DOĞRULAMA ═══
  console.log("\n5. E-posta doğrulama");

  const user = await prisma.user.create({
    data: {
      name: `${TAG} Test`,
      email: `${TAG}-uye@kutuklu.local`,
      password: await bcrypt.hash("GucluSifre123!", 10),
      role: "CUSTOMER",
    },
  });
  createdUserIds.push(user.id);

  check("Yeni kullanıcı doğrulanmamış başlıyor", !(await isEmailVerified(user.id)));

  const token = await createEmailVerificationToken(user.id, user.email);
  check("Ham token URL güvenli", /^[A-Za-z0-9_-]+$/.test(token));

  const stored = await prisma.emailVerificationToken.findFirst({ where: { userId: user.id } });
  check("Token veritabanında AÇIK saklanmıyor (hash'li)", stored?.tokenHash !== token);

  check("Geçersiz token reddediliyor", (await verifyEmailToken("uydurma-token")).ok === false);
  check("Boş token reddediliyor", (await verifyEmailToken("")).ok === false);

  const verified = await verifyEmailToken(token);
  check("Geçerli token kabul ediliyor", verified.ok === true);
  check("Kullanıcı doğrulanmış işaretleniyor", await isEmailVerified(user.id));

  const reused = await verifyEmailToken(token);
  check(
    "Aynı token ikinci kez kullanılamıyor",
    reused.ok === false && reused.reason === "used",
    JSON.stringify(reused)
  );

  console.log("\n6. Süresi dolmuş ve e-postası değişmiş token");

  const user2 = await prisma.user.create({
    data: {
      name: `${TAG} Test2`,
      email: `${TAG}-uye2@kutuklu.local`,
      password: await bcrypt.hash("GucluSifre123!", 10),
      role: "CUSTOMER",
    },
  });
  createdUserIds.push(user2.id);

  const expiredToken = await createEmailVerificationToken(user2.id, user2.email);
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user2.id, usedAt: null },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const expiredResult = await verifyEmailToken(expiredToken);
  check(
    "Süresi dolmuş token reddediliyor",
    expiredResult.ok === false && expiredResult.reason === "expired",
    JSON.stringify(expiredResult)
  );

  const changedToken = await createEmailVerificationToken(user2.id, user2.email);
  await prisma.user.update({
    where: { id: user2.id },
    data: { email: `${TAG}-degisti@kutuklu.local` },
  });
  const changedResult = await verifyEmailToken(changedToken);
  check(
    "E-posta değiştiyse eski bağlantı geçersiz",
    changedResult.ok === false && changedResult.reason === "email_changed",
    JSON.stringify(changedResult)
  );

  // ═══ 7. HESAP SİLME ═══
  console.log("\n7. Hesap anonimleştirme");

  const deletable = await prisma.user.create({
    data: {
      name: `${TAG} Silinecek`,
      email: `${TAG}-silinecek@kutuklu.local`,
      phone: "05559998877",
      password: await bcrypt.hash("GucluSifre123!", 10),
      role: "CUSTOMER",
      addresses: {
        create: {
          title: "Ev",
          fullName: "Silinecek Kullanıcı",
          address: "Test Sokak No 1",
          city: "İstanbul",
        },
      },
    },
  });
  createdUserIds.push(deletable.id);

  await createEmailVerificationToken(deletable.id, deletable.email);

  const memberOrder = await createOrder({
    items: [{ productId: product.id, quantity: 1 }],
    paymentMethod: "transfer",
    customer: { ...customer, email: `${TAG}-silinecek@kutuklu.local` },
    userId: deletable.id,
  });

  const result = await anonymizeUserAccount(deletable.id);
  check("Anonimleştirme başarılı", result.ok === true);
  check("Saklanan sipariş sayısı bildiriliyor", result.ok && result.retainedOrders === 1);

  const after = await prisma.user.findUnique({ where: { id: deletable.id } });
  check("Kayıt tamamen silinmiyor (sipariş bağı korunuyor)", after !== null);
  check("Ad anonimleşiyor", after?.name === ANONYMIZED_NAME, after?.name ?? "");
  check("E-posta yer tutucuyla değişiyor", after?.email.endsWith("@deleted.invalid") === true, after?.email);
  check("Telefon siliniyor", after?.phone === null);
  check("Şifre siliniyor (giriş yapılamaz)", after?.password === null);
  check("anonymizedAt damgası atılıyor", after?.anonymizedAt !== null);

  const addresses = await prisma.address.count({ where: { userId: deletable.id } });
  check("Adresler siliniyor", addresses === 0);

  const tokens = await prisma.emailVerificationToken.count({ where: { userId: deletable.id } });
  check("Doğrulama token'ları siliniyor", tokens === 0);

  const keptOrder = await prisma.order.findUnique({ where: { id: memberOrder.id } });
  check("Sipariş korunuyor (yasal zorunluluk)", keptOrder !== null);

  const secondAttempt = await anonymizeUserAccount(deletable.id);
  check(
    "Zaten silinmiş hesap tekrar silinemiyor",
    secondAttempt.ok === false && secondAttempt.reason === "already_deleted"
  );

  // ── Temizlik ──
  console.log("\n── Test verisi temizleniyor ──");
  await cleanup();
  await prisma.product.update({ where: { id: product.id }, data: { stock: product.stock } });
  console.log("Temizlik tamam.");

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
