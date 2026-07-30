import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Şifre Sıfırlama",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SifreSifirlaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-cream)",
        padding: "40px 20px",
      }}
    >
      <ResetPasswordForm token={token ?? null} />
    </main>
  );
}
