import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Kütüklü Zeytinyağı gizlilik politikası ve kişisel verilerin korunması.",
};

export default async function GizlilikPolitikasiPage() {
  const settings = await getSettings();

  return (
    <LegalPage title="Gizlilik Politikası ve KVKK Aydınlatma Metni" updatedAt="29 Temmuz 2026">
      <h2>1. Veri Sorumlusu</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel
        verileriniz veri sorumlusu sıfatıyla <strong>{settings["store.name"]}</strong>{" "}
        (&quot;Kütüklü&quot;, &quot;Şirket&quot;) tarafından aşağıda açıklanan kapsamda
        işlenebilecektir.
      </p>
      <p>
        Adres: {settings["store.address"]}
        <br />
        E-posta: {settings["store.email"]} · Telefon: {settings["store.phone"]}
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <p>Web sitemiz üzerinden aşağıdaki kişisel verileriniz işlenebilir:</p>
      <ul>
        <li>Kimlik bilgileri (ad, soyad)</li>
        <li>İletişim bilgileri (e-posta, telefon, adres)</li>
        <li>Sipariş ve işlem bilgileri (satın alınan ürünler, tutar, sipariş geçmişi)</li>
        <li>
          Ödeme bilgileri — kart numaranız hiçbir zaman bizim sunucularımıza ulaşmaz;
          ödemeler doğrudan Stripe altyapısı üzerinden, PCI-DSS uyumlu şekilde işlenir
        </li>
        <li>Hesap bilgileri (şifrelenmiş parola, üyelik tarihi)</li>
        <li>Site kullanım verileri (çerezler, IP adresi, tarayıcı bilgisi)</li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <ul>
        <li>Sipariş süreçlerinin yürütülmesi, ürünlerin teslim edilmesi</li>
        <li>Üyelik oluşturulması ve hesabınızın yönetilmesi</li>
        <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
        <li>Müşteri destek taleplerinin karşılanması</li>
        <li>Onay vermeniz hâlinde e-bülten ve kampanya bildirimlerinin iletilmesi</li>
        <li>Yasal yükümlülüklerin (fatura, muhasebe kayıtları) yerine getirilmesi</li>
        <li>Dolandırıcılık ve kötüye kullanımın önlenmesi</li>
      </ul>

      <h2>4. Kişisel Verilerin Aktarılması</h2>
      <p>
        Kişisel verileriniz; kargo süreçlerinin yürütülmesi için anlaşmalı kargo
        firmalarına, ödeme işlemlerinin gerçekleştirilmesi için Stripe Inc.&apos;e ve yasal
        zorunluluk hâllerinde yetkili kamu kurum ve kuruluşlarına, KVKK&apos;nın 8. ve 9.
        maddelerinde belirtilen şartlar dâhilinde aktarılabilir.
      </p>

      <h2>5. Saklama Süresi</h2>
      <p>
        Kişisel verileriniz, işlenme amacının gerektirdiği süre ve ilgili mevzuatta
        (Türk Ticaret Kanunu, Vergi Usul Kanunu vb.) öngörülen zamanaşımı süreleri
        boyunca saklanır. Sipariş kayıtları, yasal saklama yükümlülükleri gereği 10 yıla
        kadar muhafaza edilebilir.
      </p>

      <h2>6. Çerezler (Cookies)</h2>
      <p>
        Sitemiz; oturum yönetimi (giriş bilgisi) ve sepet içeriğinin tarayıcınızda
        saklanması amacıyla zorunlu çerezler kullanır. Bu çerezler sitenin temel
        işlevleri için gereklidir ve devre dışı bırakılamaz.
      </p>

      <h2>7. KVKK Kapsamındaki Haklarınız</h2>
      <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
        <li>KVKK&apos;da öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme</li>
        <li>İşlemlerin, aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
        <li>Aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
        <li>Kanuna aykırı işleme sebebiyle zararın giderilmesini talep etme</li>
      </ul>
      <p>
        Bu haklarınızı kullanmak için <a href={`mailto:${settings["store.email"]}`}>{settings["store.email"]}</a>{" "}
        adresine yazılı olarak başvurabilirsiniz.
      </p>

      <h2>8. Veri Güvenliği</h2>
      <p>
        Şifreleriniz geri döndürülemez biçimde (bcrypt) saklanır. Ödeme bilgileri hiçbir
        aşamada sunucularımızda tutulmaz. Hesap ve sipariş verilerine erişim, yalnızca
        yetkilendirilmiş işlemlerle sınırlıdır.
      </p>

      <p style={{ fontStyle: "italic", color: "var(--color-gray-500)", fontSize: "0.82rem" }}>
        Bu metin genel bir bilgilendirme şablonudur; yayına almadan önce bir hukuk
        danışmanına kontrol ettirmeniz önerilir.
      </p>
    </LegalPage>
  );
}
