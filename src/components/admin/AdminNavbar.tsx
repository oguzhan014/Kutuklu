"use client";

import { useSession } from "next-auth/react";
import { Bell, User } from "lucide-react";

export function AdminNavbar() {
  const { data: session } = useSession();

  return (
    <header style={{ height: "70px", background: "white", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
      <div>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>Hoş Geldiniz, {session?.user?.name || "Yönetici"}</h1>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", margin: 0 }}>İşler harika görünüyor.</p>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative", color: "var(--color-gray-600)" }}>
          <Bell size={20} />
          <span style={{ position: "absolute", top: -2, right: -2, width: "8px", height: "8px", background: "red", borderRadius: "50%" }}></span>
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "24px", borderLeft: "1px solid var(--color-border)" }}>
          <div style={{ width: "36px", height: "36px", background: "var(--color-cream)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-gold)" }}>
            <User size={18} color="var(--color-gold)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-black)" }}>{session?.user?.name || "Admin"}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--color-gray-500)" }}>Yönetici</span>
          </div>
        </div>
      </div>
    </header>
  );
}
