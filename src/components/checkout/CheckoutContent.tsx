"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  CreditCard,
  Landmark,
  Check,
  ShoppingBag,
  X,
  Printer,
  Loader2,
  Tag,
  AlertCircle,
  Lock,
} from "lucide-react";

import { useCartStore } from "@/lib/store";
import { useCartHydrated } from "@/lib/use-cart-hydrated";
import { formatPrice } from "@/lib/utils";
import { TURKIYE_ILLERI } from "@/lib/turkiye-iller";
import {
  getCartSummary,
  placeOrder,
  type CartSummary,
} from "@/app/actions/checkout";
import { PayTRPaymentStep } from "@/components/checkout/PayTRPaymentStep";
import { EmailVerificationNotice } from "@/components/checkout/EmailVerificationNotice";

/**
 * ÖDEME EKRANI
 *
 * Güvenlik açısından kritik iki nokta:
 *  1. Ekranda gösterilen HER tutar sunucudan (`getCartSummary`) gelir.
 *     Bu bileşen hiçbir fiyat hesaplaması yapmaz ve sunucuya tutar göndermez.
 *     Sunucuya giden tek sepet bilgisi: ürün kimliği ve adet.
 *  2. Kart bilgileri bu forma HİÇ girilmez. Kart verisi PayTR'nin kendi
 *     iframe'i üzerinden doğrudan PayTR'ye gider; sunucumuz ve bu sayfa kart
 *     numarasını asla görmez (PCI-DSS kapsamı dışında kalır).
 */

type Prefill = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
} | null;

type Props = {
  prefill: Prefill;
  /** Üye giriş yapmış ama e-postası doğrulanmamışsa adresi; aksi hâlde null. */
  unverifiedEmail: string | null;
  cardEnabled: boolean;
  transferEnabled: boolean;
  bank: { name: string; accountHolder: string; iban: string };
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxOffice: string;
    taxNumber: string;
  };
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid var(--color-border)",
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--color-gray-600)",
};

const sectionStyle: React.CSSProperties = {
  background: "var(--color-white)",
  padding: "32px",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border)",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span
      style={{
        fontSize: "0.75rem",
        color: "#DC2626",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <AlertCircle size={12} /> {message}
    </span>
  );
}

export function CheckoutContent({
  prefill,
  unverifiedEmail,
  cardEnabled,
  transferEnabled,
  bank,
  store,
}: Props) {
  const { items, clearCart } = useCartStore();

  // Sepet localStorage'dan yüklenene kadar form çizilmez.
  const hydrated = useCartHydrated();

  // ── Form durumu ──────────────────────────────────────────
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [firstName, setFirstName] = useState(prefill?.firstName ?? "");
  const [lastName, setLastName] = useState(prefill?.lastName ?? "");
  const [city, setCity] = useState(prefill?.city ?? "");
  const [district, setDistrict] = useState(prefill?.district ?? "");
  const [address, setAddress] = useState(prefill?.address ?? "");
  const [postalCode, setPostalCode] = useState(prefill?.postalCode ?? "");
  const [notes, setNotes] = useState("");

  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [billingFullName, setBillingFullName] = useState("");
  const [billingTaxId, setBillingTaxId] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingDistrict, setBillingDistrict] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");

  const defaultMethod: "card" | "transfer" = cardEnabled ? "card" : "transfer";
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">(defaultMethod);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPreliminary, setAcceptedPreliminary] = useState(false);
  const [modalType, setModalType] = useState<"mesafeli" | "onbilgi" | null>(null);

  // ── Kupon ────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // ── Sunucudan gelen sepet özeti (tek doğru kaynak) ───────
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryPending, startSummaryTransition] = useTransition();

  // ── Gönderim durumu ──────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Kart ödeme adımı ─────────────────────────────────────
  const [payment, setPayment] = useState<{
    iframeUrl: string;
    orderNumber: string;
    accessToken: string;
  } | null>(null);

  // Sunucuya gidecek TEK sepet verisi: ürün kimliği + varyant + adet.
  const serverItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      })),
    [items]
  );

  // Etkiyi tetiklemek için sabit bir anahtar (dizi kimliği her render'da değişir).
  const cartKey = useMemo(
    () =>
      serverItems
        .map((item) => `${item.productId}:${item.variantId ?? ""}:${item.quantity}`)
        .sort()
        .join("|"),
    [serverItems]
  );

  const refreshSummary = useCallback(() => {
    // Sepet boşsa istek atmaya gerek yok; bu durumda boş sepet ekranı çizilir.
    if (serverItems.length === 0) return;

    startSummaryTransition(async () => {
      const result = await getCartSummary(serverItems, appliedCoupon);
      if (result.ok) {
        setSummary(result);
        setSummaryError(null);
        // Kupon sunucuda reddedildiyse uygulanmış sayma.
        if (result.couponError) setAppliedCoupon(null);
      } else {
        setSummary(null);
        setSummaryError(result.error);
      }
    });
    // serverItems yerine cartKey'e bağlıyız; içerik aynıysa yeniden istek atma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, appliedCoupon]);

  useEffect(() => {
    if (!hydrated) return;
    refreshSummary();
  }, [hydrated, refreshSummary]);

  // ── Girdi temizleyiciler ─────────────────────────────────
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let digits = event.target.value.replace(/\D/g, "");
    if (digits.startsWith("90") && digits.length > 11) digits = digits.slice(2);
    setPhone(digits.slice(0, 11));
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    setter(event.target.value.replace(/[0-9]/g, ""));
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  // ── Sipariş gönderimi ────────────────────────────────────
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (serverItems.length === 0) {
      setFormError("Sepetiniz boş.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await placeOrder({
        items: serverItems,
        couponCode: appliedCoupon,
        paymentMethod,
        email,
        phone,
        firstName,
        lastName,
        city,
        district,
        address,
        postalCode,
        notes,
        billingSameAsShipping: sameAsDelivery,
        billingFullName,
        billingTaxId,
        billingCompany,
        billingAddress,
        billingCity,
        billingDistrict,
        billingPostalCode,
        acceptedTerms,
        acceptedPreliminary,
      });

      if (!result.ok) {
        setFormError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        // Stok/fiyat değiştiyse özeti tazele.
        if (["OUT_OF_STOCK", "PRODUCT_UNAVAILABLE", "INVALID_COUPON"].includes(result.code)) {
          refreshSummary();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (result.paymentMethod === "transfer") {
        // Havale: sipariş alındı, ödeme bekleniyor.
        clearCart();
        window.location.href = `/siparis/${result.orderNumber}?token=${encodeURIComponent(
          result.accessToken
        )}`;
        return;
      }

      if (result.paymentIframeUrl) {
        setPayment({
          iframeUrl: result.paymentIframeUrl,
          orderNumber: result.orderNumber,
          accessToken: result.accessToken,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error(error);
      setFormError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hidrasyon uyuşmazlığını önlemek için sepet yüklenene kadar bekle.
  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-gray-100)",
        }}
      >
        <Loader2 size={32} className="spin" color="var(--color-gray-400)" />
      </div>
    );
  }

  if (items.length === 0 && !payment) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-gray-100)",
        }}
      >
        <ShoppingBag size={64} color="var(--color-gray-400)" style={{ marginBottom: "20px" }} />
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            color: "var(--color-black)",
            marginBottom: "12px",
          }}
        >
          Sepetiniz Boş
        </h1>
        <p style={{ color: "var(--color-gray-600)", marginBottom: "24px" }}>
          Ödeme yapabilmek için sepetinize ürün eklemelisiniz.
        </p>
        <Link
          href="/urunler"
          style={{
            background: "var(--color-green)",
            color: "var(--color-white)",
            padding: "12px 32px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  // ── Kart ödeme adımı ─────────────────────────────────────
  if (payment) {
    return (
      <PayTRPaymentStep
        iframeUrl={payment.iframeUrl}
        orderNumber={payment.orderNumber}
        total={summary?.total ?? 0}
        onBack={() => setPayment(null)}
      />
    );
  }

  return (
    <div style={{ background: "var(--color-gray-100)", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container">
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            color: "var(--color-gray-500)",
            marginBottom: "32px",
          }}
        >
          <Link href="/sepet" style={{ color: "var(--color-gray-500)", textDecoration: "none" }}>
            Sepet
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--color-black)", fontWeight: 600 }}>Ödeme ve Adres</span>
        </div>

        {formError && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "16px 20px",
              borderRadius: "8px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            <AlertCircle size={18} /> {formError}
          </div>
        )}

        {/* Doğrulanmamış üye e-postası — siparişi engellemez, yalnızca ister. */}
        {unverifiedEmail && <EmailVerificationNotice email={unverifiedEmail} />}

        <form onSubmit={handleSubmit}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}
            className="checkout-grid"
          >
            {/* ══════════ SOL: FORM ══════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* 1. İletişim */}
              <section style={sectionStyle}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    marginBottom: "20px",
                  }}
                >
                  1. İletişim Bilgileri
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="email">
                      E-posta Adresi *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ornek@mail.com"
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.email} />
                    <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)" }}>
                      Sipariş takip bağlantınız bu adrese gönderilir.
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="phone">
                      Cep Telefonu *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="05550000000"
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.phone} />
                  </div>
                </div>
              </section>

              {/* 2. Teslimat Adresi */}
              <section style={sectionStyle}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    marginBottom: "20px",
                  }}
                >
                  2. Teslimat Adresi
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="firstName">
                      Ad *
                    </label>
                    <input
                      id="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => handleNameChange(event, setFirstName)}
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.firstName} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="lastName">
                      Soyad *
                    </label>
                    <input
                      id="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => handleNameChange(event, setLastName)}
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.lastName} />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 140px",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="city">
                      İl *
                    </label>
                    <select
                      id="city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      style={{ ...inputStyle, background: "var(--color-white)" }}
                    >
                      <option value="">Seçiniz</option>
                      {TURKIYE_ILLERI.map((il) => (
                        <option key={il} value={il}>
                          {il}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.city} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="district">
                      İlçe *
                    </label>
                    <input
                      id="district"
                      autoComplete="address-level2"
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.district} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="postalCode">
                      Posta Kodu
                    </label>
                    <input
                      id="postalCode"
                      inputMode="numeric"
                      value={postalCode}
                      onChange={(event) =>
                        setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))
                      }
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.postalCode} />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginBottom: "16px",
                  }}
                >
                  <label style={labelStyle} htmlFor="address">
                    Açık Adres (Mahalle, Sokak, No) *
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                  <FieldError message={fieldErrors.address} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle} htmlFor="notes">
                    Sipariş Notu (opsiyonel)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    maxLength={500}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Teslimat için eklemek istedikleriniz…"
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </section>

              {/* 3. Fatura Bilgileri */}
              <section style={sectionStyle}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    marginBottom: "20px",
                  }}
                >
                  3. Fatura Bilgileri
                </h2>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={(event) => setSameAsDelivery(event.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--color-green)" }}
                  />
                  <span style={{ fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
                    Fatura bilgilerim teslimat adresim ile aynı
                  </span>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="billingTaxId">
                      TC Kimlik / Vergi No
                    </label>
                    <input
                      id="billingTaxId"
                      inputMode="numeric"
                      value={billingTaxId}
                      onChange={(event) =>
                        setBillingTaxId(event.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      style={inputStyle}
                    />
                    <FieldError message={fieldErrors.billingTaxId} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle} htmlFor="billingCompany">
                      Şirket Adı (opsiyonel)
                    </label>
                    <input
                      id="billingCompany"
                      value={billingCompany}
                      onChange={(event) => setBillingCompany(event.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {!sameAsDelivery && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px dashed var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={labelStyle} htmlFor="billingFullName">
                        Fatura Adı Soyadı / Unvan *
                      </label>
                      <input
                        id="billingFullName"
                        value={billingFullName}
                        onChange={(event) => setBillingFullName(event.target.value)}
                        style={inputStyle}
                      />
                      <FieldError message={fieldErrors.billingFullName} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={labelStyle} htmlFor="billingCity">
                        İl *
                      </label>
                      <select
                        id="billingCity"
                        value={billingCity}
                        onChange={(event) => setBillingCity(event.target.value)}
                        style={{ ...inputStyle, background: "var(--color-white)" }}
                      >
                        <option value="">Seçiniz</option>
                        {TURKIYE_ILLERI.map((il) => (
                          <option key={il} value={il}>
                            {il}
                          </option>
                        ))}
                      </select>
                      <FieldError message={fieldErrors.billingCity} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={labelStyle} htmlFor="billingDistrict">
                        İlçe *
                      </label>
                      <input
                        id="billingDistrict"
                        value={billingDistrict}
                        onChange={(event) => setBillingDistrict(event.target.value)}
                        style={inputStyle}
                      />
                      <FieldError message={fieldErrors.billingDistrict} />
                    </div>
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label style={labelStyle} htmlFor="billingAddress">
                        Fatura Adresi *
                      </label>
                      <textarea
                        id="billingAddress"
                        rows={2}
                        value={billingAddress}
                        onChange={(event) => setBillingAddress(event.target.value)}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                      <FieldError message={fieldErrors.billingAddress} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={labelStyle} htmlFor="billingPostalCode">
                        Posta Kodu
                      </label>
                      <input
                        id="billingPostalCode"
                        inputMode="numeric"
                        value={billingPostalCode}
                        onChange={(event) =>
                          setBillingPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* 4. Ödeme Yöntemi */}
              <section style={sectionStyle}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    marginBottom: "20px",
                  }}
                >
                  4. Ödeme Yöntemi
                </h2>

                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  {cardEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      style={{
                        flex: 1,
                        border: `2px solid ${
                          paymentMethod === "card" ? "var(--color-green)" : "var(--color-border)"
                        }`,
                        borderRadius: "8px",
                        padding: "20px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        background:
                          paymentMethod === "card" ? "rgba(47,79,47,0.03)" : "transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      <CreditCard
                        size={28}
                        color={
                          paymentMethod === "card"
                            ? "var(--color-green)"
                            : "var(--color-gray-400)"
                        }
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color:
                            paymentMethod === "card"
                              ? "var(--color-black)"
                              : "var(--color-gray-500)",
                        }}
                      >
                        Kredi / Banka Kartı
                      </span>
                    </button>
                  )}

                  {transferEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      style={{
                        flex: 1,
                        border: `2px solid ${
                          paymentMethod === "transfer"
                            ? "var(--color-green)"
                            : "var(--color-border)"
                        }`,
                        borderRadius: "8px",
                        padding: "20px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        background:
                          paymentMethod === "transfer" ? "rgba(47,79,47,0.03)" : "transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      <Landmark
                        size={28}
                        color={
                          paymentMethod === "transfer"
                            ? "var(--color-green)"
                            : "var(--color-gray-400)"
                        }
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color:
                            paymentMethod === "transfer"
                              ? "var(--color-black)"
                              : "var(--color-gray-500)",
                        }}
                      >
                        Havale / EFT
                      </span>
                    </button>
                  )}
                </div>

                {paymentMethod === "card" ? (
                  <div
                    style={{
                      background: "var(--color-gray-100)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "20px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <Lock size={20} color="var(--color-green)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: 1.6 }}>
                      <strong style={{ color: "var(--color-black)" }}>
                        Kart bilgileriniz bu sayfada istenmez.
                      </strong>
                      <br />
                      Siparişinizi onayladıktan sonra, kart bilgilerinizi doğrudan ödeme
                      kuruluşunun (PayTR) güvenli formuna gireceksiniz. Kart numaranız bizim
                      sunucularımıza hiçbir zaman ulaşmaz.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "var(--color-cream)",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-gold)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--color-black)",
                        marginBottom: "12px",
                      }}
                    >
                      Banka Hesap Bilgilerimiz
                    </h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-gray-600)",
                        lineHeight: 1.6,
                        marginBottom: "8px",
                      }}
                    >
                      <strong>Banka:</strong> {bank.name}
                      <br />
                      <strong>Alıcı:</strong> {bank.accountHolder}
                      <br />
                      <strong>IBAN:</strong> {bank.iban}
                    </p>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-gray-500)",
                        marginTop: "12px",
                        padding: "10px",
                        background: "rgba(212,175,55,0.1)",
                        borderRadius: "4px",
                      }}
                    >
                      Siparişi tamamladıktan sonra açıklama kısmına{" "}
                      <strong>Sipariş Numaranızı</strong> yazarak transferi gerçekleştiriniz.
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ══════════ SAĞ: SİPARİŞ ÖZETİ ══════════ */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "sticky",
                  top: "100px",
                  background: "var(--color-white)",
                  padding: "32px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Sipariş Özeti
                  {summaryPending && (
                    <Loader2 size={16} className="spin" color="var(--color-gray-400)" />
                  )}
                </h2>

                {summaryError && (
                  <div
                    style={{
                      background: "#FEE2E2",
                      color: "#991B1B",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      marginBottom: "16px",
                    }}
                  >
                    {summaryError}
                  </div>
                )}

                {/* Ürün listesi — sunucudan doğrulanmış hâliyle */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    marginBottom: "24px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  {summary?.lines.map((line) => (
                    <div key={`${line.productId}-${line.variantId ?? ""}`} style={{ display: "flex", gap: "12px" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          background: "var(--color-cream)",
                          borderRadius: "6px",
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={line.imageUrl}
                          alt={line.name}
                          fill
                          sizes="60px"
                          style={{ objectFit: "contain", padding: "4px" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            background: "var(--color-gray-500)",
                            color: "white",
                            fontSize: "0.65rem",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {line.quantity}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--color-black)",
                            lineHeight: 1.2,
                            marginBottom: "4px",
                          }}
                        >
                          {line.name}
                        </div>
                        {(line.variantLabel || line.volume) && (
                          <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
                            {line.variantLabel || `${line.volume}ml`}
                          </div>
                        )}
                        {line.stock < line.quantity && (
                          <div style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>
                            Yalnızca {line.stock} adet kaldı
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "var(--color-black)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPrice(line.lineTotal)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kupon */}
                <div style={{ marginBottom: "20px" }}>
                  {summary?.coupon ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(47,79,47,0.06)",
                        border: "1px solid var(--color-green)",
                        borderRadius: "6px",
                        padding: "10px 12px",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--color-green)",
                        }}
                      >
                        <Tag size={14} /> {summary.coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-gray-500)",
                          display: "flex",
                        }}
                        aria-label="Kuponu kaldır"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                        placeholder="İndirim kodu"
                        style={{ ...inputStyle, padding: "10px 12px", fontSize: "0.85rem" }}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={summaryPending}
                        style={{
                          padding: "0 18px",
                          background: "var(--color-black)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        Uygula
                      </button>
                    </div>
                  )}
                  {summary?.couponError && (
                    <div style={{ fontSize: "0.75rem", color: "#DC2626", marginTop: "6px" }}>
                      {summary.couponError}
                    </div>
                  )}
                </div>

                {/* Tutarlar — tamamı sunucu hesabı */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    borderBottom: "1px solid var(--color-border)",
                    padding: "16px 0",
                    marginBottom: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                      color: "var(--color-gray-600)",
                    }}
                  >
                    <span>Ara Toplam</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(summary?.subtotal ?? 0)}</span>
                  </div>

                  {(summary?.discount ?? 0) > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                        color: "var(--color-green)",
                        fontWeight: 600,
                      }}
                    >
                      <span>İndirim</span>
                      <span>-{formatPrice(summary?.discount ?? 0)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                      color: "var(--color-gray-600)",
                    }}
                  >
                    <span>Kargo</span>
                    <span
                      style={{
                        fontWeight: 500,
                        color: summary?.shipping === 0 ? "var(--color-green)" : "inherit",
                      }}
                    >
                      {summary?.shipping === 0 ? "Ücretsiz" : formatPrice(summary?.shipping ?? 0)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-black)" }}>
                    Toplam
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.8rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                    }}
                  >
                    {formatPrice(summary?.total ?? 0)}
                  </span>
                </div>

                {/* Sözleşme onayları */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={acceptedPreliminary}
                      onChange={(event) => setAcceptedPreliminary(event.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        marginTop: "2px",
                        accentColor: "var(--color-green)",
                      }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>
                      <button
                        type="button"
                        onClick={() => setModalType("onbilgi")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-black)",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        Ön Bilgilendirme Formu
                      </button>
                      &apos;nu okudum ve onaylıyorum. *
                    </span>
                  </label>
                  <FieldError message={fieldErrors.acceptedPreliminary} />

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        marginTop: "2px",
                        accentColor: "var(--color-green)",
                      }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", lineHeight: 1.5 }}>
                      <button
                        type="button"
                        onClick={() => setModalType("mesafeli")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-black)",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        Mesafeli Satış Sözleşmesi
                      </button>
                      &apos;ni okudum ve onaylıyorum. *
                    </span>
                  </label>
                  <FieldError message={fieldErrors.acceptedTerms} />
                </div>

                <button
                  type="submit"
                  disabled={submitting || summaryPending || !summary}
                  style={{
                    width: "100%",
                    background:
                      submitting || !summary ? "var(--color-gray-400)" : "var(--color-green)",
                    color: "var(--color-white)",
                    border: "none",
                    padding: "16px",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    cursor: submitting || !summary ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spin" /> İşleniyor…
                    </>
                  ) : paymentMethod === "card" ? (
                    <>
                      <ChevronRight size={18} /> Ödeme Adımına Geç
                    </>
                  ) : (
                    <>
                      <Check size={18} /> Siparişi Onayla
                    </>
                  )}
                </button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "16px",
                    fontSize: "0.75rem",
                    color: "var(--color-gray-400)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Lock size={12} /> 256-bit SSL ile güvenli ödeme
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden; }
          #printable-modal, #printable-modal * { visibility: visible; }
          #printable-modal { position: absolute; left: 0; top: 0; width: 100%; height: auto; overflow: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {modalType && (
        <ContractModal
          type={modalType}
          store={store}
          onClose={() => setModalType(null)}
          onAccept={() => {
            if (modalType === "mesafeli") setAcceptedTerms(true);
            if (modalType === "onbilgi") setAcceptedPreliminary(true);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}

/** Mesafeli satış / ön bilgilendirme metinleri. */
function ContractModal({
  type,
  store,
  onClose,
  onAccept,
}: {
  type: "mesafeli" | "onbilgi";
  store: Props["store"];
  onClose: () => void;
  onAccept: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        id="printable-modal"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "white",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        <div
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
            {type === "mesafeli" ? "Mesafeli Satış Sözleşmesi" : "Ön Bilgilendirme Formu"}
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-gold)",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--color-gold-dark)",
                fontWeight: 500,
              }}
            >
              <Printer size={16} /> İndir / Yazdır
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-500)" }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            color: "var(--color-gray-700)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          {type === "mesafeli" ? (
            <div>
              <h4 style={{ color: "black", marginBottom: "12px" }}>MADDE 1 – TARAFLAR</h4>
              <p style={{ marginBottom: "16px" }}>
                <strong>SATICI:</strong> {store.name}
                <br />
                Adres: {store.address}
                <br />
                Telefon: {store.phone} &nbsp;|&nbsp; E-posta: {store.email}
                <br />
                Vergi Dairesi: {store.taxOffice} &nbsp;|&nbsp; Vergi No: {store.taxNumber}
              </p>
              <p style={{ marginBottom: "16px" }}>
                <strong>ALICI:</strong> İşbu sözleşmeyi dijital ortamda onaylayan müşteri.
                Sipariş formunda girilen ad, adres ve iletişim bilgileri esas alınır.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>MADDE 2 – KONU</h4>
              <p style={{ marginBottom: "16px" }}>
                İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait internet sitesinden
                elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sipariş
                özetinde belirtilen ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı
                Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
                hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>MADDE 3 – TESLİMAT</h4>
              <p style={{ marginBottom: "16px" }}>
                Sipariş edilen ürünler, yasal 30 günlük süreyi aşmamak kaydıyla ALICI&apos;nın
                bildirdiği teslimat adresine kargo firması aracılığıyla teslim edilir. Kargo
                ücreti sipariş özetinde ayrıca gösterilir.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>MADDE 4 – CAYMA HAKKI</h4>
              <p style={{ marginBottom: "16px" }}>
                ALICI, ürünün kendisine veya gösterdiği adresteki kişiye tesliminden itibaren
                14 (on dört) gün içinde hiçbir gerekçe göstermeksizin ve cezai şart
                ödemeksizin sözleşmeden cayma hakkına sahiptir.
              </p>
              <p style={{ marginBottom: "16px" }}>
                <strong>Cayma hakkının istisnası:</strong> Mesafeli Sözleşmeler Yönetmeliği
                md. 15/1-(ç) uyarınca, tesliminden sonra ambalaj, bant, mühür ve paket gibi
                koruyucu unsurları açılmış olan gıda ürünlerinin iadesi sağlık ve hijyen
                kuralları gereği mümkün değildir. Ambalajı açılmamış ürünler iade edilebilir.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>MADDE 5 – UYUŞMAZLIK</h4>
              <p style={{ marginBottom: "16px" }}>
                Uyuşmazlık hâlinde, Ticaret Bakanlığı&apos;nca ilan edilen parasal sınırlar
                dâhilinde ALICI&apos;nın yerleşim yerindeki Tüketici Hakem Heyetleri ve
                Tüketici Mahkemeleri yetkilidir.
              </p>

              <p
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "var(--color-gray-100)",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                }}
              >
                <strong>Not:</strong> Bu metin genel bir şablondur. Yayına almadan önce
                şirketinizin gerçek ticari bilgileriyle güncelleyip bir hukuk danışmanına
                kontrol ettirmeniz gerekir.
              </p>
            </div>
          ) : (
            <div>
              <h4 style={{ color: "black", marginBottom: "12px" }}>1. SATICI BİLGİLERİ</h4>
              <p style={{ marginBottom: "16px" }}>
                Unvan: {store.name}
                <br />
                Adres: {store.address}
                <br />
                Telefon: {store.phone}
                <br />
                E-posta: {store.email}
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>2. ÜRÜN VE ÖDEME</h4>
              <p style={{ marginBottom: "16px" }}>
                Sipariş edilen ürünlerin temel nitelikleri, tüm vergiler dâhil satış fiyatı,
                kargo bedeli ve varsa indirim tutarı sipariş özetinde ayrı ayrı gösterilmiştir.
                Ödeme, kredi/banka kartı ile (ödeme kuruluşu üzerinden) veya banka havalesi ile
                yapılabilir.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>3. TESLİMAT</h4>
              <p style={{ marginBottom: "16px" }}>
                Ürünler en geç 30 gün içerisinde bildirilen adrese kargo ile teslim edilir.
                Kargo takip bilgisi, sipariş kargoya verildiğinde e-posta ile paylaşılır.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>4. CAYMA HAKKI</h4>
              <p style={{ marginBottom: "16px" }}>
                Teslimden itibaren 14 gün içinde cayma hakkı kullanılabilir. Ambalajı açılmış
                gıda ürünleri hijyen gereği bu hakkın kapsamı dışındadır.
              </p>

              <h4 style={{ color: "black", marginBottom: "12px" }}>5. ŞİKÂYET VE İTİRAZ</h4>
              <p style={{ marginBottom: "16px" }}>
                Talep ve şikâyetlerinizi {store.email} adresine veya {store.phone} numarasına
                iletebilirsiniz. Ayrıca Tüketici Hakem Heyeti ve Tüketici Mahkemeleri&apos;ne
                başvurma hakkınız saklıdır.
              </p>

              <p
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "var(--color-gray-100)",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                }}
              >
                <strong>Not:</strong> Bu metin genel bir şablondur. Yayına almadan önce gerçek
                ticari bilgilerinizle güncelleyip hukuk danışmanınıza kontrol ettirin.
              </p>
            </div>
          )}
        </div>

        <div
          className="no-print"
          style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onAccept}
            style={{
              background: "var(--color-green)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Okudum, Onaylıyorum
          </button>
        </div>
      </div>
    </div>
  );
}
