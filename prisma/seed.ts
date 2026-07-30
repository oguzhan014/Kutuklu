import * as fs from "fs";
import * as path from "path";

// .env dosyasını manuel yükle
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
}

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";
// @ts-ignore
import { PrismaClient } from "../src/generated/prisma/client";

const DATABASE_URL =
  process.env["DATABASE_URL"] ??
  "postgresql://postgres:1234@localhost:5432/zeytin_db?schema=public";

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seed başlıyor...");

  // ── Admin Kullanıcısı ──
  const adminPassword = await bcrypt.hash("KutukluAdmin2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin@kutuklu.com" },
    update: { password: adminPassword },
    create: {
      email: "admin@kutuklu.com",
      password: adminPassword,
      name: "Kütüklü Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin kullanıcısı oluşturuldu (admin@kutuklu.com / KutukluAdmin2026!)");

  // ── Kategoriler ──
  const kategoriKlasik = await prisma.category.upsert({
    where: { slug: "klasik-sizma" },
    update: {},
    create: {
      name: "Klasik Sızma",
      slug: "klasik-sizma",
      description: "Olgun zeytinlerden dengeli lezzet, günlük kullanım için ideal.",
      isActive: true,
      sortOrder: 1,
    },
  });

  const kategoriErken = await prisma.category.upsert({
    where: { slug: "erken-hasat" },
    update: {},
    create: {
      name: "Erken Hasat",
      slug: "erken-hasat",
      description: "Yeşil zeytinlerden yoğun aroma ve acılık hissi, gurme mutfağı için.",
      isActive: true,
      sortOrder: 2,
    },
  });

  const kategoriOrganik = await prisma.category.upsert({
    where: { slug: "organik" },
    update: {},
    create: {
      name: "Organik",
      slug: "organik",
      description: "Sertifikalı organik, kimyasal içermeyen sağlık odaklı üretim.",
      isActive: true,
      sortOrder: 3,
    },
  });

  const kategoriGurme = await prisma.category.upsert({
    where: { slug: "gurme" },
    update: {},
    create: {
      name: "Gurme",
      slug: "gurme",
      description: "Tek bahçe, özel hasat, koleksiyonluk ve hediye için.",
      isActive: true,
      sortOrder: 4,
    },
  });

  console.log("✅ Kategoriler oluşturuldu.");

  // ── Ürünler ──
  const urunler = [
    {
      name: "Kütüklü Klasik Sızma",
      slug: "klasik-sizma-500ml",
      shortDesc: "Zengin aromalı ve dengeli tat",
      description:
        "Kütüklü Klasik Sızma Zeytinyağı, olgun zeytinlerimizden geleneksel yöntemlerle elde edilir. Dengeli tadı ve zengin aromasıyla her yemeğin vazgeçilmezidir. Günlük kullanım için ideal olan bu zeytinyağı, Akdeniz mutfağının temel taşıdır.",
      price: 350,
      comparePrice: null,
      sku: "KLS-500",
      stock: 150,
      isActive: true,
      isFeatured: true,
      isOrganic: false,
      harvestType: "STANDARD" as const,
      volume: 500,
      categoryId: kategoriKlasik.id,
    },
    {
      name: "Kütüklü Erken Hasat",
      slug: "erken-hasat-500ml",
      shortDesc: "Yoğun meyvemsi, hafif acılık",
      description:
        "Kütüklü Erken Hasat Zeytinyağı, Ekim başında Kütüklü Köyü'nde yetiştirilen en tatlı yeşil zeytinlerden elde edilmektedir. Olum ve hasat aşamasında, zeytinler henüz olgunlaşmadan önce hafifçe polifenol ve antioksidan bakımından zengin, hafifçe acı ve keskin bir tada sahiptir. Soğuk sıkım yöntemiyle (≤27°C) işlenen yağ, tüm besin değerlerini korur.",
      price: 450,
      comparePrice: 520,
      sku: "ERH-500",
      stock: 89,
      isActive: true,
      isFeatured: true,
      isOrganic: false,
      harvestType: "EARLY_HARVEST" as const,
      volume: 500,
      categoryId: kategoriErken.id,
    },
    {
      name: "Kütüklü Organik",
      slug: "organik-500ml",
      shortDesc: "Sertifikalı organik üretim",
      description:
        "Kütüklü Organik Zeytinyağı, AB organik tarım standartlarına uygun, hiçbir kimyasal gübre veya pestisit kullanılmadan üretilmektedir. Toprağa ve çevreye saygılı üretim anlayışımızın ürünü olan bu zeytinyağı, hem sağlığınızı hem de doğayı korur.",
      price: 390,
      comparePrice: null,
      sku: "ORG-500",
      stock: 62,
      isActive: true,
      isFeatured: true,
      isOrganic: true,
      harvestType: "ORGANIC" as const,
      volume: 500,
      categoryId: kategoriOrganik.id,
    },
    {
      name: "Kütüklü Gurme Limited",
      slug: "gurme-limited-500ml",
      shortDesc: "Özel seri, sınırlı üretim",
      description:
        "Kütüklü Gurme Limited Edition, her yıl yalnızca tek bir bahçeden, özel hasat döneminde toplanan seçkin zeytinlerden üretilir. Koleksiyonluk cam şişesi ve ahşap hediye kutusuyla sunulan bu zeytinyağı, zeytinyağı tutkunları ve özel hediyeler için idealdir.",
      price: 550,
      comparePrice: null,
      sku: "GRM-500",
      stock: 30,
      isActive: true,
      isFeatured: true,
      isOrganic: false,
      harvestType: "GOURMET" as const,
      volume: 500,
      categoryId: kategoriGurme.id,
    },
    {
      name: "Kütüklü Klasik Sızma",
      slug: "klasik-sizma-1000ml",
      shortDesc: "Büyük boy, avantajlı",
      description:
        "Kütüklü Klasik Sızma 1L, ailenizin günlük zeytinyağı ihtiyacı için avantajlı büyük boy seçeneğidir. Aynı premium kalite, daha ekonomik fiyat.",
      price: 650,
      comparePrice: 720,
      sku: "KLS-1000",
      stock: 80,
      isActive: true,
      isFeatured: false,
      isOrganic: false,
      harvestType: "STANDARD" as const,
      volume: 1000,
      categoryId: kategoriKlasik.id,
    },
    {
      name: "Kütüklü Erken Hasat",
      slug: "erken-hasat-250ml",
      shortDesc: "Tadım boyu, yoğun lezzet",
      description:
        "Kütüklü Erken Hasat 250ml, zeytinyağımızı ilk kez denemek isteyenler için ideal tadım boyu. Hediye olarak da mükemmel bir seçenek.",
      price: 250,
      comparePrice: null,
      sku: "ERH-250",
      stock: 120,
      isActive: true,
      isFeatured: false,
      isOrganic: false,
      harvestType: "EARLY_HARVEST" as const,
      volume: 250,
      categoryId: kategoriErken.id,
    },
    {
      name: "Kütüklü Hediye Seti (2'li)",
      slug: "hediye-seti-2li",
      shortDesc: "Mükemmel hediye seçeneği",
      description:
        "Kütüklü Hediye Seti; 500ml Erken Hasat ve 500ml Klasik Sızma zeytinyağlarından oluşur. Özel tasarım ahşap kutusuyla sunulan bu set, her türlü özel gün için zarif bir hediye alternatifidir.",
      price: 850,
      comparePrice: 950,
      sku: "HED-2LI",
      stock: 25,
      isActive: true,
      isFeatured: false,
      isOrganic: false,
      harvestType: "EARLY_HARVEST" as const,
      volume: 500,
      categoryId: kategoriGurme.id,
    },
    {
      name: "Kütüklü Organik",
      slug: "organik-750ml",
      shortDesc: "Orta boy organik zeytinyağı",
      description:
        "Kütüklü Organik 750ml, sertifikalı organik üretimimizin orta boy seçeneği. Sağlıklı yaşam tercih edenler için ideal.",
      price: 520,
      comparePrice: null,
      sku: "ORG-750",
      stock: 45,
      isActive: true,
      isFeatured: false,
      isOrganic: true,
      harvestType: "ORGANIC" as const,
      volume: 750,
      categoryId: kategoriOrganik.id,
    },
  ];

  for (const urun of urunler) {
    await prisma.product.upsert({
      where: { slug: urun.slug },
      update: { price: urun.price, stock: urun.stock },
      create: urun,
    });
  }

  console.log("✅ 8 ürün oluşturuldu.");

  // ── Blog Yazıları ──
  const blogPosts = [
    {
      slug: "soguk-sikim-zeytinyagi-nedir",
      title: "Soğuk Sıkım Zeytinyağı Nedir ve Neden Önemlidir?",
      excerpt:
        "Gerçek bir soğuk sıkım işleminin nasıl yapıldığını ve zeytinyağının besin değerlerini nasıl maksimumda koruduğunu inceliyoruz.",
      content: `
Zeytinyağı, Akdeniz mutfağının kalbi ve sağlıklı yaşamın vazgeçilmez bir parçasıdır. Peki, market raflarında gördüğümüz onca çeşit arasında "Soğuk Sıkım" ibaresi neden bu kadar önemli? Gerçek bir zeytinyağı deneyimi için bilmeniz gereken her şeyi bu rehberde topladık.

### Soğuk Sıkım Nedir?
Geleneksel olarak zeytinler ezilir ve hamur haline getirilir. Daha sonra bu hamurdan yağın ayrışması için çeşitli işlemler uygulanır. Endüstriyel üretimde daha fazla yağ elde etmek için bu hamur ısıtılır. Ancak, sıcaklık zeytinyağının içindeki en değerli bileşenleri – polifenolleri, vitaminleri ve o nefis meyvemsi aromayı – yok eder.

**Soğuk sıkım**, zeytin hamurunun 27°C'nin altındaki sıcaklıklarda yoğrulması ve sıkılması işlemidir. Bu yöntemle elde edilen yağ miktarı azalır, fakat kalitesi muazzam derecede artar.

> "İyi bir soğuk sıkım zeytinyağı tattığınızda, boğazınızda bıraktığı o hafif yakıcılık ve burnunuza gelen taze çimen kokusu, içindeki antioksidanların canlılığının kanıtıdır."

### Soğuk Sıkımın Faydaları Nelerdir?
1. **Yüksek Polifenol Oranı:** Isıya maruz kalmadığı için zeytinyağının kalp sağlığını koruyan antioksidan özellikleri korunur.
2. **Kusursuz Aroma:** Zeytinin kendine has meyvemsi tadı, badem, çağla ve taze ot notaları bozulmadan şişeye girer.
3. **Düşük Asidite:** Soğuk sıkım ve hızlı işleme süreçleri sayesinde asit oranı düşük kalır (genellikle %0.8'in altındadır, Kütüklü'de bu oran %0.3'tür).

### Kütüklü'de Üretim Süreci
Biz Kütüklü köyündeki bahçelerimizden zeytinlerimizi Ekim ayında, henüz yeşilken topluyoruz (Erken Hasat). Toplanan zeytinler bekletilmeden, aynı gün içinde maksimum 25°C sıcaklıkta soğuk sıkım işlemine alınır. Amacımız çok üretmek değil, **en iyisini** üretmektir.
      `.trim(),
      category: "Zeytinyağı Kültürü",
      author: "Kütüklü Ekibi",
      imageUrl: "linear-gradient(160deg, #F5F1E8 0%, #E6E0CF 100%)",
      isFeatured: true,
      publishedAt: new Date("2023-10-12"),
    },
    {
      slug: "erken-hasat-faydalari",
      title: "Erken Hasat Zeytinyağının Sağlığımıza 5 Büyük Faydası",
      excerpt:
        "Polifenol deposu yeşil zeytinlerden elde edilen erken hasat zeytinyağının vücudumuza sağladığı inanılmaz faydalar.",
      content: `
Zeytinler tam olgunlaşıp siyahlaşmadan, henüz yeşilken toplanıp sıkıldığında ortaya çıkan zeytinyağına "Erken Hasat" diyoruz. Peki neden bu kadar özel?

### 1. Polifenol Bombası
Erken hasat zeytinyağı, siyah zeytinden elde edilen yağlara kıyasla çok daha yüksek oranda antioksidan (polifenol) içerir. Boğazınızı hafifçe yakan o enfes his, içindeki şifanın doğrudan bir kanıtıdır.

### 2. Kalp Dostu
İçeriğindeki yüksek orandaki oleik asit ve antioksidanlar sayesinde kötü kolesterolü (LDL) düşürmeye ve iyi kolesterolü (HDL) korumaya yardımcı olur.

### 3. Hücre Yenileyici Etki
E vitamini açısından son derece zengin olan erken hasat zeytinyağı, serbest radikallerle savaşarak cilt hücrelerinin yenilenmesini destekler.

> "Sabahları aç karnına içeceğiniz bir çorba kaşığı erken hasat zeytinyağı, güne başlamanın en sağlıklı yoludur."

### 4. Mükemmel Aroma
Kokusunu içinize çektiğinizde taze kesilmiş çimen, yeşil elma ve badem kokularını net bir şekilde alırsınız. Bu tazelik, salatalarınızın lezzetini tamamen değiştirecektir.

### 5. Düşük Asit Oranı
Henüz yere düşmemiş, dalından tek tek toplanan zeytinlerden üretildiği için asit oranı minimum seviyededir. Kütüklü Erken Hasat zeytinyağımızda bu oran %0.4 civarındadır.
      `.trim(),
      category: "Sağlık & Yaşam",
      author: "Dyt. Ayşe Yılmaz",
      imageUrl: "linear-gradient(160deg, #2F4F2F 0%, #1A2F1A 100%)",
      isFeatured: false,
      publishedAt: new Date("2023-09-28"),
    },
    {
      slug: "zeytinyagli-enginar-tarifi",
      title: "Kütüklü Zeytinyağı ile Mükemmel Zeytinyağlı Enginar",
      excerpt:
        "Geleneksel Türk mutfağının vazgeçilmezi zeytinyağlı enginarı bir de bizim sızma zeytinyağımızla deneyin.",
      content: `
Zeytinyağlı yemeklerin şahı olarak bilinen enginar, Ege ve Akdeniz mutfağının baş tacıdır. Kaliteli bir zeytinyağı olmadan gerçek bir zeytinyağlı enginar yapmak imkansızdır.

### Malzemeler
1. **6 adet taze çanak enginar**
2. **Yarım çay bardağı Kütüklü Erken Hasat Zeytinyağı**
3. **1 adet büyük boy kuru soğan** (yemeklik doğranmış)
4. **1 adet havuç, 1 adet patates** (küp küp doğranmış)
5. **1 su bardağı iç bakla veya bezelye**
6. **1 tatlı kaşığı toz şeker, 1 tatlı kaşığı tuz**
7. **Yarım limonun suyu**
8. **Yarım demet taze dereotu**

### Hazırlanışı

**1. Sebzelerin Hazırlanışı**
Geniş bir tencereye soğanları ve Kütüklü zeytinyağımızın yarısını alıp hafifçe soteleyin. Ardından havuç ve patatesleri ekleyip 2-3 dakika daha kavurun.

**2. Enginarların Pişirilmesi**
Enginar çanaklarını tencereye yerleştirin. Üzerlerine sotelenmiş garnitürü paylaştırın. Limon suyu, şeker, tuz ve bir bardak sıcak suyu ekleyin.

> "Püf Noktası: Kalan sızma zeytinyağınızı enginarlar piştikten ve ılıdıktan sonra üzerine gezdirin. Bu sayede yağın çiğ aroması ve besin değerleri kaybolmaz."

**3. Sunum**
Tencerenin kapağını kapatıp, kısık ateşte enginarlar yumuşayana kadar (yaklaşık 25-30 dk) pişirin. Oda sıcaklığına gelmesini bekleyin ve servis yapmadan hemen önce üzerine ince kıyılmış taze dereotu serpin.
      `.trim(),
      category: "Tarifler",
      author: "Şef Mehmet K.",
      imageUrl: "linear-gradient(160deg, #D4AF37 0%, #997A15 100%)",
      isFeatured: false,
      publishedAt: new Date("2023-08-15"),
    },
    {
      slug: "zeytin-hasadi-gunlukleri",
      title: "Kütüklü Köyünde Hasat Zamanı Heyecanı",
      excerpt:
        "Ekim ayının gelmesiyle bahçelerimizde başlayan tatlı telaşı ve ilk zeytinlerin sıkıma gidiş hikayesi.",
      content: `
Havalar hafifçe serinlemeye başladığında, Kütüklü köyünde çok özel bir hareketlilik başlar. Bu, bütün bir yılın emeğinin taçlandığı, toprağın bize sunduğu en güzel hediyeyi toplama zamanıdır.

### Şafak Vakti Başlayan Mesai
Sabahın ilk ışıklarıyla birlikte zeytinliklerimize doğru yola çıkıyoruz. Çiy damlaları henüz yaprakların üzerindeyken hasada başlamak çok önemli. Zeytinlerin ısınmasını önlemek, o eşsiz kaliteyi yakalamanın ilk adımıdır.

### Özenle Seçilen Zeytinler
Zeytinleri toplarken ağaçlara asla zarar vermiyoruz. Sırıkla vurmak yerine, zeytinleri taraklarla özenle ve narin bir şekilde topluyoruz. Yere düşen, zedelenmiş hiçbir zeytin "Erken Hasat" serimize giremez. Yalnızca havada yakalanan, dalından yeni kopmuş pırıl pırıl zeytinler kasalara alınır.

> "Zeytin ağacı cömerttir; siz ona ne kadar şefkatli yaklaşırsanız, o da size o kadar kaliteli yağ verir."

### Sıkıma Gidiş (Sıfır Gecikme)
Zeytin toplandıktan sonra beklemeyi sevmez. Asitliğin artmaması ve fermantasyonun başlamaması için zeytin kasalarımız aynı gün içinde, sadece birkaç saat sonra soğuk sıkım ünitesine ulaşır. O günün akşamında, ilk yağın çeşmeden akışını izlemek ve o mis gibi taze çimen kokusunu içimize çekmek, bütün yorgunluğumuzu unutturan en güzel andır.
      `.trim(),
      category: "Hikayemiz",
      author: "Ali Kütüklü",
      imageUrl: "linear-gradient(160deg, #3D6B3D 0%, #204020 100%)",
      isFeatured: false,
      publishedAt: new Date("2023-11-10"),
    },
    {
      slug: "zeytinyagi-nasil-saklanmali",
      title: "Zeytinyağı Evde Nasıl Saklanmalı? Doğru Bilinen Yanlışlar",
      excerpt:
        "Değerli sızma zeytinyağınızın tazeliğini ve nefis aromasını ilk günkü gibi korumak için bilmeniz gereken kritik noktalar.",
      content: `
Birinci sınıf bir soğuk sıkım zeytinyağı aldınız, ilk günkü kokusuna ve tadına bayıldınız. Ancak yanlış saklama koşulları, bu harika ürünün aylar içinde sıradan bir yağa dönüşmesine sebep olabilir.

Zeytinyağının başlıca üç büyük düşmanı vardır: **Işık, Isı ve Oksijen.**

### 1. Işıktan Koruyun
Zeytinyağı fotosentetik reaksiyonlara karşı hassastır. Şeffaf cam şişelerde veya doğrudan güneş ışığı alan tezgahlarda saklanan yağlar hızla oksitlenir ve acılaşır. Bu nedenle Kütüklü zeytinyağlarını ışık geçirmeyen koyu renkli cam şişelerde veya teneke ambalajlarda sunuyoruz.

> Evde kendi yağlıklarınıza dolduracaksanız, mutlaka koyu renkli cam veya seramik kaplar tercih edin.

### 2. Isıdan Uzak Tutun
Zeytinyağı için ideal saklama sıcaklığı 15°C ile 20°C arasıdır.
En sık yapılan hata, yağ şişesini kullanım kolaylığı için ocağın hemen yanına koymaktır. Ocak ısısı, zeytinyağınızın hızla kalitesini yitirmesine neden olur. Ayrıca buzdolabında saklamanıza da gerek yoktur; buzdolabına konan zeytinyağı donar ve çözüldüğünde kalitesi olumsuz etkilenebilir. En iyisi serin, loş bir mutfak dolabıdır.

### 3. Oksijenle Temasını Kesin
Hava ile temas eden zeytinyağı yavaş yavaş oksitlenir. Şişenizin kapağını her kullanımdan sonra mutlaka sıkıca kapatın. Eğer büyük bir teneke aldıysanız (örneğin 5 Litre), tüm yağı tek seferde büyük şişelere bölüştürün ve tenekede yarım yağ bırakarak hava ile temas yüzeyini artırmayın.
      `.trim(),
      category: "Rehber",
      author: "Kütüklü Ekibi",
      imageUrl: "linear-gradient(160deg, #F5F1E8 0%, #E6E0CF 100%)",
      isFeatured: false,
      publishedAt: new Date("2023-07-05"),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log("✅ 5 blog yazısı oluşturuldu.");
  console.log("🎉 Seed tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
