import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Üye Ol",
  description: "Kütüklü Zeytinyağı'na ücretsiz üye olun.",
};

export default async function KayitPage() {
  const session = await auth();
  if (session?.user) redirect("/hesabim");

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
      <RegisterForm />
    </main>
  );
}
