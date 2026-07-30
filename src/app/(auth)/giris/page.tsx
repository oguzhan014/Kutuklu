import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Kütüklü Zeytinyağı hesabınıza giriş yapın.",
};

export default async function GirisPage() {
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
      {/* useSearchParams kullanan istemci bileşeni Suspense içinde olmalı. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
