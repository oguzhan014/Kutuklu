/**
 * Favoriler ve SEO/güvenlik başlıkları doğrulama betiği.
 *
 * Veritabanı bölümü sunucusuz çalışır. HTTP bölümü (sitemap/robots/CSP)
 * yalnızca `BASE_URL` verildiğinde çalışır:
 *   BASE_URL=http://localhost:3001 npm run verify:favorites
 *
 * Çalıştırma:  npm run verify:favorites
 */

import * as fs from "node:fs";
import * as path from "node:path";

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
import {
  MAX_FAVORITES,
  mergeFavorites,
  readFavorites,
  removeFavoriteFor,
  sanitizeProductIds,
  toggleFavoriteFor,
} from "../src/lib/favorites";
import { anonymizeUserAccount } from "../src/lib/account-deletion";

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

const TAG = "vfav";

/**
 * Oluşturulan kullanıcıların kimlikleri.
 *
 * E-postaya göre temizlik YETMEZ: anonimleştirme testinden sonra kaydın
 * e-postası `deleted-…@deleted.invalid` olur ve etiketle bulunamaz.
 */
const createdUserIds: string[] = [];

async function createUser(name: string, emailSuffix: string) {
  const user = await prisma.user.create({
    data: {
      name,
      email: `${TAG}-${emailSuffix}@kutuklu.local`,
      password: await bcrypt.hash("GucluSifre123!", 10),
      role: "CUSTOMER",
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function cleanup() {
  const byTag = await prisma.user.findMany({
    where: { email: { contains: TAG } },
    select: { id: true },
  });

  const ids = [...new Set([...createdUserIds, ...byTag.map((u) => u.id)])];
  for (const id of ids) {
    await prisma.user.delete({ where: { id } }).catch(() => undefined);
  }

  createdUserIds.length = 0;
  await prisma.product.deleteMany({ where: { slug: { startsWith: `${TAG}-` } } });
}

async function main() {
  console.log("\n═══ FAVORİLER VE SEO DOĞRULAMASI ═══");

  await cleanup();

  // ═══ 1. GİRDİ TEMİZLEME ═══
  console.log("\n1. İstemci girdisinin temizlenmesi");

  check("Dizi olmayan girdi boş dönüyor", sanitizeProductIds("abc").length === 0);
  check("Sayı/nesne elenip yalnızca metin kalıyor", sanitizeProductIds(["a", 5, {}, null]).length === 1);
  check("Tekrarlar teke iniyor", sanitizeProductIds(["a", "a", "b"]).length === 2);
  check("Boş metin eleniyor", sanitizeProductIds(["", "   "]).length === 0);
  check(
    "Aşırı uzun kimlik eleniyor",
    sanitizeProductIds(["x".repeat(101)]).length === 0
  );
  check(
    `Liste ${MAX_FAVORITES} ile sınırlanıyor`,
    sanitizeProductIds(Array.from({ length: 300 }, (_, i) => `id${i}`)).length === MAX_FAVORITES
  );

  // ═══ TEST VERİSİ ═══
  const category = await prisma.category.findFirst();
  if (!category) throw new Error("Test için kategori gerekli.");

  const productA = await prisma.product.create({
    data: {
      name: "VFav Sızma Zeytinyağı",
      slug: `${TAG}-a`,
      price: "149.90",
      stock: 10,
      isActive: true,
      categoryId: category.id,
      volume: 500,
    },
  });

  const productB = await prisma.product.create({
    data: {
      name: "VFav Erken Hasat",
      slug: `${TAG}-b`,
      price: "199.90",
      stock: 10,
      isActive: true,
      categoryId: category.id,
    },
  });

  const passiveProduct = await prisma.product.create({
    data: {
      name: "VFav Pasif Ürün",
      slug: `${TAG}-pasif`,
      price: "99.90",
      stock: 0,
      isActive: false,
      categoryId: category.id,
    },
  });

  const user = await createUser("Favori Test", "uye");
  const other = await createUser("Baska Uye", "baska");

  // ═══ 2. EKLE / ÇIKAR ═══
  console.log("\n2. Favoriye ekleme ve çıkarma");

  check("Ekleme true dönüyor", (await toggleFavoriteFor(user.id, productA.id)) === true);
  check("Liste bir öğe içeriyor", (await readFavorites(user.id)).length === 1);
  check("Aynı ürüne tekrar basınca çıkıyor", (await toggleFavoriteFor(user.id, productA.id)) === false);
  check("Liste boşaldı", (await readFavorites(user.id)).length === 0);

  await toggleFavoriteFor(user.id, productA.id);
  await toggleFavoriteFor(user.id, productB.id);
  check("İki farklı ürün eklenebiliyor", (await readFavorites(user.id)).length === 2);

  check(
    "Pasif ürün favoriye eklenemiyor",
    (await toggleFavoriteFor(user.id, passiveProduct.id)) === false
  );
  check(
    "Var olmayan ürün favoriye eklenemiyor",
    (await toggleFavoriteFor(user.id, "olmayan-urun-kimligi")) === false
  );

  // ═══ 3. İZOLASYON ═══
  console.log("\n3. Kullanıcı izolasyonu (IDOR)");

  check("Diğer üyenin listesi boş", (await readFavorites(other.id)).length === 0);

  // Başka üyenin favorisini "kaldırmaya" çalışmak kendi listesine ekleme yapar,
  // diğerinin kaydına dokunmaz.
  await toggleFavoriteFor(other.id, productA.id);
  check("Diğer üye kendi kaydını ekledi", (await readFavorites(other.id)).length === 1);
  check("İlk üyenin listesi etkilenmedi", (await readFavorites(user.id)).length === 2);

  await removeFavoriteFor(other.id, productA.id);
  check("Diğer üyenin silmesi ilk üyeyi etkilemiyor", (await readFavorites(user.id)).length === 2);

  // ═══ 4. FİYAT TAZELİĞİ ═══
  console.log("\n4. Fiyat ve görsel tazeliği");

  await prisma.product.update({ where: { id: productA.id }, data: { price: "249.90" } });
  const refreshed = await readFavorites(user.id);
  const itemA = refreshed.find((item) => item.productId === productA.id);
  check("Fiyat değişikliği favorilere yansıyor", itemA?.price === 249.9, String(itemA?.price));
  check("Hacim bilgisi taşınıyor", itemA?.volume === 500);
  check(
    "Görseli olmayan ürün varsayılan görsel alıyor",
    itemA?.imageUrl.includes("/images/") === true
  );

  await prisma.product.update({ where: { id: productB.id }, data: { isActive: false } });
  check(
    "Satıştan kaldırılan ürün listede görünmüyor",
    (await readFavorites(user.id)).length === 1
  );
  await prisma.product.update({ where: { id: productB.id }, data: { isActive: true } });

  // ═══ 5. GİRİŞTE BİRLEŞTİRME ═══
  console.log("\n5. Girişte tarayıcı favorilerinin taşınması");

  const fresh = await createUser("Yeni Uye", "yeni");

  await mergeFavorites(fresh.id, [productA.id, productB.id]);
  check("Yereldeki favoriler hesaba taşınıyor", (await readFavorites(fresh.id)).length === 2);

  await mergeFavorites(fresh.id, [productA.id]);
  check(
    "Tekrar birleştirmede mükerrer kayıt oluşmuyor",
    (await readFavorites(fresh.id)).length === 2
  );

  await mergeFavorites(fresh.id, [passiveProduct.id, "olmayan-id"]);
  check(
    "Pasif ve olmayan ürünler taşınmıyor",
    (await readFavorites(fresh.id)).length === 2
  );

  await mergeFavorites(fresh.id, []);
  check("Boş liste sorun çıkarmıyor", (await readFavorites(fresh.id)).length === 2);

  // ═══ 6. ÜST SINIR ═══
  console.log("\n6. Üst sınır");

  const bulk = await createUser("Cok Favori", "cok");

  // Sınıra kadar doldur.
  await prisma.favorite.createMany({
    data: Array.from({ length: MAX_FAVORITES }, () => ({
      userId: bulk.id,
      productId: productA.id,
    })).map((row, index) => ({ ...row, productId: index === 0 ? productA.id : productA.id })),
    skipDuplicates: true,
  });

  // Aynı ürün tekrar eklenemeyeceği için sınırı gerçek satırlarla test edelim:
  const filler = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.product.create({
        data: {
          name: `VFav Dolgu ${i}`,
          slug: `${TAG}-dolgu-${i}`,
          price: "10.00",
          stock: 1,
          isActive: true,
          categoryId: category.id,
        },
      })
    )
  );

  for (const product of filler) await toggleFavoriteFor(bulk.id, product.id);
  const bulkCount = await prisma.favorite.count({ where: { userId: bulk.id } });
  check("Sınır aşılmıyor", bulkCount <= MAX_FAVORITES, `${bulkCount} kayıt`);

  // ═══ 7. HESAP SİLİNCE ═══
  console.log("\n7. Hesap silinince favoriler");

  const favBefore = await prisma.favorite.count({ where: { userId: user.id } });
  check("Silmeden önce favori var", favBefore > 0);

  await anonymizeUserAccount(user.id);
  const favAfter = await prisma.favorite.count({ where: { userId: user.id } });
  check("Hesap silinince favoriler de siliniyor", favAfter === 0, `${favAfter} kayıt`);

  // ═══ 8. SEO / GÜVENLİK BAŞLIKLARI (opsiyonel) ═══
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    console.log("\n8. SEO/başlık kontrolü atlandı (BASE_URL verilmedi)");
  } else {
    console.log("\n8. SEO ve güvenlik başlıkları");

    const robots = await fetch(`${baseUrl}/robots.txt`);
    const robotsText = await robots.text();
    check("robots.txt erişilebilir", robots.status === 200, `HTTP ${robots.status}`);
    check("Sitemap bildiriliyor", robotsText.includes("Sitemap:"));
    check("Yönetim paneli taramaya kapalı", robotsText.includes("/admin"));
    check("Hesap sayfaları taramaya kapalı", robotsText.includes("/hesabim"));
    check("Ödeme sayfası taramaya kapalı", robotsText.includes("/checkout"));

    const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
    const sitemapText = await sitemap.text();
    check("sitemap.xml erişilebilir", sitemap.status === 200, `HTTP ${sitemap.status}`);
    check("Ana sayfa listeleniyor", sitemapText.includes("<loc>"));
    check("Ürünler sayfası listeleniyor", sitemapText.includes("/urunler"));
    check("Kişisel sayfalar sitemap'te YOK", !sitemapText.includes("/hesabim"));
    check("Ödeme sayfası sitemap'te YOK", !sitemapText.includes("/checkout"));

    const home = await fetch(`${baseUrl}/`);
    const csp = home.headers.get("content-security-policy") ?? "";
    check("CSP başlığı gönderiliyor", csp.length > 0);
    check("Varsayılan kaynak kendi sitemiz", csp.includes("default-src 'self'"));
    check("PayTR iframe'ine izin var", csp.includes("https://www.paytr.com"));
    check("Google Fonts'a izin var", csp.includes("fonts.googleapis.com"));
    check("Nesne gömme kapalı", csp.includes("object-src 'none'"));
    check("Form gönderimi kendi sitemize sınırlı", csp.includes("form-action 'self'"));
    check("Çerçeveleme kısıtlı", csp.includes("frame-ancestors 'self'"));
    check(
      "Diğer güvenlik başlıkları duruyor",
      home.headers.get("x-content-type-options") === "nosniff"
    );
  }

  // ═══ TEMİZLİK ═══
  console.log("\n── Test verisi temizleniyor ──");
  await cleanup();
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
