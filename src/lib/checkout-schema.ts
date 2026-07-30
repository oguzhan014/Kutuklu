import { z } from "zod";

/**
 * Ödeme formu doğrulama şeması.
 * Hem istemcide (anlık geri bildirim) hem SUNUCUDA (asıl güvenlik sınırı)
 * kullanılır. İstemci doğrulaması yalnızca kullanıcı deneyimi içindir;
 * sunucu her zaman yeniden doğrular.
 */

/** Türkiye cep telefonunu 10 haneli (5XXXXXXXXX) biçime normalize eder. */
export function normalizePhone(raw: string): string {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

const nameField = z
  .string()
  .trim()
  .min(2, "En az 2 karakter olmalı")
  .max(50, "En fazla 50 karakter olabilir")
  .regex(
    /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]+$/,
    "Yalnızca harf kullanılabilir"
  );

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((v) => /^5\d{9}$/.test(v), {
    message: "Geçerli bir cep telefonu girin (örn. 0555 000 00 00)",
  });

export const cartLineSchema = z.object({
  productId: z.string().min(1).max(100),
  // Yalnızca varyasyonlu ürünlerde gereklidir; sunucuda ürünün gerçek
  // varyant listesiyle doğrulanır (bkz. pricing.ts).
  variantId: z.string().min(1).max(100).nullable().optional(),
  quantity: z.number().int().min(1).max(100),
});

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Sepetiniz boş.").max(50),

  couponCode: z
    .string()
    .trim()
    .max(50)
    .transform((v) => (v === "" ? null : v.toUpperCase()))
    .nullable()
    .optional(),

  paymentMethod: z.enum(["card", "transfer"]),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin")
    .max(255),

  phone: phoneSchema,
  firstName: nameField,
  lastName: nameField,

  city: z.string().trim().min(2, "İl seçin").max(50),
  district: z.string().trim().min(2, "İlçe girin").max(60),
  address: z
    .string()
    .trim()
    .min(10, "Açık adres en az 10 karakter olmalı")
    .max(500),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Posta kodu 5 haneli olmalı")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  notes: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),

  billingSameAsShipping: z.boolean(),
  billingFullName: z.string().trim().max(120).optional().or(z.literal("").transform(() => undefined)),
  billingTaxId: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "TC Kimlik (11) veya Vergi No (10) haneli olmalı")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  billingCompany: z.string().trim().max(150).optional().or(z.literal("").transform(() => undefined)),
  billingAddress: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  billingCity: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  billingDistrict: z.string().trim().max(60).optional().or(z.literal("").transform(() => undefined)),
  billingPostalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Posta kodu 5 haneli olmalı")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  // Sözleşme onayları — yasal olarak zorunlu.
  acceptedTerms: z.literal(true, {
    message: "Mesafeli Satış Sözleşmesi'ni onaylamalısınız.",
  }),
  acceptedPreliminary: z.literal(true, {
    message: "Ön Bilgilendirme Formu'nu onaylamalısınız.",
  }),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

/** Fatura adresi ayrıysa alanların doldurulmuş olmasını zorunlu kılar. */
export const checkoutSchemaWithBilling = checkoutSchema.superRefine((data, ctx) => {
  if (data.billingSameAsShipping) return;

  const required: [keyof CheckoutData, string][] = [
    ["billingFullName", "Fatura adı zorunlu"],
    ["billingAddress", "Fatura adresi zorunlu"],
    ["billingCity", "Fatura ili zorunlu"],
    ["billingDistrict", "Fatura ilçesi zorunlu"],
  ];

  for (const [field, message] of required) {
    if (!data[field]) {
      ctx.addIssue({ code: "custom", path: [field], message });
    }
  }
});
