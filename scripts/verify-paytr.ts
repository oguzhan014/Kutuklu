/**
 * PayTR entegrasyonunun imza ve veri biçimi doğrulaması.
 *
 * Ağa çıkmaz: `fetch` sahte bir işlevle değiştirilir ve PayTR'ye GİDECEK
 * gövde yakalanıp incelenir. Beklenen imzalar burada, PayTR dokümanındaki
 * formüllerden BAĞIMSIZ olarak yeniden hesaplanır; böylece lib'deki bir
 * kopyala-yapıştır hatası teste de sızmaz.
 *
 * Çalıştırma:  npm run verify:paytr
 */

process.env.PAYTR_MERCHANT_ID = "123456";
process.env.PAYTR_MERCHANT_KEY = "TESTmerchantKEY";
process.env.PAYTR_MERCHANT_SALT = "TESTmerchantSALT";
process.env.PAYTR_TEST_MODE = "1";

import { createHmac } from "node:crypto";
import {
  createPaymentToken,
  generateMerchantOid,
  isPayTRConfigured,
  refundPayment,
  verifyCallback,
} from "../src/lib/paytr";

const MERCHANT_ID = "123456";
const MERCHANT_KEY = "TESTmerchantKEY";
const MERCHANT_SALT = "TESTmerchantSALT";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** PayTR dokümanındaki imza: base64( HMAC-SHA256(veri, merchant_key) ) */
function paytrHash(data: string): string {
  return createHmac("sha256", MERCHANT_KEY).update(data).digest("base64");
}

/** fetch'i yakalayıp gövdeyi döndüren sahte istemci. */
function mockFetch(responseBody: unknown) {
  const captured: { url: string; body: URLSearchParams }[] = [];

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    captured.push({
      url: String(url),
      body: new URLSearchParams(String(init?.body ?? "")),
    });
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return captured;
}

const originalFetch = globalThis.fetch;

async function main() {
  console.log("\n═══ PAYTR ENTEGRASYON DOĞRULAMASI ═══");

  // ═══ 1. YAPILANDIRMA ═══
  console.log("\n1. Yapılandırma tespiti");

  check("Üç anahtar tanımlıyken yapılandırılmış sayılıyor", isPayTRConfigured());

  const savedSalt = process.env.PAYTR_MERCHANT_SALT;
  process.env.PAYTR_MERCHANT_SALT = "your_paytr_merchant_salt";
  check("Placeholder değer yapılandırılmamış sayılıyor", !isPayTRConfigured());
  process.env.PAYTR_MERCHANT_SALT = "";
  check("Boş değer yapılandırılmamış sayılıyor", !isPayTRConfigured());
  process.env.PAYTR_MERCHANT_SALT = savedSalt;

  // ═══ 2. MERCHANT_OID ═══
  console.log("\n2. Sipariş referansı (merchant_oid)");

  const oid = generateMerchantOid("KTK-260808-7F3QA");
  check("Yalnızca alfanumerik karakter içeriyor", /^[a-zA-Z0-9]+$/.test(oid), oid);
  check("Sipariş numarasını içeriyor", oid.startsWith("KTK2608087F3QA"), oid);
  check("64 karakteri aşmıyor", oid.length <= 64, `uzunluk: ${oid.length}`);

  const oid2 = generateMerchantOid("KTK-260808-7F3QA");
  check("Aynı sipariş için tekrar çağrıldığında benzersiz", oid !== oid2);

  // ═══ 3. TOKEN İSTEĞİ ═══
  console.log("\n3. Ödeme token'ı isteği");

  let captured = mockFetch({ status: "success", token: "TOKEN123" });

  const tokenResult = await createPaymentToken({
    merchantOid: "KTK2608087F3QAABCD1234",
    amountKurus: 14990,
    email: "musteri@ornek.com",
    userName: "Ayşe Yılmaz",
    userPhone: "05551112233",
    userAddress: "Bahçe Sokak No 5 Kadıköy İstanbul",
    userIp: "88.99.10.20",
    basket: [
      { name: "Erken Hasat 500ml", unitPriceKurus: 12000, quantity: 1 },
      { name: "Klasik Sızma (1000ml)", unitPriceKurus: 999, quantity: 3 },
    ],
    okUrl: "https://kutuklu.com/siparis/KTK-260808-7F3QA?token=abc",
    failUrl: "https://kutuklu.com/siparis/KTK-260808-7F3QA?token=abc",
  });

  check("Token başarıyla dönüyor", tokenResult.ok === true);
  check(
    "iframe adresi doğru kuruluyor",
    tokenResult.ok && tokenResult.iframeUrl === "https://www.paytr.com/odeme/guvenli/TOKEN123",
    tokenResult.ok ? tokenResult.iframeUrl : ""
  );

  const req = captured[0]!;
  check("Doğru uca istek atılıyor", req.url === "https://www.paytr.com/odeme/api/get-token", req.url);

  const body = req.body;
  check("payment_amount kuruş olarak gidiyor", body.get("payment_amount") === "14990");
  check("currency TL", body.get("currency") === "TL");
  check("test_mode açık", body.get("test_mode") === "1");
  check("Taksit kapalı", body.get("no_installment") === "1" && body.get("max_installment") === "1");
  check("merchant_oid gövdede", body.get("merchant_oid") === "KTK2608087F3QAABCD1234");

  // Sepet: base64( JSON [[ad, TL fiyat metni, adet], ...] )
  const basketJson = JSON.parse(
    Buffer.from(body.get("user_basket") ?? "", "base64").toString("utf8")
  );
  check(
    "Sepet ilk satırı doğru kodlanıyor",
    JSON.stringify(basketJson[0]) === JSON.stringify(["Erken Hasat 500ml", "120.00", 1]),
    JSON.stringify(basketJson[0])
  );
  check(
    "Sepette kuruşlu fiyat TL'ye çevriliyor",
    JSON.stringify(basketJson[1]) === JSON.stringify(["Klasik Sızma (1000ml)", "9.99", 3]),
    JSON.stringify(basketJson[1])
  );
  check("Türkçe karakterler bozulmuyor", basketJson[1][0].includes("Sızma"));

  // Token imzası — PayTR formülü:
  // merchant_id + user_ip + merchant_oid + email + payment_amount +
  // user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
  const expectedTokenHash = paytrHash(
    MERCHANT_ID +
      "88.99.10.20" +
      "KTK2608087F3QAABCD1234" +
      "musteri@ornek.com" +
      "14990" +
      (body.get("user_basket") ?? "") +
      "1" +
      "1" +
      "TL" +
      "1" +
      MERCHANT_SALT
  );
  check(
    "paytr_token imzası PayTR formülüne uyuyor",
    body.get("paytr_token") === expectedTokenHash,
    `beklenen ${expectedTokenHash}, gelen ${body.get("paytr_token")}`
  );

  // Hatalı tutar reddi
  const badAmount = await createPaymentToken({
    merchantOid: "X1",
    amountKurus: 0,
    email: "a@b.com",
    userName: "A",
    userPhone: "0",
    userAddress: "A",
    userIp: "1.1.1.1",
    basket: [],
    okUrl: "https://x",
    failUrl: "https://x",
  });
  check("Sıfır tutarlı ödeme reddediliyor", badAmount.ok === false);

  // PayTR hata dönerse
  mockFetch({ status: "failed", reason: "invalid merchant" });
  const rejected = await createPaymentToken({
    merchantOid: "X2",
    amountKurus: 100,
    email: "a@b.com",
    userName: "A",
    userPhone: "0",
    userAddress: "A",
    userIp: "1.1.1.1",
    basket: [{ name: "X", unitPriceKurus: 100, quantity: 1 }],
    okUrl: "https://x",
    failUrl: "https://x",
  });
  check("PayTR reddederse ok:false dönüyor", rejected.ok === false);
  check(
    "PayTR teknik hata metni müşteriye sızmıyor",
    rejected.ok === false && !rejected.error.includes("invalid merchant"),
    rejected.ok === false ? rejected.error : ""
  );

  // ═══ 4. BİLDİRİM İMZASI ═══
  console.log("\n4. Bildirim (callback) imza doğrulaması");

  const REAL_OID = "KTK2608087F3QAABCD1234";

  /**
   * PayTR'nin göndereceği gibi DOĞRU imzalanmış bir bildirim üretir.
   * İmza formülü: merchant_oid + merchant_salt + status + total_amount
   */
  function signedCallback(
    merchantOid = REAL_OID,
    status = "success",
    totalAmount = "14990"
  ) {
    return new URLSearchParams({
      merchant_oid: merchantOid,
      status,
      total_amount: totalAmount,
      payment_amount: totalAmount,
      hash: paytrHash(merchantOid + MERCHANT_SALT + status + totalAmount),
    });
  }

  /**
   * Kurcalama: imza ATILDIKTAN SONRA bir alan değiştirilir — saldırganın
   * yapabileceği tek şey budur, çünkü salt/key'i bilmediği için imzayı yeniden
   * üretemez.
   */
  function tamper(form: URLSearchParams, field: string, value: string) {
    const copy = new URLSearchParams(form);
    copy.set(field, value);
    return copy;
  }

  const valid = verifyCallback(signedCallback());
  check("Geçerli imzalı bildirim kabul ediliyor", valid !== null);
  check("Durum doğru okunuyor", valid?.status === "success");
  check("Tutar kuruş olarak ayrıştırılıyor", valid?.totalAmountKurus === 14990);
  check("payment_amount ayrıştırılıyor", valid?.paymentAmountKurus === 14990);

  check(
    "Tutarı sonradan değiştirilmiş bildirim reddediliyor",
    verifyCallback(tamper(signedCallback(), "total_amount", "1")) === null
  );
  check(
    "Sipariş referansı sonradan değiştirilmiş bildirim reddediliyor",
    verifyCallback(tamper(signedCallback(), "merchant_oid", "BASKASININSIPARISI")) === null
  );
  check(
    "Başarısız ödemenin imzasıyla 'success' iddiası reddediliyor",
    verifyCallback(tamper(signedCallback(REAL_OID, "failed"), "status", "success")) === null
  );
  check(
    "Uydurma imza reddediliyor",
    verifyCallback(
      tamper(signedCallback(), "hash", "sahteimzaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    ) === null
  );
  check("İmzasız bildirim reddediliyor", verifyCallback(new URLSearchParams()) === null);

  // Salt'ı bilmeyen saldırgan: doğru formül ama yanlış tuz
  const wrongSaltHash = createHmac("sha256", MERCHANT_KEY)
    .update(REAL_OID + "YANLIS_SALT" + "success" + "14990")
    .digest("base64");
  check(
    "Yanlış salt ile üretilen imza reddediliyor",
    verifyCallback(tamper(signedCallback(), "hash", wrongSaltHash)) === null
  );

  // Key'i bilmeyen saldırgan: doğru formül, doğru salt, yanlış anahtar
  const wrongKeyHash = createHmac("sha256", "YANLIS_KEY")
    .update(REAL_OID + MERCHANT_SALT + "success" + "14990")
    .digest("base64");
  check(
    "Yanlış anahtar ile üretilen imza reddediliyor",
    verifyCallback(tamper(signedCallback(), "hash", wrongKeyHash)) === null
  );

  const failedCallback = verifyCallback(signedCallback(REAL_OID, "failed"));
  check("Başarısız bildirim doğrulanıp failed dönüyor", failedCallback?.status === "failed");

  // ═══ 5. İADE ═══
  console.log("\n5. İade isteği");

  captured = mockFetch({ status: "success" });
  const refund = await refundPayment("KTK2608087F3QAABCD1234", 14990);
  check("İade başarılı dönüyor", refund.ok === true);

  const refundBody = captured[0]!.body;
  check(
    "İade ucu doğru",
    captured[0]!.url === "https://www.paytr.com/odeme/iade",
    captured[0]!.url
  );
  check(
    "return_amount TL cinsinden ondalıklı gidiyor",
    refundBody.get("return_amount") === "149.90",
    refundBody.get("return_amount") ?? ""
  );

  // PayTR formülü: merchant_id + merchant_oid + return_amount + merchant_salt
  const expectedRefundHash = paytrHash(
    MERCHANT_ID + "KTK2608087F3QAABCD1234" + "149.90" + MERCHANT_SALT
  );
  check(
    "İade imzası PayTR formülüne uyuyor",
    refundBody.get("paytr_token") === expectedRefundHash,
    `beklenen ${expectedRefundHash}, gelen ${refundBody.get("paytr_token")}`
  );

  mockFetch({ status: "error", err_no: "12", err_msg: "Iade suresi doldu" });
  const refundFail = await refundPayment("KTK2608087F3QAABCD1234", 14990);
  check("PayTR iadeyi reddederse ok:false dönüyor", refundFail.ok === false);

  const negative = await refundPayment("X", -5);
  check("Negatif tutarlı iade reddediliyor", negative.ok === false);

  console.log(`\n═══ SONUÇ: ${passed} başarılı, ${failed} başarısız ═══\n`);

  globalThis.fetch = originalFetch;
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
