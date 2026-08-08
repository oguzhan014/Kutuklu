import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { ProfileForms } from "@/components/hesabim/ProfileForms";
import { DeleteAccountSection } from "@/components/hesabim/DeleteAccountSection";

export const metadata: Metadata = {
  title: "Profil",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await requireUser();

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, phone: true, email: true },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <ProfileForms
        initialName={record?.name ?? ""}
        initialPhone={record?.phone ?? ""}
        email={record?.email ?? ""}
      />
      <DeleteAccountSection />
    </div>
  );
}
