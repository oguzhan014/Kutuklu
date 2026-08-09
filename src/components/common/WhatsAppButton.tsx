"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Kütüklü Köyü WhatsApp Destek Hattı (Örnek numara & önceden doldurulmuş mesaj)
  const phoneNumber = "905551234567";
  const defaultMessage = encodeURIComponent("Merhaba Kütüklü Zeytinyağı, ürünleriniz ve erken hasat hakkında bilgi almak istiyorum.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 900,
      }}
    >
      {/* Popover / Mini Mesaj Kutucuğu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "70px",
            left: 0,
            width: "300px",
            background: "var(--color-white)",
            borderRadius: "18px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.18)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            overflow: "hidden",
            animation: "fadeInUp 0.25s ease",
          }}
        >
          {/* Üst Başlık */}
          <div
            style={{
              background: "linear-gradient(135deg, #128C7E 0%, #075E54 100%)",
              color: "white",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#075E54" }}>
                <MessageCircle size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>Kütüklü Canlı Destek</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>Genellikle birkaç dakikada yanıt verir</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "4px" }}
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Gövde */}
          <div style={{ padding: "18px 16px", background: "#ECE5DD" }}>
            <div
              style={{
                background: "white",
                padding: "12px 14px",
                borderRadius: "0 12px 12px 12px",
                fontSize: "0.82rem",
                color: "#303030",
                lineHeight: 1.5,
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                marginBottom: "12px",
              }}
            >
              🌿 Merhaba! Yeni sezon erken hasat zeytinyağlarımız ve siparişleriniz hakkında size nasıl yardımcı olabiliriz?
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#25D366",
                color: "white",
                textDecoration: "none",
                padding: "12px",
                borderRadius: "25px",
                fontWeight: 700,
                fontSize: "0.85rem",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.35)",
              }}
            >
              <MessageCircle size={18} />
              Sohbete Başla
            </a>
          </div>
        </div>
      )}

      {/* Floating Buton */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="WhatsApp Canlı Destek"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(37, 211, 102, 0.4)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
