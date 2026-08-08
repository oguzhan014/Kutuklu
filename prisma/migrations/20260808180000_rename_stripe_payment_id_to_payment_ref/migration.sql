-- Stripe kaldırıldı, PayTR'ye geçildi.
-- Sütun yeniden adlandırılır (DROP + ADD değil) — mevcut sipariş referansları korunur.
ALTER TABLE "orders" RENAME COLUMN "stripePaymentId" TO "paymentRef";

-- Unique index adını da yeni sütun adına hizala.
ALTER INDEX "orders_stripePaymentId_key" RENAME TO "orders_paymentRef_key";
