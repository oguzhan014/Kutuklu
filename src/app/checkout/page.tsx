import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, settingBool } from "@/lib/settings";
import { isStripeConfigured } from "@/lib/stripe";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme ve Adres",
  description: "Kütüklü Zeytinyağı siparişinizi güvenle tamamlayın.",
};

// Ödeme sayfası hiçbir zaman önbelleğe alınmamalı.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();
  const session = await auth();

  // Oturum açmış kullanıcı için formu ön doldur (kayıtlı varsayılan adres).
  let prefill = null;

  if (session?.user?.id) {
    const [user, defaultAddress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true },
      }),
      prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { isDefault: "desc" },
      }),
    ]);

    if (user) {
      const [firstName, ...rest] = (defaultAddress?.fullName ?? user.name ?? "").split(" ");
      prefill = {
        email: user.email,
        phone: defaultAddress?.phone ?? user.phone ?? "",
        firstName: firstName ?? "",
        lastName: rest.join(" "),
        city: defaultAddress?.city ?? "",
        district: defaultAddress?.district ?? "",
        address: defaultAddress?.address ?? "",
        postalCode: defaultAddress?.postalCode ?? "",
      };
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <CheckoutContent
          prefill={prefill}
          cardEnabled={
            settingBool(settings, "payment.cardEnabled") && isStripeConfigured()
          }
          transferEnabled={settingBool(settings, "payment.transferEnabled")}
          stripePublishableKey={
            isStripeConfigured()
              ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
              : null
          }
          bank={{
            name: settings["bank.name"],
            accountHolder: settings["bank.accountHolder"],
            iban: settings["bank.iban"],
          }}
          store={{
            name: settings["store.name"],
            email: settings["store.email"],
            phone: settings["store.phone"],
            address: settings["store.address"],
            taxOffice: settings["store.taxOffice"],
            taxNumber: settings["store.taxNumber"],
          }}
        />
      </main>
      <Footer />
    </>
  );
}
