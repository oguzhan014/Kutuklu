"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  Ticket,
  Star,
  Mail,
  FolderTree,
  Newspaper,
  Receipt,
} from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Siparişler", href: "/admin/orders", icon: ShoppingBag },
    { name: "Faturalar", href: "/admin/invoices", icon: Receipt },
    { name: "Ürünler", href: "/admin/products", icon: Package },
    { name: "Kategoriler", href: "/admin/categories", icon: FolderTree },
    { name: "Kuponlar", href: "/admin/coupons", icon: Ticket },
    { name: "Blog", href: "/admin/blog", icon: Newspaper },
    { name: "Yorumlar", href: "/admin/reviews", icon: Star },
    { name: "Mesajlar", href: "/admin/messages", icon: Mail },
    { name: "Müşteriler", href: "/admin/customers", icon: Users },
    { name: "Ayarlar", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside style={{ width: "260px", height: "100vh", background: "var(--color-black)", color: "white", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, overflowY: "auto" }}>
      {/* Logo */}
      <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-gold)", margin: 0 }}>KÜTÜKLÜ</h2>
        <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", letterSpacing: "1px" }}>YÖNETİM PANELİ</span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                color: isActive ? "white" : "var(--color-gray-400)",
                background: isActive ? "var(--color-green)" : "transparent",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.2s"
              }}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button 
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", cursor: "pointer", transition: "background 0.2s" }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
