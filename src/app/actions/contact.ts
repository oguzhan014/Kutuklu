"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { limitByIp } from "@/lib/rate-limit";

/**
 * E-bülten aboneliği ve iletişim formu.
 *
 * Her ikisi de kimlik doğrulaması gerektirmediği için spam'e açıktır;
 * bu yüzden IP bazlı hız sınırı ve katı girdi doğrulaması uygulanır.
 */

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(255),
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin").max(80),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(255),
  subject: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: z
    .string()
    .trim()
    .min(10, "Mesajınız en az 10 karakter olmalı")
    .max(3000, "Mesajınız en fazla 3000 karakter olabilir"),
});

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function subscribeNewsletter(rawInput: unknown): Promise<ContactResult> {
  const limit = await limitByIp("newsletter", 5, 60 * 60_000);
  if (!limit.ok) {
    return { ok: false, error: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin." };
  }

  const parsed = newsletterSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Geçerli bir e-posta adresi girin.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true },
      create: { email: parsed.data.email },
    });
  } catch (error) {
    console.error("[subscribeNewsletter] hata:", error);
    return { ok: false, error: "Kayıt tamamlanamadı. Lütfen tekrar deneyin." };
  }

  // Zaten kayıtlı olsa bile aynı mesaj döner: bir e-postanın listede olup
  // olmadığı bilgisi dışarıya sızdırılmaz.
  return {
    ok: true,
    message: "Teşekkürler! E-bülten aboneliğiniz oluşturuldu.",
  };
}

export async function sendContactMessage(rawInput: unknown): Promise<ContactResult> {
  const limit = await limitByIp("contact", 5, 60 * 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      error: "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const parsed = contactSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Lütfen formdaki hataları düzeltin.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
      },
    });
  } catch (error) {
    console.error("[sendContactMessage] hata:", error);
    return { ok: false, error: "Mesajınız gönderilemedi. Lütfen tekrar deneyin." };
  }

  return {
    ok: true,
    message: "Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.",
  };
}
