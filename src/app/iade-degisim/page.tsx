import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "İade & Değişim",
  description: "Kütüklü Zeytinyağı iade ve cayma hakkı koşulları.",
};

export default async function IadeDegisimPage() {
  const settings = await getSettings();

  return (
    <LegalPage title="İade & Değişim Koşulları" updatedAt="29 Temmuz 2026">
      <h2>1. Cayma Hakkı</h2>
      <p>
        6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
        Yönetmeliği uyarınca, ürünün size veya gösterdiğiniz adresteki kişiye
        tesliminden itibaren <strong>14 (on dört) gün</strong> içinde hiçbir gerekçe
        göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahipsiniz.
      </p>

      <h2>2. Gıda Ürünlerinde Cayma Hakkının İstisnası</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-(ç) maddesi uyarınca, tesliminden
        sonra ambalajı, bandı, mührü veya benzer koruyucu unsuru açılmış olan gıda
        ürünlerinin iadesi sağlık ve hijyen kuralları gereği kabul edilemez.
        Zeytinyağlarımız bu kapsamdadır:
      </p>
      <ul>
        <li>
          <strong>Ambalajı hiç açılmamış</strong> ürünler, cayma hakkı süresi içinde
          iade edilebilir.
        </li>
        <li>
          <strong>Ambalajı/mührü açılmış</strong> ürünler, hijyen gerekçesiyle iade
          kapsamı dışındadır.
        </li>
      </ul>

      <h2>3. Hasarlı veya Hatalı Ürün</h2>
      <p>
        Sipariş ettiğiniz üründen farklı bir ürün gönderildiyse, ürün kargo sırasında
        hasar gördüyse veya son kullanma tarihi geçmiş bir ürün ulaştıysa; ambalaj
        açılmış olsa dahi ücretsiz iade/değişim hakkınız saklıdır. Böyle bir durumda
        teslim tarihinden itibaren en geç 3 gün içinde{" "}
        <a href={`mailto:${settings["store.email"]}`}>{settings["store.email"]}</a>{" "}
        adresine ürün fotoğrafı ve sipariş numaranızla birlikte bildirimde bulunun.
      </p>

      <h2>4. İade Süreci Nasıl İşler?</h2>
      <ul>
        <li>
          <strong>Sipariş Takibi</strong> sayfasından veya{" "}
          <a href="/hesabim/siparislerim">Hesabım → Siparişlerim</a> bölümünden ilgili
          siparişi bulun.
        </li>
        <li>
          {settings["store.email"]} adresine sipariş numaranızı ve iade sebebinizi
          belirterek yazın.
        </li>
        <li>
          Talebiniz değerlendirildikten sonra size kargo gönderim bilgisi iletilir.
        </li>
        <li>
          Ürün elimize ulaştıktan ve kontrol edildikten sonra, ödemenizin iadesi
          orijinal ödeme yönteminize (kredi kartı veya banka hesabınıza) en geç{" "}
          <strong>10 iş günü</strong> içinde yapılır.
        </li>
      </ul>

      <h2>5. İade Kargo Ücreti</h2>
      <p>
        Cayma hakkı kapsamında yapılan iadelerde kargo ücreti alıcıya aittir. Hasarlı,
        eksik veya hatalı ürün gönderimlerinde kargo ücreti tarafımızca karşılanır.
      </p>

      <h2>6. Sipariş İptali</h2>
      <p>
        Siparişiniz henüz kargoya verilmediyse, üye girişi yaparak{" "}
        <a href="/hesabim/siparislerim">Siparişlerim</a> sayfasından
        &quot;Beklemede&quot; durumundaki siparişinizi doğrudan iptal edebilirsiniz.
        Kargoya verilmiş siparişler için lütfen bizimle iletişime geçin.
      </p>

      <h2>7. İletişim</h2>
      <p>
        İade ve değişim talepleriniz için {settings["store.phone"]} numaralı telefondan
        veya <a href={`mailto:${settings["store.email"]}`}>{settings["store.email"]}</a>{" "}
        adresinden bize ulaşabilirsiniz.
      </p>

      <p style={{ fontStyle: "italic", color: "var(--color-gray-500)", fontSize: "0.82rem" }}>
        Bu metin genel bir bilgilendirme şablonudur; yayına almadan önce bir hukuk
        danışmanına kontrol ettirmeniz önerilir.
      </p>
    </LegalPage>
  );
}
