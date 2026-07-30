import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AccountNav } from "@/components/hesabim/AccountNav";
import { getCurrentUser } from "@/lib/auth-guards";

/**
 * Hesap alanı — oturum zorunlu.
 *
 * Bu kontrol kullanıcı deneyimi içindir (giriş sayfasına yönlendirme).
 * Asıl güvenlik sınırı, veri okuyan/yazan her sorgunun `userId` ile
 * sınırlandırılmasıdır (bkz. actions/account.ts).
 */
export default async function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/giris?callbackUrl=/hesabim");
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-gray-100)", minHeight: "70vh", padding: "40px 0" }}>
        <div className="container">
          <div
            style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "28px" }}
            className="account-grid"
          >
            <AccountNav userName={user.name ?? user.email} />
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 860px) {
          .account-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
