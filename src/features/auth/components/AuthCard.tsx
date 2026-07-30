import Link from "next/link";
import { Leaf } from "lucide-react";

/** Giriş / kayıt ekranlarının ortak kart çerçevesi. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        margin: "0 auto",
        padding: "40px 32px",
        background: "var(--color-white)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <Link href="/" aria-label="Ana sayfa">
          <div
            style={{
              width: 48,
              height: 48,
              background: "var(--color-green)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Leaf color="var(--color-gold)" size={24} />
          </div>
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "var(--color-black)",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--color-gray-500)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      </div>

      {children}

      {footer && (
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--color-border)",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--color-gray-600)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export const authInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

export const authLabelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--color-gray-700)",
};
