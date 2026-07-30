/**
 * Ödeme akışı güvenlik doğrulama betiği.
 *
 * Gerçek veritabanına karşı çalışır: test verisi oluşturur, senaryoları
 * dener ve sonunda oluşturduğu her kaydı temizler.
 *
 * Çalıştırma:  npx tsx scripts/verify-checkout.ts
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

import { prisma } from "../src/lib/prisma";
import { priceCart, CheckoutError } from "../src/lib/pricing";
import {
  createOrder,
  releaseOrderReservation,
  markOrderPaid,
} from "../src/lib/orders";
import { toKurus, kurusToDecimalString } from "../src/lib/money";

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

async function expectReject(name: string, fn: () => Promise<unknown>, expectedCode?: string) {
  try {
    await fn();
    check(name, false, "hata bekleniyordu ama işlem başarılı oldu");
  } catch (error) {
    if (error instanceof CheckoutError) {
      check(name, expectedCode ? error.code === expectedCode : true, `kod=${error.code}`);
    } else {
      check(name, false, `beklenmeyen hata: ${(error as Error).message}`);
    }
  }
}

const customer = {
  email: "test-verify@kutuklu.local",
  phone: "5550000000",
  firstName: "Test",
  lastName: "Kullanici",
  city: "Mersin",
  district: "Mut",
  address: "Kütüklü Köyü test adresi No 1",
  postalCode: null,
  notes: null,
  billingSameAsShipping: true,
};

async function main() {
  console.log("\n═══ KÜTÜKLÜ ÖDEME AKIŞI DOĞRULAMA ═══\n");

  const category = await prisma.category.findFirst();
  if (!category) throw new Error("Kategori bulunamadı, önce seed çalıştırın.");

  // ── Test verisi ────────────────────────────────────────
  const product = await prisma.product.create({
    data: {
      name: "ZZ Test Ürünü (silinecek)",
      slug: `zz-test-${Date.now()}`,
      price: "100.00",
      stock: 5,
      isActive: true,
      categoryId: category.id,
      volume: 500,
    },
  });

  const inactiveProduct = await prisma.product.create({
    data: {
      name: "ZZ Pasif Test Ürünü",
      slug: `zz-pasif-${Date.now()}`,
      price: "50.00",
      stock: 10,
      isActive: false,
      categoryId: category.id,
    },
  });

  // Varyasyonlu test ürünü: 500ml (stok 3, 200 TL) ve 1000ml (stok 1, 350 TL).
  const variableProduct = await prisma.product.create({
    data: {
      name: "ZZ Varyasyonlu Test Ürünü",
      slug: `zz-variable-${Date.now()}`,
      price: "0",
      stock: 0,
      isActive: true,
      type: "VARIABLE",
      categoryId: category.id,
      attributes: { create: [{ name: "Hacim", options: ["500ml", "1000ml"] }] },
      variants: {
        create: [
          { attributes: { Hacim: "500ml" }, price: "200.00", stock: 3 },
          { attributes: { Hacim: "1000ml" }, price: "350.00", stock: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  const variant500 = variableProduct.variants.find((v) => Number(v.price) === 200)!;
  const variant1000 = variableProduct.variants.find((v) => Number(v.price) === 350)!;

  // Başka bir üründeki varyant kimliğini bu ürüne enjekte etme denemesi için.
  const otherVariableProduct = await prisma.product.create({
    data: {
      name: "ZZ Diğer Varyasyonlu Ürün",
      slug: `zz-variable-other-${Date.now()}`,
      price: "0",
      stock: 0,
      isActive: true,
      type: "VARIABLE",
      categoryId: category.id,
      variants: { create: [{ attributes: { Hacim: "250ml" }, price: "1.00", stock: 100 }] },
    },
    include: { variants: true },
  });
  const foreignVariant = otherVariableProduct.variants[0]!;

  const percentCoupon = await prisma.coupon.create({
    data: { code: `ZZTEST10-${Date.now()}`, type: "PERCENTAGE", value: "10", isActive: true },
  });

  const hugeCoupon = await prisma.coupon.create({
    data: { code: `ZZHUGE-${Date.now()}`, type: "FIXED", value: "999999", isActive: true },
  });

  const expiredCoupon = await prisma.coupon.create({
    data: {
      code: `ZZEXP-${Date.now()}`,
      type: "PERCENTAGE",
      value: "50",
      isActive: true,
      expiresAt: new Date(Date.now() - 86_400_000),
    },
  });

  const minOrderCoupon = await prisma.coupon.create({
    data: {
      code: `ZZMIN-${Date.now()}`,
      type: "FIXED",
      value: "50",
      minOrderAmount: "10000",
      isActive: true,
    },
  });

  const createdOrderIds: string[] = [];

  try {
    // ═══ 1. FİYAT MANİPÜLASYONU ═══
    console.log("1. Fiyat manipülasyonuna karşı koruma");

    const priced = await priceCart([{ productId: product.id, quantity: 2 }]);
    check(
      "Fiyat veritabanından okunuyor (2 × 100 TL = 20000 kuruş)",
      priced.subtotalKurus === 20000,
      `gelen: ${priced.subtotalKurus}`
    );

    // İstemci sahte fiyat/isim göndermeye çalışıyor → yok sayılmalı.
    const tampered = await priceCart([
      { productId: product.id, quantity: 2, price: 1, unitPrice: 1, name: "Bedava" } as never,
    ]);
    check(
      "İstemcinin gönderdiği sahte fiyat yok sayılıyor",
      tampered.subtotalKurus === 20000,
      `gelen: ${tampered.subtotalKurus}`
    );

    await expectReject(
      "Negatif adet reddediliyor",
      () => priceCart([{ productId: product.id, quantity: -5 }]),
      "INVALID_QUANTITY"
    );

    await expectReject(
      "Ondalıklı adet reddediliyor",
      () => priceCart([{ productId: product.id, quantity: 1.5 }]),
      "INVALID_QUANTITY"
    );

    await expectReject(
      "Adet limiti aşılamıyor",
      () => priceCart([{ productId: product.id, quantity: 9999 }]),
      "QUANTITY_LIMIT"
    );

    await expectReject(
      "Pasif ürün sipariş edilemiyor",
      () => priceCart([{ productId: inactiveProduct.id, quantity: 1 }]),
      "PRODUCT_UNAVAILABLE"
    );

    await expectReject(
      "Var olmayan ürün reddediliyor",
      () => priceCart([{ productId: "sahte-id-123", quantity: 1 }]),
      "PRODUCT_UNAVAILABLE"
    );

    await expectReject(
      "Stok üstü sipariş reddediliyor",
      () => priceCart([{ productId: product.id, quantity: 99 }], { checkStock: true }),
      "QUANTITY_LIMIT"
    );

    await expectReject(
      "Boş sepet reddediliyor",
      () => priceCart([]),
      "EMPTY_CART"
    );

    // ═══ 2. KUPON GÜVENLİĞİ ═══
    console.log("\n2. Kupon doğrulama");

    const withPercent = await priceCart([{ productId: product.id, quantity: 2 }], {
      couponCode: percentCoupon.code,
    });
    check(
      "%10 kupon doğru uygulanıyor (2000 kuruş indirim)",
      withPercent.discountKurus === 2000,
      `gelen: ${withPercent.discountKurus}`
    );

    const withHuge = await priceCart([{ productId: product.id, quantity: 2 }], {
      couponCode: hugeCoupon.code,
    });
    check(
      "Devasa kupon ara toplamı aşamıyor (indirim = ara toplam)",
      withHuge.discountKurus === withHuge.subtotalKurus,
      `indirim: ${withHuge.discountKurus}, ara toplam: ${withHuge.subtotalKurus}`
    );
    check(
      "Toplam asla negatif olmuyor",
      withHuge.totalKurus >= 0,
      `toplam: ${withHuge.totalKurus}`
    );

    const withExpired = await priceCart([{ productId: product.id, quantity: 2 }], {
      couponCode: expiredCoupon.code,
    });
    check(
      "Süresi dolmuş kupon reddediliyor",
      withExpired.discountKurus === 0 && withExpired.couponError !== null,
      `hata: ${withExpired.couponError}`
    );

    const withMinOrder = await priceCart([{ productId: product.id, quantity: 1 }], {
      couponCode: minOrderCoupon.code,
    });
    check(
      "Minimum sepet tutarı altında kupon reddediliyor",
      withMinOrder.discountKurus === 0 && withMinOrder.couponError !== null,
      `hata: ${withMinOrder.couponError}`
    );

    const withFakeCoupon = await priceCart([{ productId: product.id, quantity: 1 }], {
      couponCode: "BOYLE-BIR-KUPON-YOK",
    });
    check(
      "Var olmayan kupon reddediliyor",
      withFakeCoupon.discountKurus === 0 && withFakeCoupon.couponError !== null
    );

    // ═══ 3. KARGO HESABI ═══
    console.log("\n3. Kargo hesabı");

    const smallCart = await priceCart([{ productId: product.id, quantity: 1 }]);
    check(
      "Eşik altında kargo ücreti ekleniyor",
      smallCart.shippingKurus > 0,
      `kargo: ${smallCart.shippingKurus}`
    );
    check(
      "Toplam = ara toplam - indirim + kargo",
      smallCart.totalKurus ===
        smallCart.subtotalKurus - smallCart.discountKurus + smallCart.shippingKurus
    );

    const bigCart = await priceCart([{ productId: product.id, quantity: 5 }]);
    check(
      "Eşik üstünde kargo ücretsiz",
      bigCart.shippingKurus === 0,
      `kargo: ${bigCart.shippingKurus}`
    );

    // ═══ 4. SİPARİŞ OLUŞTURMA & STOK REZERVASYONU ═══
    console.log("\n4. Sipariş oluşturma ve stok rezervasyonu");

    const stockBefore = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock;

    const order = await createOrder({
      items: [{ productId: product.id, quantity: 2 }],
      paymentMethod: "transfer",
      customer,
    });
    createdOrderIds.push(order.id);

    const stockAfter = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock;

    check(
      "Sipariş sonrası stok düşüyor (5 → 3)",
      stockAfter === stockBefore - 2,
      `önce: ${stockBefore}, sonra: ${stockAfter}`
    );

    const orderRow = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    check("Sipariş PENDING/UNPAID olarak açılıyor",
      orderRow!.status === "PENDING" && orderRow!.paymentStatus === "UNPAID");
    check("Stok rezervasyon bayrağı işaretli", orderRow!.stockReserved === true);
    check(
      "Sipariş toplamı sunucu hesabıyla aynı",
      toKurus(orderRow!.total) === order.totalKurus,
      `db: ${toKurus(orderRow!.total)}, hesap: ${order.totalKurus}`
    );
    check(
      "Sipariş kalemi anlık fiyatı saklıyor (100 TL)",
      toKurus(orderRow!.items[0]!.unitPrice) === 10000
    );
    check(
      "Erişim anahtarı üretiliyor ve tahmin edilemez uzunlukta",
      orderRow!.accessToken.length >= 40
    );
    check(
      "Sipariş numarası okunabilir formatta",
      /^KTK-\d{6}-[A-Z0-9]{5}$/.test(orderRow!.orderNumber),
      orderRow!.orderNumber
    );

    // ═══ 5. STOK TÜKENMESİ ═══
    console.log("\n5. Stok tükenmesi");

    await expectReject(
      "Kalan stoktan fazlası sipariş edilemiyor (kalan 3, istenen 10)",
      () =>
        createOrder({
          items: [{ productId: product.id, quantity: 10 }],
          paymentMethod: "transfer",
          customer,
        }),
      "OUT_OF_STOCK"
    );

    // Kalan 3 adet; 4 istemek stok hatası vermeli.
    await expectReject(
      "Stoktan fazla sipariş reddediliyor (kalan 3, istenen 4)",
      () =>
        createOrder({
          items: [{ productId: product.id, quantity: 4 }],
          paymentMethod: "transfer",
          customer,
        }),
      "OUT_OF_STOCK"
    );

    const stockUnchanged = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock;
    check(
      "Başarısız siparişte stok geri alınıyor (transaction rollback)",
      stockUnchanged === 3,
      `stok: ${stockUnchanged}`
    );

    // ═══ 6. EŞZAMANLI SİPARİŞ (YARIŞ KOŞULU) ═══
    console.log("\n6. Eşzamanlı sipariş — son ürün için yarış");

    await prisma.product.update({ where: { id: product.id }, data: { stock: 1 } });

    const results = await Promise.allSettled([
      createOrder({
        items: [{ productId: product.id, quantity: 1 }],
        paymentMethod: "transfer",
        customer,
      }),
      createOrder({
        items: [{ productId: product.id, quantity: 1 }],
        paymentMethod: "transfer",
        customer,
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    for (const result of fulfilled) {
      if (result.status === "fulfilled") createdOrderIds.push(result.value.id);
    }

    check(
      "Son ürün için yalnızca bir sipariş başarılı oluyor",
      fulfilled.length === 1,
      `başarılı: ${fulfilled.length}`
    );

    const finalStock = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock;
    check("Stok eksiye düşmüyor", finalStock === 0, `stok: ${finalStock}`);

    // ═══ 7. REZERVASYON İADESİ ═══
    console.log("\n7. Rezervasyon iadesi (idempotent)");

    const releaseTarget = createdOrderIds[0]!;
    const first = await releaseOrderReservation(releaseTarget);
    const stockAfterRelease = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock;
    const second = await releaseOrderReservation(releaseTarget);
    const stockAfterSecond = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock;

    check("İlk iade uygulanıyor", first === true);
    check("İkinci iade tekrar uygulanmıyor", second === false);
    check(
      "Stok iki kez iade edilmiyor",
      stockAfterRelease === stockAfterSecond,
      `${stockAfterRelease} vs ${stockAfterSecond}`
    );

    // ═══ 7B. VARYASYONLU ÜRÜN ═══
    console.log("\n7b. Varyasyonlu ürün fiyatlandırma ve stok");

    const variablePriced = await priceCart([{ productId: variableProduct.id, variantId: variant500.id, quantity: 1 }]);
    check(
      "Varyant fiyatı doğru okunuyor (500ml = 200 TL)",
      variablePriced.subtotalKurus === 20000,
      `gelen: ${variablePriced.subtotalKurus}`
    );
    check(
      "Varyant etiketi doğru üretiliyor",
      variablePriced.lines[0]?.variantLabel === "500ml",
      `gelen: ${variablePriced.lines[0]?.variantLabel}`
    );

    const variable1000Priced = await priceCart([{ productId: variableProduct.id, variantId: variant1000.id, quantity: 1 }]);
    check(
      "Aynı üründe farklı varyant farklı fiyat veriyor (1000ml = 350 TL)",
      variable1000Priced.subtotalKurus === 35000,
      `gelen: ${variable1000Priced.subtotalKurus}`
    );

    await expectReject(
      "VARIABLE üründe variantId eksikse reddediliyor",
      () => priceCart([{ productId: variableProduct.id, quantity: 1 }], { checkStock: false }),
      "PRODUCT_UNAVAILABLE"
    );

    await expectReject(
      "Var olmayan variantId reddediliyor",
      () => priceCart([{ productId: variableProduct.id, variantId: "sahte-varyant-id", quantity: 1 }], { checkStock: false }),
      "PRODUCT_UNAVAILABLE"
    );

    // Güvenlik: başka bir ürüne ait GERÇEK bir variantId, bu ürünün productId'siyle
    // birlikte gönderilirse kabul edilmemeli (ucuz varyantı başka ürüne yamama denemesi).
    await expectReject(
      "Başka ürüne ait variantId bu üründe kabul edilmiyor",
      () =>
        priceCart(
          [{ productId: variableProduct.id, variantId: foreignVariant.id, quantity: 1 }],
          { checkStock: false }
        ),
      "PRODUCT_UNAVAILABLE"
    );

    await expectReject(
      "Varyant stoku aşıldığında reddediliyor (1000ml stok=1, istenen=5)",
      () => priceCart([{ productId: variableProduct.id, variantId: variant1000.id, quantity: 5 }]),
      "OUT_OF_STOCK"
    );

    // Sipariş oluşturma: stok doğru VARYANTTAN düşmeli, Product satırı 0 kalmalı.
    const variableOrder = await createOrder({
      items: [{ productId: variableProduct.id, variantId: variant500.id, quantity: 2 }],
      paymentMethod: "transfer",
      customer,
    });
    createdOrderIds.push(variableOrder.id);

    const variant500After = await prisma.productVariant.findUnique({ where: { id: variant500.id } });
    const variant1000After = await prisma.productVariant.findUnique({ where: { id: variant1000.id } });
    const variableProductAfter = await prisma.product.findUnique({ where: { id: variableProduct.id } });

    check(
      "Sipariş edilen varyantın stoku düşüyor (3 → 1)",
      variant500After?.stock === 1,
      `stok: ${variant500After?.stock}`
    );
    check(
      "Sipariş edilmeyen kardeş varyant etkilenmiyor",
      variant1000After?.stock === 1,
      `stok: ${variant1000After?.stock}`
    );
    check(
      "Product satırının kendi stoku hiç değişmiyor (varyasyonlu üründe her zaman 0)",
      variableProductAfter?.stock === 0,
      `stok: ${variableProductAfter?.stock}`
    );

    const variableOrderItem = await prisma.orderItem.findFirst({ where: { orderId: variableOrder.id } });
    check("Sipariş kaleminde variantId saklanıyor", variableOrderItem?.variantId === variant500.id);
    check("Sipariş kaleminde variantLabel saklanıyor", variableOrderItem?.variantLabel === "500ml");

    // Rezervasyon iadesi doğru varyanta geri yazmalı.
    await releaseOrderReservation(variableOrder.id);
    const variant500Released = await prisma.productVariant.findUnique({ where: { id: variant500.id } });
    check(
      "İptalde stok doğru varyanta iade ediliyor (1 → 3)",
      variant500Released?.stock === 3,
      `stok: ${variant500Released?.stock}`
    );

    // ═══ 8. ÖDEME DOĞRULAMA ═══
    console.log("\n8. Ödeme doğrulama (markOrderPaid)");

    const payOrder = await createOrder({
      items: [{ productId: inactiveProduct.id, quantity: 1 }],
      paymentMethod: "transfer",
      customer,
    }).catch(() => null);
    check("Pasif ürünle sipariş oluşturulamıyor", payOrder === null);

    // Ödeme testleri için stok ver ve yeni sipariş aç.
    await prisma.product.update({ where: { id: product.id }, data: { stock: 10 } });

    const cardOrder = await createOrder({
      items: [{ productId: product.id, quantity: 1 }],
      paymentMethod: "card",
      customer,
    });
    createdOrderIds.push(cardOrder.id);

    await prisma.order.update({
      where: { id: cardOrder.id },
      data: { stripePaymentId: `pi_test_${cardOrder.id}` },
    });

    // Yanlış tutarla ödeme denemesi
    const wrongAmount = await markOrderPaid({
      orderId: cardOrder.id,
      paymentIntentId: `pi_test_${cardOrder.id}`,
      amountReceivedKurus: 1, // 1 kuruş!
      currency: "try",
    });
    check(
      "Eksik tutarlı ödeme reddediliyor",
      wrongAmount.status === "mismatch",
      `durum: ${wrongAmount.status}`
    );

    const stillUnpaid = await prisma.order.findUnique({ where: { id: cardOrder.id } });
    check("Uyuşmazlıkta sipariş ödenmiş sayılmıyor", stillUnpaid!.paymentStatus === "UNPAID");
    check(
      "Uyuşmazlık admin notuna yazılıyor",
      (stillUnpaid!.adminNote ?? "").includes("ÖDEME UYUŞMAZLIĞI")
    );

    // Yanlış para birimi
    const wrongCurrency = await markOrderPaid({
      orderId: cardOrder.id,
      paymentIntentId: `pi_test_${cardOrder.id}`,
      amountReceivedKurus: cardOrder.totalKurus,
      currency: "usd",
    });
    check("Yanlış para birimi reddediliyor", wrongCurrency.status === "mismatch");

    // Yanlış PaymentIntent
    const wrongIntent = await markOrderPaid({
      orderId: cardOrder.id,
      paymentIntentId: "pi_baskasinin_odemesi",
      amountReceivedKurus: cardOrder.totalKurus,
      currency: "try",
    });
    check("Eşleşmeyen PaymentIntent reddediliyor", wrongIntent.status === "mismatch");

    // Doğru ödeme
    const correct = await markOrderPaid({
      orderId: cardOrder.id,
      paymentIntentId: `pi_test_${cardOrder.id}`,
      amountReceivedKurus: cardOrder.totalKurus,
      currency: "try",
    });
    check("Doğru tutarlı ödeme kabul ediliyor", correct.status === "paid", `durum: ${correct.status}`);

    const paidRow = await prisma.order.findUnique({ where: { id: cardOrder.id } });
    check("Ödenen sipariş PAID/PROCESSING oluyor",
      paidRow!.paymentStatus === "PAID" && paidRow!.status === "PROCESSING");
    check("Ödeme tarihi kaydediliyor", paidRow!.paidAt !== null);

    // Tekrarlanan webhook
    const duplicate = await markOrderPaid({
      orderId: cardOrder.id,
      paymentIntentId: `pi_test_${cardOrder.id}`,
      amountReceivedKurus: cardOrder.totalKurus,
      currency: "try",
    });
    check(
      "Tekrarlanan ödeme olayı idempotent (already_paid)",
      duplicate.status === "already_paid",
      `durum: ${duplicate.status}`
    );

    // ═══ 9. PARA ARİTMETİĞİ ═══
    console.log("\n9. Para aritmetiği (kuruş)");

    check("toKurus(19.99) === 1999", toKurus("19.99") === 1999);
    check("toKurus(0.1+0.2 hatası yok)", toKurus(0.1 + 0.2) === 30);
    check("kurusToDecimalString(1999) === '19.99'", kurusToDecimalString(1999) === "19.99");
    check("kurusToDecimalString(5) === '0.05'", kurusToDecimalString(5) === "0.05");
    check("kurusToDecimalString(100) === '1.00'", kurusToDecimalString(100) === "1.00");
  } finally {
    // ── Temizlik ─────────────────────────────────────────
    console.log("\n── Test verisi temizleniyor ──");

    await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    await prisma.product.deleteMany({
      where: { slug: { startsWith: "zz-" } },
    });
    await prisma.coupon.deleteMany({ where: { code: { startsWith: "ZZ" } } });

    console.log("Temizlik tamam.");
  }

  console.log(`\n═══ SONUÇ: ${passed} başarılı, ${failed} başarısız ═══\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error("\nBETİK HATASI:", error);
  process.exit(1);
});
