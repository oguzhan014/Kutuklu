"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, Package, MapPin, LogOut, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/hesabim", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: Package },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPin },
  { href: "/hesabim/profil", label: "Profil & Şifre", icon: User },
];

export function AccountNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 16px",
        height: "fit-content",
      }}
    >
      <div style={{ padding: "0 8px 16px", borderBottom: "1px solid var(--color-border)", marginBottom: "12px" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginBottom: "4px" }}>
          Hoş geldiniz
        </div>
        <div
          style={{
            fontWeight: 600,
            color: "var(--color-black)",
            fontSize: "0.95rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {userName}
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--color-green)" : "var(--color-gray-600)",
                background: isActive ? "rgba(47,79,47,0.07)" : "transparent",
              }}
            >
              <Icon size={17} /> {link.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "#DC2626",
            fontFamily: "inherit",
            textAlign: "left",
            marginTop: "8px",
          }}
        >
          <LogOut size={17} /> Çıkış Yap
        </button>
      </nav>
    </aside>
  );
}
