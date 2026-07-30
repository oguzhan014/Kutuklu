import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Yetki Kontrolü
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <SessionProvider session={session}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-gray-100)" }}>
        <AdminSidebar />
        <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column" }}>
          <AdminNavbar />
          <main style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
