import { z } from "zod";

/** Admin kategori formu doğrulama şeması. */
export const categorySchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().trim().min(2, "Kategori adı en az 2 karakter olmalı").max(100),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  parentId: z
    .string()
    .max(100)
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  isActive: z.boolean(),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
    })
    .refine((value) => value >= 0 && value <= 100_000, {
      message: "Sıra 0 ile 100.000 arasında olmalı",
    }),
});

export type CategoryInput = z.input<typeof categorySchema>;
