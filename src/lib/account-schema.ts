import { z } from "zod";
import { normalizePhone } from "@/lib/checkout-schema";
import { TURKIYE_ILLERI } from "@/lib/turkiye-iller";

/** Hesap işlemleri için paylaşılan doğrulama şemaları. */

export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(200, "Şifre çok uzun")
  .regex(/[a-zA-ZğüşıöçĞÜŞİÖÇ]/, "Şifre en az bir harf içermeli")
  .regex(/\d/, "Şifre en az bir rakam içermeli");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ad soyad en az 2 karakter olmalı")
      .max(80, "Ad soyad çok uzun"),
    email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(255),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((value) => value === "" || /^5\d{9}$/.test(value), {
        message: "Geçerli bir cep telefonu girin",
      })
      .optional(),
    password: passwordSchema,
    passwordConfirm: z.string(),
    acceptedTerms: z.literal(true, {
      message: "Üyelik sözleşmesini onaylamalısınız.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı").max(80),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((value) => value === "" || /^5\d{9}$/.test(value), {
      message: "Geçerli bir cep telefonu girin",
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin").max(200),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Yeni şifreler eşleşmiyor",
    path: ["newPasswordConfirm"],
  });

export const addressSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(2, "Adres başlığı girin (Ev, İş…)").max(40),
  fullName: z.string().trim().min(2, "Ad soyad girin").max(80),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((value) => /^5\d{9}$/.test(value), {
      message: "Geçerli bir cep telefonu girin",
    }),
  city: z
    .string()
    .trim()
    .refine((value) => (TURKIYE_ILLERI as readonly string[]).includes(value), {
      message: "Geçerli bir il seçin",
    }),
  district: z.string().trim().min(2, "İlçe girin").max(60),
  address: z.string().trim().min(10, "Açık adres en az 10 karakter olmalı").max(500),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Posta kodu 5 haneli olmalı")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isDefault: z.boolean().optional(),
});

/** Misafir sipariş sorgulama: sipariş numarası + e-posta eşleşmeli. */
export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().min(4, "Sipariş numarası girin").max(64),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(255),
});

/**
 * Hesap silme onayı.
 *
 * Geri dönüşü olmayan bir işlem olduğu için hem şifre hem de elle yazılan
 * bir onay ifadesi istenir; yanlışlıkla tıklamayla hesap silinemez.
 */
export const DELETE_ACCOUNT_PHRASE = "HESABIMI SIL";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Şifrenizi girin").max(200),
  confirmation: z
    .string()
    .trim()
    .refine((value) => value.toLocaleUpperCase("tr-TR") === DELETE_ACCOUNT_PHRASE, {
      message: `Onaylamak için "${DELETE_ACCOUNT_PHRASE}" yazın`,
    }),
});
