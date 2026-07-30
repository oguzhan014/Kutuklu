import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSettings, settingInt } from "@/lib/settings";
import { kurusToNumber } from "@/lib/money";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kargo ve Teslimat",
  description: "Kütüklü Zeytinyağı kargo süreleri ve teslimat bilgileri.",
};

export default async function KargoVeTeslimatPage() {
  const settings = await getSettings();
  const shippingCost = kurusToNumber(settingInt(settings, "shipping.cost"));
  const freeThreshold = kurusToNumber(settingInt(settings, "shipping.freeThreshold"));

  return (
    <LegalPage title="Kargo ve Teslimat" updatedAt="29 Temmuz 2026">
      <h2>1. Kargo Ücreti</h2>
      <p>
        Sipariş tutarınız <strong>{formatPrice(freeThreshold)}</strong> ve üzerinde ise
        kargo ücretsizdir. Bu tutarın altındaki siparişlerde{" "}
        <strong>{formatPrice(shippingCost)}</strong> sabit kargo ücreti uygulanır.
        Kargo ücreti, ödeme adımında sepet toplamınıza otomatik olarak yansıtılır.
      </p>

      <h2>2. Kargoya Veriliş Süresi</h2>
      <p>
        Havale/EFT ile ödenen siparişler, ödemenin onaylanmasından itibaren;
        kredi/banka kartı ile ödenen siparişler ise onay anından itibaren en geç{" "}
        <strong>1-2 iş günü</strong> içinde kargoya teslim edilir. Yoğun kampanya
        dönemlerinde bu süre uzayabilir; böyle bir durumda bilgilendirme yapılır.
      </p>

      <h2>3. Teslimat Süresi</h2>
      <p>
        Kargo firmasına teslim edilen siparişler, bulunduğunuz bölgeye bağlı olarak{" "}
        <strong>1-4 iş günü</strong> içinde adresinize ulaşır. Uzak bölgeler ve adalar
        için bu süre uzayabilir. Yasal azami teslimat süresi 30 gündür.
      </p>

      <h2>4. Kargo Takibi</h2>
      <p>
        Siparişiniz kargoya verildiğinde, kargo firması ve takip numarası{" "}
        <a href="/hesabim/siparislerim">Hesabım → Siparişlerim</a> sayfasında ve
        sipariş takip bağlantınızda görüntülenir.
      </p>

      <h2>5. Teslim Alırken Kontrol Edin</h2>
      <p>
        Paketi teslim alırken dış ambalajın hasarsız olduğundan emin olun. Ambalajda
        görünür bir hasar varsa, kargo görevlisi yanınızdayken tutanak tutturarak
        ürünü teslim almayı reddedebilir veya durumu fotoğraflayarak bizimle{" "}
        <strong>aynı gün</strong> içinde paylaşabilirsiniz.
      </p>

      <h2>6. Teslimat Bölgesi</h2>
      <p>
        Şu an yalnızca Türkiye sınırları içine gönderim yapılmaktadır. Yurt dışı
        gönderim talepleriniz için lütfen bizimle iletişime geçin.
      </p>

      <h2>7. Sorularınız İçin</h2>
      <p>
        Kargonuzla ilgili herhangi bir sorunuz için{" "}
        <a href="/iletisim">İletişim</a> sayfamızdan bize ulaşabilirsiniz.
      </p>
    </LegalPage>
  );
}
