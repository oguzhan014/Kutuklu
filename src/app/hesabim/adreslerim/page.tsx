import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { AddressManager } from "@/components/hesabim/AddressManager";

export const metadata: Metadata = {
  title: "Adreslerim",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdreslerimPage() {
  const user = await requireUser();

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { title: "asc" }],
  });

  return <AddressManager addresses={addresses} />;
}
