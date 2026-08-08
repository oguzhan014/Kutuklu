import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Kütüklü Zeytinyağı web sitesi kullanım koşulları.",
};

export default async function KullanimKosullariPage() {
  const settings = await getSettings();

  return (
    <LegalPage title="Kullanım Koşulları" updatedAt="29 Temmuz 2026">
      <h2>1. Genel Hükümler</h2>
      <p>
        Bu web sitesini (&quot;Site&quot;) kullanarak, {settings["store.name"]} tarafından
        işletilen bu Site&apos;nin aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız.
        Koşulları kabul etmiyorsanız Site&apos;yi kullanmamanızı rica ederiz.
      </p>

      <h2>2. Üyelik ve Hesap Güvenliği</h2>
      <p>
        Hesabınızla ilişkili şifrenin gizliliğinden siz sorumlusunuz. Hesabınız
        üzerinden gerçekleştirilen tüm işlemler size ait kabul edilir. Şifrenizin ele
        geçirildiğinden şüpheleniyorsanız derhal bizimle iletişime geçin ve şifrenizi
        değiştirin.
      </p>
      <p>Kayıt sırasında verdiğiniz bilgilerin doğru, güncel ve eksiksiz olmasından siz sorumlusunuz.</p>

      <h2>3. Ürünler ve Fiyatlandırma</h2>
      <p>
        Sitede yer alan ürün açıklamaları, görselleri ve fiyatları bilgilendirme
        amaçlıdır; önceden haber verilmeksizin değiştirilebilir. Bir siparişin
        onaylanması anındaki fiyat ve stok bilgisi geçerlidir. Teknik hata sonucu
        yanlış fiyat gösterilmesi durumunda sipariş iptal edilip ücret iade edilebilir.
      </p>

      <h2>4. Sipariş ve Ödeme</h2>
      <p>
        Sipariş, ödeme onaylandığında (kredi kartı ile ödendiğinde) veya havale/EFT
        bildirimi doğrulandığında kesinleşir. Kart bilgileriniz Site sunucularında
        saklanmaz; ödemeler PayTR altyapısı üzerinden güvenli şekilde işlenir.
      </p>

      <h2>5. Fikri Mülkiyet</h2>
      <p>
        Site&apos;deki tüm marka, logo, metin, görsel ve tasarım öğeleri {settings["store.name"]}&apos;e
        aittir veya lisanslı olarak kullanılmaktadır. Önceden yazılı izin alınmaksızın
        kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.
      </p>

      <h2>6. Kullanıcı İçerikleri</h2>
      <p>
        Ürünler hakkında paylaştığınız değerlendirme ve yorumlar, yayınlanmadan önce
        moderasyondan geçer. Hakaret, spam veya yanıltıcı içerik barındıran yorumlar
        yayınlanmaz veya kaldırılır. Yorum göndererek içeriğin doğruluğundan siz
        sorumlu olduğunuzu kabul edersiniz.
      </p>

      <h2>7. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Site, mevcut hâliyle sunulmaktadır. Sitenin kesintisiz veya hatasız
        çalışacağına dair garanti verilmez. {settings["store.name"]}, Site&apos;nin
        kullanımından doğabilecek dolaylı zararlardan sorumlu tutulamaz.
      </p>

      <h2>8. Değişiklikler</h2>
      <p>
        Bu kullanım koşulları zaman zaman güncellenebilir. Güncel metin her zaman bu
        sayfada yayınlanır ve yayınlandığı andan itibaren geçerli olur.
      </p>

      <h2>9. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
      <p>
        Bu koşullardan doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti kanunları
        uygulanır; {settings["store.address"]} adresindeki mahkeme ve icra daireleri
        yetkilidir.
      </p>

      <p style={{ fontStyle: "italic", color: "var(--color-gray-500)", fontSize: "0.82rem" }}>
        Bu metin genel bir bilgilendirme şablonudur; yayına almadan önce bir hukuk
        danışmanına kontrol ettirmeniz önerilir.
      </p>
    </LegalPage>
  );
}
