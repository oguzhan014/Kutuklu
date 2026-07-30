import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { FaqAccordion } from "@/components/legal/FaqAccordion";
import { getSettings, settingInt } from "@/lib/settings";
import { kurusToNumber } from "@/lib/money";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Kütüklü Zeytinyağı hakkında sıkça sorulan sorular.",
};

export default async function SikcaSorulanSorularPage() {
  const settings = await getSettings();
  const shippingCost = kurusToNumber(settingInt(settings, "shipping.cost"));
  const freeThreshold = kurusToNumber(settingInt(settings, "shipping.freeThreshold"));

  const items = [
    {
      question: "Siparişim ne zaman kargoya verilir?",
      answer:
        "Ödemesi onaylanan siparişler 1-2 iş günü içinde kargoya teslim edilir. Kargoya verildiğinde e-posta ve hesabınızdaki sipariş sayfası üzerinden bilgilendirilirsiniz.",
    },
    {
      question: "Kargo ücreti ne kadar?",
      answer: `${formatPrice(freeThreshold)} ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde ${formatPrice(shippingCost)} sabit kargo ücreti uygulanır.`,
    },
    {
      question: "Ürünü nasıl iade edebilirim?",
      answer:
        "Ambalajı açılmamış ürünleri, teslimattan itibaren 14 gün içinde cayma hakkınızı kullanarak iade edebilirsiniz. Gıda güvenliği gereği ambalajı açılmış ürünler iade kapsamı dışındadır. Detaylar için İade & Değişim sayfamızı inceleyebilirsiniz.",
    },
    {
      question: "Siparişimi iptal edebilir miyim?",
      answer:
        "Siparişiniz henüz kargoya verilmediyse, Hesabım → Siparişlerim sayfasından doğrudan iptal edebilirsiniz. Kargoya verilmiş siparişler için bizimle iletişime geçmeniz gerekir.",
    },
    {
      question: "Hangi ödeme yöntemlerini kullanabilirim?",
      answer:
        "Kredi/banka kartı (Stripe altyapısı üzerinden, 3D Secure destekli) ve banka havalesi/EFT ile ödeme yapabilirsiniz. Kart bilgileriniz hiçbir aşamada bizim sunucularımıza ulaşmaz.",
    },
    {
      question: "Üye olmadan sipariş verebilir miyim?",
      answer:
        "Evet, üye olmadan misafir olarak sipariş verebilirsiniz. Sipariş numaranız ve e-posta adresinizle Sipariş Takibi sayfasından siparişinizi görüntüleyebilirsiniz. Üye olursanız siparişlerinizi ve adreslerinizi tek yerden yönetebilirsiniz.",
    },
    {
      question: "Zeytinyağınız organik mi?",
      answer:
        "Organik seri ürünlerimiz sertifikalıdır ve ürün sayfasında 'Organik' etiketiyle belirtilir. Klasik ve Erken Hasat serilerimiz ise kimyasal gübre/pestisit kullanılmadan, geleneksel yöntemlerle üretilir.",
    },
    {
      question: "Zeytinyağının raf ömrü ne kadar?",
      answer:
        "Ürünlerimizin raf ömrü üretim tarihinden itibaren 18 aydır. Serin, karanlık bir yerde, ağzı sıkıca kapalı şekilde saklanması önerilir.",
    },
    {
      question: "Sipariş durumumu nereden takip edebilirim?",
      answer:
        "Üye girişi yaptıysanız Hesabım → Siparişlerim sayfasından; misafir sipariş verdiyseniz Sipariş Takibi sayfasından sipariş numaranız ve e-posta adresinizle sorgulayabilirsiniz.",
    },
    {
      question: "Şifremi unuttum, ne yapmalıyım?",
      answer:
        "Giriş sayfasındaki 'Şifremi Unuttum' bağlantısına tıklayarak e-posta adresinize gönderilecek bağlantı ile yeni bir şifre belirleyebilirsiniz.",
    },
  ];

  return (
    <LegalPage title="Sıkça Sorulan Sorular">
      <FaqAccordion items={items} />
    </LegalPage>
  );
}
