import { z } from "zod";

/** Admin ürün formu doğrulama şeması. */

const decimalString = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).replace(",", ".").trim());

const optionalPrice = decimalString
  .refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), {
    message: "Geçerli bir fiyat girin",
  })
  .transform((value) => (value === "" ? null : Number(value)))
  .nullable();

const requiredPrice = decimalString
  .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, {
    message: "Geçerli bir fiyat girin",
  })
  .transform((value) => Number(value));

const stockNumber = z
  .union([z.string(), z.number()])
  .transform((value) => Number(String(value).trim() === "" ? 0 : value))
  .refine((value) => Number.isInteger(value) && value >= 0 && value <= 1_000_000, {
    message: "Stok 0 ile 1.000.000 arasında bir tam sayı olmalı",
  });

/** Yüklenen görsel yolu yalnızca site içi olabilir (SSRF/XSS koruması). */
const imagePath = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value.startsWith("/"), {
    message: "Görsel yolu geçersiz",
  });

export const variantSchema = z.object({
  sku: z.string().trim().max(60).optional().or(z.literal("").transform(() => undefined)),
  price: requiredPrice,
  stock: stockNumber,
  attributes: z.record(z.string().max(60), z.string().max(120)),
});

export const attributeSchema = z.object({
  name: z.string().trim().min(1).max(60),
  options: z.array(z.string().trim().min(1).max(120)).max(50),
});

export const productSchema = z
  .object({
    id: z.string().max(100).optional(),
    name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı").max(150),
    shortDesc: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
    description: z.string().trim().max(8000).optional().or(z.literal("").transform(() => undefined)),
    categoryId: z.string().min(1, "Kategori seçin").max(100),
    isActive: z.boolean(),
    isFeatured: z.boolean().optional(),
    isOrganic: z.boolean().optional(),
    harvestType: z.enum(["STANDARD", "EARLY_HARVEST", "ORGANIC", "GOURMET"]),
    volume: z
      .union([z.string(), z.number()])
      .transform((value) => {
        const text = String(value).trim();
        return text === "" ? null : Number(text);
      })
      .refine((value) => value === null || (Number.isInteger(value) && value > 0 && value <= 100_000), {
        message: "Hacim geçerli bir sayı olmalı (ml)",
      })
      .nullable(),

    type: z.enum(["SIMPLE", "VARIABLE"]),

    price: optionalPrice,
    comparePrice: optionalPrice,
    sku: z.string().trim().max(60).optional().or(z.literal("").transform(() => undefined)),
    stock: stockNumber,

    attributes: z.array(attributeSchema).max(10).optional(),
    variants: z.array(variantSchema).max(100).optional(),

    primaryImage: imagePath.nullable().optional(),
    galleryImages: z.array(imagePath).max(8).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "SIMPLE") {
      if (data.price === null || data.price === undefined) {
        ctx.addIssue({ code: "custom", path: ["price"], message: "Fiyat zorunlu" });
      }
      if (
        data.comparePrice !== null &&
        data.comparePrice !== undefined &&
        data.price !== null &&
        data.comparePrice <= data.price
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["comparePrice"],
          message: "İndirimsiz fiyat, satış fiyatından büyük olmalı",
        });
      }
    } else if (!data.variants || data.variants.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Varyasyonlu üründe en az bir varyasyon tanımlayın",
      });
    }
  });

export type ProductInput = z.input<typeof productSchema>;

export const couponSchema = z
  .object({
    id: z.string().max(100).optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, "Kupon kodu en az 3 karakter olmalı")
      .max(50)
      .regex(/^[A-Z0-9_-]+$/, "Yalnızca harf, rakam, - ve _ kullanılabilir"),
    description: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: requiredPrice,
    minOrderAmount: optionalPrice,
    maxUses: z
      .union([z.string(), z.number()])
      .transform((value) => {
        const text = String(value).trim();
        return text === "" ? null : Number(text);
      })
      .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
        message: "Kullanım limiti pozitif tam sayı olmalı",
      })
      .nullable(),
    isActive: z.boolean(),
    expiresAt: z
      .string()
      .trim()
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENTAGE" && (data.value <= 0 || data.value > 100)) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Yüzde indirim 0 ile 100 arasında olmalı",
      });
    }
    if (data.type === "FIXED" && data.value <= 0) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "İndirim tutarı sıfırdan büyük olmalı" });
    }
  });

export const orderStatusSchema = z.object({
  orderId: z.string().min(1).max(100),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export const trackingSchema = z.object({
  orderId: z.string().min(1).max(100),
  shippingCarrier: z.string().trim().max(60).optional().or(z.literal("").transform(() => undefined)),
  trackingNumber: z.string().trim().max(80).optional().or(z.literal("").transform(() => undefined)),
});
