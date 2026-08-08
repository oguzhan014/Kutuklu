/**
 * Transaksiyonel e-posta şablonları.
 *
 * E-posta istemcileri modern CSS'i desteklemez; bu yüzden basit, satır içi
 * (inline) stiller ve tablo tabanlı olmayan sade bir düzen kullanılır.
 */

const BRAND = {
  black: "#1C1C1C",
  cream: "#F5F1E8",
  gold: "#D4AF37",
  green: "#2F4F2F",
  grayText: "#5C5448",
  border: "#EDE9DF",
};

function wrapper(title: string, bodyHtml: string, siteUrl: string): string {
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${siteUrl}" style="text-decoration:none;color:${BRAND.black};font-size:1.4rem;font-weight:700;letter-spacing:0.02em;">
          🫒 Kütüklü
        </a>
      </div>

      <div style="background:#ffffff;border:1px solid ${BRAND.border};border-radius:12px;padding:32px;">
        ${bodyHtml}
      </div>

      <p style="text-align:center;color:#8A8070;font-size:0.75rem;margin-top:24px;line-height:1.6;">
        Bu e-posta Kütüklü Zeytinyağı sipariş sisteminden otomatik olarak gönderilmiştir.<br />
        Sorularınız için <a href="${siteUrl}/iletisim" style="color:${BRAND.green};">bize ulaşın</a>.
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function button(label: string, href: string): string {
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${href}" style="display:inline-block;background:${BRAND.green};color:#ffffff;text-decoration:none;font-weight:700;font-size:0.9rem;padding:14px 32px;border-radius:6px;">
      ${escapeHtml(label)}
    </a>
  </div>`;
}

export type EmailOrderLine = {
  name: string;
  quantity: number;
  totalLabel: string;
};

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  totalLabel: string;
  orderUrl: string;
  siteUrl: string;
  lines: EmailOrderLine[];
};

function lineItemsHtml(lines: EmailOrderLine[]): string {
  return lines
    .map(
      (line) => `
      <tr>
        <td style="padding:8px 0;font-size:0.88rem;color:${BRAND.black};">${escapeHtml(line.name)} × ${line.quantity}</td>
        <td style="padding:8px 0;font-size:0.88rem;color:${BRAND.black};text-align:right;white-space:nowrap;">${escapeHtml(line.totalLabel)}</td>
      </tr>`
    )
    .join("");
}

/** Havale/EFT ile verilen sipariş — ödeme bekleniyor. */
export function orderPendingTransferEmail(data: OrderEmailData & { bankName: string; bankIban: string; bankAccountHolder: string }) {
  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">Siparişiniz Alındı</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.customerName)}, <strong>${escapeHtml(data.orderNumber)}</strong> numaralı
      siparişiniz oluşturuldu. Aşağıdaki hesaba havale/EFT yaptığınızda siparişiniz hazırlanmaya başlanacak.
    </p>

    <div style="background:${BRAND.cream};border:1px solid ${BRAND.gold};border-radius:8px;padding:16px 18px;margin:20px 0;font-size:0.88rem;color:${BRAND.grayText};line-height:1.9;">
      <strong>Banka:</strong> ${escapeHtml(data.bankName)}<br/>
      <strong>Alıcı:</strong> ${escapeHtml(data.bankAccountHolder)}<br/>
      <strong>IBAN:</strong> ${escapeHtml(data.bankIban)}<br/>
      <strong>Tutar:</strong> ${escapeHtml(data.totalLabel)}
    </div>
    <p style="font-size:0.82rem;color:${BRAND.grayText};">
      Açıklama kısmına mutlaka <strong>${escapeHtml(data.orderNumber)}</strong> sipariş numaranızı yazınız.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid ${BRAND.border};padding-top:8px;">
      ${lineItemsHtml(data.lines)}
    </table>

    ${button("Siparişimi Görüntüle", data.orderUrl)}
  `;
  return wrapper(`Siparişiniz alındı — ${data.orderNumber}`, body, data.siteUrl);
}

/** Ödeme onaylandı — kart veya havale onayı sonrası. */
export function orderPaidEmail(data: OrderEmailData & { invoiceAttached?: boolean }) {
  const invoiceNote = data.invoiceAttached
    ? `<p style="font-size:0.88rem;color:${BRAND.grayText};line-height:1.7;margin-top:14px;">
         Siparişinizin <strong>faturası bu e-postaya PDF olarak eklenmiştir</strong>.
         Faturaya dilediğiniz zaman sipariş sayfanızdan da ulaşabilirsiniz.
       </p>`
    : "";

  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">Ödemeniz Onaylandı ✓</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.customerName)}, <strong>${escapeHtml(data.orderNumber)}</strong> numaralı
      siparişinizin ödemesi onaylandı ve hazırlanmaya başlandı. Kargoya verildiğinde ayrıca bilgilendirileceksiniz.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid ${BRAND.border};padding-top:8px;">
      ${lineItemsHtml(data.lines)}
    </table>

    <p style="font-size:0.95rem;color:${BRAND.black};font-weight:700;text-align:right;margin-top:12px;">
      Toplam: ${escapeHtml(data.totalLabel)}
    </p>

    ${invoiceNote}

    ${button("Siparişimi Görüntüle", data.orderUrl)}
  `;
  return wrapper(`Ödemeniz onaylandı — ${data.orderNumber}`, body, data.siteUrl);
}

/** Kargoya verildi. */
export function orderShippedEmail(
  data: OrderEmailData & { carrier: string; trackingNumber: string }
) {
  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">Siparişiniz Kargoda 🚚</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.customerName)}, <strong>${escapeHtml(data.orderNumber)}</strong> numaralı
      siparişiniz kargoya verildi.
    </p>

    <div style="background:${BRAND.cream};border-radius:8px;padding:16px 18px;margin:20px 0;font-size:0.88rem;color:${BRAND.grayText};line-height:1.9;">
      <strong>Kargo Firması:</strong> ${escapeHtml(data.carrier)}<br/>
      <strong>Takip No:</strong> ${escapeHtml(data.trackingNumber)}
    </div>

    ${button("Siparişimi Görüntüle", data.orderUrl)}
  `;
  return wrapper(`Siparişiniz kargoda — ${data.orderNumber}`, body, data.siteUrl);
}

/** İade edildi. */
export function orderRefundedEmail(data: OrderEmailData) {
  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">Ödemeniz İade Edildi</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.customerName)}, <strong>${escapeHtml(data.orderNumber)}</strong> numaralı
      siparişinizin ödemesi (${escapeHtml(data.totalLabel)}) iade edilmiştir. Tutar, ödeme yönteminize
      bağlı olarak birkaç iş günü içinde hesabınıza yansıyacaktır.
    </p>
    ${button("Sipariş Detayını Görüntüle", data.orderUrl)}
  `;
  return wrapper(`Ödemeniz iade edildi — ${data.orderNumber}`, body, data.siteUrl);
}

/** İptal edildi. */
export function orderCancelledEmail(data: OrderEmailData) {
  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">Siparişiniz İptal Edildi</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.customerName)}, <strong>${escapeHtml(data.orderNumber)}</strong> numaralı
      siparişiniz iptal edilmiştir. Tahsil edilmiş bir tutar varsa iade süreci başlatılmıştır ve
      birkaç iş günü içinde hesabınıza yansıyacaktır.
    </p>
    ${button("Sipariş Detayını Görüntüle", data.orderUrl)}
  `;
  return wrapper(`Siparişiniz iptal edildi — ${data.orderNumber}`, body, data.siteUrl);
}

/** Şifre sıfırlama bağlantısı. */
export function passwordResetEmail(data: { name: string; resetUrl: string; siteUrl: string }) {
  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">Şifre Sıfırlama</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.name)}, hesabınız için bir şifre sıfırlama talebi aldık.
      Aşağıdaki bağlantıya tıklayarak yeni bir şifre belirleyebilirsiniz. Bu bağlantı
      <strong>1 saat</strong> içinde geçerliliğini yitirir.
    </p>
    ${button("Şifremi Sıfırla", data.resetUrl)}
    <p style="font-size:0.8rem;color:#8A8070;margin-top:20px;line-height:1.6;">
      Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; hesabınızda herhangi bir
      değişiklik yapılmayacaktır.
    </p>
  `;
  return wrapper("Şifre Sıfırlama", body, data.siteUrl);
}

/** E-posta adresi doğrulama bağlantısı. */
export function emailVerificationEmail(data: {
  customerName: string;
  verifyUrl: string;
  siteUrl: string;
}) {
  const body = `
    <h1 style="font-size:1.3rem;color:${BRAND.black};margin:0 0 12px;">E-posta Adresinizi Doğrulayın</h1>
    <p style="font-size:0.92rem;color:${BRAND.grayText};line-height:1.7;">
      Merhaba ${escapeHtml(data.customerName)}, aşağıdaki bağlantıya tıklayarak e-posta
      adresinizi doğrulayabilirsiniz. Böylece sipariş onaylarınızın ve faturalarınızın
      size ulaşacağından emin oluruz. Bu bağlantı <strong>24 saat</strong> geçerlidir.
    </p>
    ${button("E-postamı Doğrula", data.verifyUrl)}
    <p style="font-size:0.8rem;color:#8A8070;margin-top:20px;line-height:1.6;">
      Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; hesabınızda herhangi bir
      değişiklik yapılmayacaktır.
    </p>
  `;
  return wrapper("E-posta Doğrulama", body, data.siteUrl);
}
