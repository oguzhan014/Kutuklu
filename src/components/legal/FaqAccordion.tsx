"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "16px 18px",
                background: isOpen ? "var(--color-cream)" : "var(--color-white)",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "0.94rem", color: "var(--color-black)" }}>
                {item.question}
              </span>
              <ChevronDown
                size={18}
                color="var(--color-gray-500)"
                style={{
                  flexShrink: 0,
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "none",
                }}
              />
            </button>

            {isOpen && (
              <div style={{ padding: "0 18px 18px" }}>
                <p style={{ fontSize: "0.88rem", color: "var(--color-gray-600)", lineHeight: 1.7, margin: 0 }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
