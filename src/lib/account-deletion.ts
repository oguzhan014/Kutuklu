import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * ─────────────────────────────────────────────────────────────
 * HESAP SİLME — ANONİMLEŞTİRME
 * ─────────────────────────────────────────────────────────────
 *
 * Kullanıcı kaydı fiziksel olarak SİLİNMEZ, anonimleştirilir. Sebebi:
 * siparişler ve faturalar ticari/vergisel belgedir ve yasal saklama süresi
 * boyunca korunmak zorundadır (VUK). KVKK'nın silme hakkı da bu tür bir
 * hukuki yükümlülüğün varlığında sınırlıdır.
 *
 * Bu yüzden:
 *   SİLİNİR     → oturumlar, OAuth bağlantıları, adresler, sepet, favoriler,
 *                 şifre sıfırlama ve e-posta doğrulama token'ları
 *   ANONİMLEŞİR → kullanıcının adı, e-postası, telefonu, şifresi; yorumları
 *   KORUNUR     → siparişler ve faturalar (yasal zorunluluk)
 *
 * Anonimleşen kaydın e-postası benzersiz bir yer tutucuyla değiştirilir;
 * böylece kişi isterse aynı e-postayla yeniden kayıt olabilir.
 *
 * `anonymizedAt` dolu olan kullanıcı giriş YAPAMAZ (bkz. auth yapılandırması).
 */

/** Anonimleştirilmiş kayıtlara verilen görünen ad. */
export const ANONYMIZED_NAME = "Silinmiş Kullanıcı";

/** Anonim e-postaların alan adı — gerçek bir posta kutusuna karşılık gelmez. */
const ANONYMIZED_DOMAIN = "deleted.invalid";

export type DeletionResult =
  | { ok: true; retainedOrders: number }
  | { ok: false; reason: "not_found" | "already_deleted" };

/**
 * Kullanıcı hesabını anonimleştirir.
 *
 * Tüm adımlar tek transaction içindedir: yarıda kalan bir silme, kişisel
 * verinin bir kısmının kalmasına yol açmaz.
 */
export async function anonymizeUserAccount(userId: string): Promise<DeletionResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, anonymizedAt: true },
    });

    if (!user) return { ok: false, reason: "not_found" as const };
    if (user.anonymizedAt) return { ok: false, reason: "already_deleted" as const };

    // Yasal olarak saklanacak sipariş sayısı (kullanıcıya bildirilir).
    const retainedOrders = await tx.order.count({ where: { userId } });

    // ── Tamamen silinen kişisel veriler ──
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.address.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.emailVerificationToken.deleteMany({ where: { userId } });

    // Sepet, satırlarıyla birlikte gider (CartItem'da cascade var).
    await tx.cart.deleteMany({ where: { userId } });

    // Yorumlar kişiye bağlıdır; hesapla birlikte kaldırılır.
    await tx.review.deleteMany({ where: { userId } });

    // Favoriler de kişisel veridir.
    await tx.favorite.deleteMany({ where: { userId } });

    // Kupon kullanım kayıtlarındaki kişisel bağ koparılır; kullanım hakkı
    // e-posta üzerinden korunmaya devam eder (yeni kayıtla limit sıfırlanmasın).
    await tx.couponRedemption.updateMany({
      where: { userId },
      data: { userId: null },
    });

    // ── Anonimleştirilen kayıt ──
    // Yer tutucu e-posta benzersiz olmalı: unique kısıt bozulmasın ve kişi
    // dilerse aynı adresle yeniden kayıt olabilsin.
    const placeholder = `deleted-${randomBytes(12).toString("hex")}@${ANONYMIZED_DOMAIN}`;

    await tx.user.update({
      where: { id: userId },
      data: {
        name: ANONYMIZED_NAME,
        email: placeholder,
        emailVerified: null,
        phone: null,
        password: null,
        image: null,
        anonymizedAt: new Date(),
      },
    });

    return { ok: true as const, retainedOrders };
  });
}
