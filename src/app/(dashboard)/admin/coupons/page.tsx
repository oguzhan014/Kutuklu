import { prisma } from "@/lib/prisma";
import { CouponManager, type CouponRecord } from "@/components/admin/CouponManager";

export const metadata = {
  title: "Kuponlar | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  // Decimal ve Date değerleri istemci bileşenine string olarak taşınır.
  const serialized: CouponRecord[] = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value.toString(),
    minOrderAmount: coupon.minOrderAmount ? coupon.minOrderAmount.toString() : null,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    isActive: coupon.isActive,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
  }));

  return <CouponManager coupons={serialized} />;
}
