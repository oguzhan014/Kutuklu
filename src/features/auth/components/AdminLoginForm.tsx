"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Lock, Mail, ArrowRight } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("E-posta veya şifre hatalı.");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto", padding: "40px 32px", background: "var(--color-white)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ width: 48, height: 48, background: "var(--color-green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <Leaf color="var(--color-gold)" size={24} />
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "8px" }}>
          Yönetici Girişi
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", textAlign: "center" }}>
          Kütüklü Zeytinyağı yönetim paneline erişmek için giriş yapın.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "12px", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "20px", textAlign: "center" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-gray-700)" }}>E-posta Adresi</label>
          <div style={{ position: "relative" }}>
            <Mail size={18} color="var(--color-gray-400)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kutuklu.com"
              required
              style={{ width: "100%", padding: "12px 16px 12px 42px", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "0.95rem" }} 
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-gray-700)" }}>Şifre</label>
          <div style={{ position: "relative" }}>
            <Lock size={18} color="var(--color-gray-400)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "12px 16px 12px 42px", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "0.95rem" }} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            marginTop: "10px",
            background: "var(--color-green)", 
            color: "var(--color-white)", 
            border: "none", 
            padding: "14px", 
            borderRadius: "6px", 
            fontWeight: 600, 
            fontSize: "1rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: isLoading ? 0.7 : 1,
            transition: "all 0.2s"
          }}
        >
          {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
