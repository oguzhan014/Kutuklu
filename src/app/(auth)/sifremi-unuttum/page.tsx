import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  robots: { index: false, follow: false },
};

export default function SifremiUnuttumPage() {
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
      <ForgotPasswordForm />
    </main>
  );
}
