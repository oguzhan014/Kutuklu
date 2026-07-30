import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Girişi",
  description: "Kütüklü Zeytinyağı yönetim paneli girişi",
};

export default function AdminLoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-cream)" }}>
      <AdminLoginForm />
    </main>
  );
}
