# Fatura fontu

`Geist-Regular.ttf` — fatura PDF'lerinde kullanılır.

## Neden gerekli?

PDFKit'in yerleşik standart fontları (Helvetica vb.) **WinAnsi/CP1252**
kodlamasıyla çalışır ve Türkçeye özgü `ğ Ğ ı İ ş Ş` harflerini İÇERMEZ.
Bu fontlarla üretilen faturada "Zeytinyağı Sızma" gibi metinler bozuk
karakterlere dönüşür.

Gömülü bir TrueType font kullanıldığında PDFKit Unicode → glif eşlemesini
doğru yapar ve Türkçe metin sorunsuz görünür.

## Lisans

Geist, **SIL Open Font License 1.1** ile lisanslanmıştır; gömülmesi ve
yeniden dağıtılması serbesttir. Kaynak: https://vercel.com/font

## Dikkat

Bu dosya sunucuya deploy edilirken **projeyle birlikte kopyalanmalıdır**.
Dosya bulunamazsa fatura üretimi çökmez; standart fonta düşer ve yalnızca
Türkçe karakterler bozulur (konsola uyarı yazılır).
