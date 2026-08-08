import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * ─────────────────────────────────────────────────────────────
 * PAYTR ÖDEME ALTYAPISI
 * ─────────────────────────────────────────────────────────────
 *
 * Kart bilgileri PayTR'nin kendi iframe'inde toplanır ve doğrudan PayTR'ye
 * gider; bizim sunucumuza ve React ağacımıza hiç ulaşmaz (PCI-DSS kapsamı
 * dışında kalırız).
 *
 * Üç gizli değer gerekir ve ÜÇÜ DE yalnızca sunucuda kullanılır:
 *   PAYTR_MERCHANT_ID   — mağaza numarası
 *   PAYTR_MERCHANT_KEY  — HMAC anahtarı
 *   PAYTR_MERCHANT_SALT — HMAC tuzu
 *
 * Anahtarlar girilmemişse uygulama çökmez; kart ödemesi kapalı kabul edilir ve
 * havale/EFT ile sipariş verilmeye devam edilir.
 */

const TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
const IFRAME_URL = "https://www.paytr.com/odeme/guvenli";
const REFUND_URL = "https://www.paytr.com/odeme/iade";
const STATUS_URL = "https://www.paytr.com/odeme/durum-sorgu";

/** PayTR para birimi kodu. TL iki ondalıklıdır → tutarlar kuruş cinsindendir. */
export const PAYTR_CURRENCY = "TL";

const PLACEHOLDER_MARKERS = ["your_paytr", "xxx"];

function isPlaceholder(value: string | undefined): boolean {
  if (!value || value.trim() === "") return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

/** Kredi kartı ödemesi için PayTR yapılandırması tam mı? */
export function isPayTRConfigured(): boolean {
  return (
    !isPlaceholder(process.env.PAYTR_MERCHANT_ID) &&
    !isPlaceholder(process.env.PAYTR_MERCHANT_KEY) &&
    !isPlaceholder(process.env.PAYTR_MERCHANT_SALT)
  );
}

type Credentials = { merchantId: string; merchantKey: string; merchantSalt: string };

function credentials(): Credentials {
  if (!isPayTRConfigured()) {
    throw new Error(
      "PayTR yapılandırılmamış. .env dosyasına PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT girin."
    );
  }
  return {
    merchantId: process.env.PAYTR_MERCHANT_ID!,
    merchantKey: process.env.PAYTR_MERCHANT_KEY!,
    merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
  };
}

/** PayTR test modunda mı çalışıyor? (.env: PAYTR_TEST_MODE=0 → canlı) */
export function isPayTRTestMode(): boolean {
  return process.env.PAYTR_TEST_MODE !== "0";
}

/**
 * PayTR imzası: base64( HMAC-SHA256( veri, merchant_key ) ).
 *
 * DİKKAT: `merchant_salt` her uçta dizenin FARKLI bir yerinde durur
 * (token/iade/sorguda sonda, bildirimde ortada). Bu yüzden salt burada
 * otomatik eklenmez; çağıran taraf PayTR'nin beklediği dizeyi birebir kurar.
 */
function sign(data: string, credentials: Credentials): string {
  return createHmac("sha256", credentials.merchantKey).update(data).digest("base64");
}

/** Sabit zamanlı imza karşılaştırması (uzunluk farkı sızdırmaz). */
function signatureEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * PayTR sipariş referansı (`merchant_oid`) üretir.
 *
 * PayTR yalnızca ALFANUMERİK kabul eder (tire/boşluk reddedilir) ve her
 * ödeme denemesi için BENZERSİZ olmasını ister. Bu yüzden sipariş numarasının
 * alfanumerik hâline rastgele bir sonek eklenir: başarısız bir denemeden sonra
 * müşteri tekrar denediğinde yeni bir referans üretilir.
 */
export function generateMerchantOid(orderNumber: string): string {
  const base = orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${base}${suffix}`;
}

export type PayTRBasketLine = {
  name: string;
  /** Birim fiyat, kuruş. */
  unitPriceKurus: number;
  quantity: number;
};

/**
 * PayTR sepet formatı: base64( JSON [[ad, birim fiyat, adet], ...] ).
 * Fiyat TL cinsinden iki ondalıklı METİN olmalıdır.
 */
function encodeBasket(lines: PayTRBasketLine[]): string {
  const basket = lines.map((line) => [
    line.name.slice(0, 100),
    (line.unitPriceKurus / 100).toFixed(2),
    line.quantity,
  ]);
  return Buffer.from(JSON.stringify(basket), "utf8").toString("base64");
}

export type CreatePaymentTokenInput = {
  merchantOid: string;
  /** Tahsil edilecek toplam, kuruş (sunucuda hesaplanmış). */
  amountKurus: number;
  email: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userIp: string;
  basket: PayTRBasketLine[];
  /** Ödeme başarılı/başarısız bittiğinde dönülecek adres. */
  okUrl: string;
  failUrl: string;
};

export type CreatePaymentTokenResult =
  | { ok: true; token: string; iframeUrl: string }
  | { ok: false; error: string };

/**
 * PayTR iframe token'ı oluşturur.
 *
 * Tutar (`payment_amount`) SUNUCUNUN hesapladığı toplamdır; istemciden gelen
 * hiçbir tutar kullanılmaz. Token imzalıdır: alanların herhangi biri yolda
 * değiştirilirse PayTR isteği reddeder.
 */
export async function createPaymentToken(
  input: CreatePaymentTokenInput
): Promise<CreatePaymentTokenResult> {
  if (!isPayTRConfigured()) {
    return { ok: false, error: "PayTR yapılandırılmamış." };
  }

  if (!Number.isInteger(input.amountKurus) || input.amountKurus <= 0) {
    return { ok: false, error: "Geçersiz ödeme tutarı." };
  }

  const creds = credentials();

  // Hash'e giren değerlerle gövdeye giden değerler BİREBİR aynı olmalıdır;
  // bu yüzden hepsi tek yerde metne çevrilir.
  const merchantOid = input.merchantOid;
  const paymentAmount = String(input.amountKurus);
  const userBasket = encodeBasket(input.basket);
  const noInstallment = "1"; // Taksit kapalı → tahsil edilen tutar sipariş tutarına eşit.
  const maxInstallment = "1";
  const testMode = isPayTRTestMode() ? "1" : "0";

  // PayTR token formülü: ... + test_mode + merchant_salt (salt SONDA).
  const hashStr =
    creds.merchantId +
    input.userIp +
    merchantOid +
    input.email +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    PAYTR_CURRENCY +
    testMode +
    creds.merchantSalt;

  const body = new URLSearchParams({
    merchant_id: creds.merchantId,
    user_ip: input.userIp,
    merchant_oid: merchantOid,
    email: input.email,
    payment_amount: paymentAmount,
    paytr_token: sign(hashStr, creds),
    user_basket: userBasket,
    debug_on: isPayTRTestMode() ? "1" : "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: input.userName,
    user_address: input.userAddress,
    user_phone: input.userPhone,
    merchant_ok_url: input.okUrl,
    merchant_fail_url: input.failUrl,
    timeout_limit: "30",
    currency: PAYTR_CURRENCY,
    test_mode: testMode,
    lang: "tr",
  });

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(20_000),
    });

    const data = (await response.json()) as {
      status?: string;
      token?: string;
      reason?: string;
    };

    if (data.status === "success" && data.token) {
      return { ok: true, token: data.token, iframeUrl: `${IFRAME_URL}/${data.token}` };
    }

    // `reason` PayTR'nin teknik hata metnidir; müşteriye gösterilmez, loglanır.
    console.error("[paytr] token alınamadı:", data.reason ?? data);
    return { ok: false, error: "Ödeme başlatılamadı." };
  } catch (error) {
    console.error("[paytr] token isteği başarısız:", error);
    return { ok: false, error: "Ödeme başlatılamadı." };
  }
}

export type PayTRCallback = {
  merchantOid: string;
  status: "success" | "failed";
  /** Tahsil edilen toplam, kuruş (taksit komisyonu dahil olabilir). */
  totalAmountKurus: number;
  /** Sipariş tutarı, kuruş (komisyon hariç). PayTR göndermezse null. */
  paymentAmountKurus: number | null;
  failedReasonCode: string | null;
  failedReasonMsg: string | null;
};

/**
 * PayTR bildirimini (callback) doğrular ve ayrıştırır.
 *
 * İmza `merchant_oid + merchant_salt + status + total_amount` üzerinden
 * hesaplanır. İmza tutmuyorsa istek PayTR'den gelmiyor demektir → reddedilir.
 * Ödemenin "başarılı" olduğunun TEK kanıtı budur.
 */
export function verifyCallback(form: URLSearchParams): PayTRCallback | null {
  if (!isPayTRConfigured()) return null;

  const merchantOid = form.get("merchant_oid");
  const status = form.get("status");
  const totalAmount = form.get("total_amount");
  const hash = form.get("hash");

  if (!merchantOid || !status || !totalAmount || !hash) return null;

  const creds = credentials();

  // PayTR bildirim formülü: merchant_oid + merchant_salt + status + total_amount
  // (salt ORTADA — token formülünden farklıdır).
  const expected = sign(merchantOid + creds.merchantSalt + status + totalAmount, creds);

  if (!signatureEquals(hash, expected)) {
    return null;
  }

  const totalAmountKurus = Number.parseInt(totalAmount, 10);
  if (!Number.isFinite(totalAmountKurus)) return null;

  const rawPaymentAmount = form.get("payment_amount");
  const paymentAmountKurus = rawPaymentAmount
    ? Number.parseInt(rawPaymentAmount, 10)
    : null;

  return {
    merchantOid,
    status: status === "success" ? "success" : "failed",
    totalAmountKurus,
    paymentAmountKurus:
      paymentAmountKurus !== null && Number.isFinite(paymentAmountKurus)
        ? paymentAmountKurus
        : null,
    failedReasonCode: form.get("failed_reason_code"),
    failedReasonMsg: form.get("failed_reason_msg"),
  };
}

export type PayTRStatus =
  | { state: "paid"; totalAmountKurus: number }
  | { state: "not_paid" }
  | { state: "unknown" };

/**
 * Ödeme durumunu PayTR'ye sorar (bildirim gecikirse yedek yol).
 * Bilgi istemciden değil, doğrudan PayTR'den alınır.
 */
export async function queryPaymentStatus(merchantOid: string): Promise<PayTRStatus> {
  if (!isPayTRConfigured()) return { state: "unknown" };

  const creds = credentials();

  const body = new URLSearchParams({
    merchant_id: creds.merchantId,
    merchant_oid: merchantOid,
    // Durum sorgu formülü: merchant_id + merchant_oid + merchant_salt
    paytr_token: sign(creds.merchantId + merchantOid + creds.merchantSalt, creds),
  });

  try {
    const response = await fetch(STATUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await response.json()) as {
      status?: string;
      payment_total?: string | number;
      payment_amount?: string | number;
    };

    if (data.status !== "success") return { state: "not_paid" };

    const raw = data.payment_total ?? data.payment_amount;
    const totalAmountKurus = Number.parseInt(String(raw ?? ""), 10);

    if (!Number.isFinite(totalAmountKurus)) return { state: "unknown" };

    return { state: "paid", totalAmountKurus };
  } catch (error) {
    console.error("[paytr] durum sorgusu başarısız:", error);
    return { state: "unknown" };
  }
}

export type RefundResult = { ok: true } | { ok: false; error: string };

/**
 * PayTR üzerinden iade başlatır.
 *
 * `amountKurus` kısmi iadeye izin verir; tam iade için siparişin toplamı
 * verilir. PayTR tutarı TL cinsinden ondalıklı METİN bekler.
 */
export async function refundPayment(
  merchantOid: string,
  amountKurus: number
): Promise<RefundResult> {
  if (!isPayTRConfigured()) {
    return { ok: false, error: "PayTR yapılandırılmamış." };
  }

  if (!Number.isInteger(amountKurus) || amountKurus <= 0) {
    return { ok: false, error: "Geçersiz iade tutarı." };
  }

  const creds = credentials();
  const returnAmount = (amountKurus / 100).toFixed(2);

  const body = new URLSearchParams({
    merchant_id: creds.merchantId,
    merchant_oid: merchantOid,
    return_amount: returnAmount,
    // İade formülü: merchant_id + merchant_oid + return_amount + merchant_salt
    paytr_token: sign(
      creds.merchantId + merchantOid + returnAmount + creds.merchantSalt,
      creds
    ),
  });

  try {
    const response = await fetch(REFUND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(20_000),
    });

    const data = (await response.json()) as {
      status?: string;
      err_no?: string | number;
      err_msg?: string;
    };

    if (data.status === "success") return { ok: true };

    console.error("[paytr] iade reddedildi:", data.err_no, data.err_msg);
    return { ok: false, error: data.err_msg ?? "İade işlemi PayTR tarafından reddedildi." };
  } catch (error) {
    console.error("[paytr] iade isteği başarısız:", error);
    return { ok: false, error: "İade isteği gönderilemedi." };
  }
}
