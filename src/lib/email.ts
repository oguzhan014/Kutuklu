import "server-only";
import { Resend } from "resend";

/**
 * E-posta gönderim altyapısı.
 *
 * Resend API anahtarı girilmemişse (henüz .env'de placeholder ise) e-posta
 * gönderilmez, sadece konsola loglanır. Sipariş/ödeme akışı e-posta
 * gönderiminin başarısına BAĞLI DEĞİLDİR — mail atılamasa bile sipariş
 * oluşturma, ödeme onayı gibi kritik işlemler durmaz.
 */

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return lower.includes("your_resend") || lower === "";
}

export function isEmailConfigured(): boolean {
  return !isPlaceholder(process.env.RESEND_API_KEY);
}

let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}

export function getFromAddress(): string {
  return process.env.EMAIL_FROM || "Kütüklü Zeytinyağı <onboarding@resend.dev>";
}

export type EmailAttachment = {
  filename: string;
  content: Buffer;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

/**
 * E-posta göndermeyi dener. Hata durumunda İSTİSNA FIRLATMAZ — yalnızca
 * konsola loglar ve `false` döner. Çağıran taraf sonucu isterse kullanır,
 * ama beklemek zorunda değildir.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!isEmailConfigured()) {
    const attachmentNote = input.attachments?.length
      ? ` (ek: ${input.attachments.map((a) => a.filename).join(", ")})`
      : "";
    console.info(
      `[email] gönderilmedi (yapılandırılmamış): "${input.subject}" → ${input.to}${attachmentNote}`
    );
    return false;
  }

  try {
    const result = await getClient().emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    });

    if (result.error) {
      console.error(`[email] gönderim hatası: ${input.subject} → ${input.to}`, result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[email] beklenmeyen hata: ${input.subject} → ${input.to}`, error);
    return false;
  }
}
