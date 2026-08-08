import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ADMIN_PAGE_SIZE } from "@/lib/pagination";

/**
 * Yönetim paneli sayfalama çubuğu.
 *
 * Sunucu bileşenidir: durum tutmaz, yalnızca `?page=` bağlantıları üretir.
 * Böylece sayfa yenilendiğinde/paylaşıldığında aynı sayfa açılır.
 *
 * Sayfa numarası hesabı `@/lib/pagination` içindedir.
 */

const linkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 14px",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "white",
  color: "var(--color-black)",
  textDecoration: "none",
  fontSize: "0.85rem",
  fontWeight: 500,
};

const disabledStyle: React.CSSProperties = {
  ...linkStyle,
  color: "var(--color-gray-400)",
  background: "var(--color-gray-100)",
  cursor: "not-allowed",
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  basePath,
  itemLabel = "kayıt",
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  /** Sayfa bağlantılarının temel adresi, ör. "/admin/orders". */
  basePath: string;
  itemLabel?: string;
}) {
  // Tek sayfaya sığıyorsa yalnızca toplamı göster.
  const showControls = totalPages > 1;

  const first = totalItems === 0 ? 0 : (page - 1) * ADMIN_PAGE_SIZE + 1;
  const last = Math.min(page * ADMIN_PAGE_SIZE, totalItems);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "20px",
      }}
    >
      <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
        {totalItems === 0
          ? `Kayıt yok`
          : `${totalItems} ${itemLabel} içinden ${first}–${last} arası gösteriliyor`}
      </span>

      {showControls && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {page > 1 ? (
            <Link href={`${basePath}?page=${page - 1}`} style={linkStyle}>
              <ChevronLeft size={15} /> Önceki
            </Link>
          ) : (
            <span style={disabledStyle} aria-disabled="true">
              <ChevronLeft size={15} /> Önceki
            </span>
          )}

          <span style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
            Sayfa {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link href={`${basePath}?page=${page + 1}`} style={linkStyle}>
              Sonraki <ChevronRight size={15} />
            </Link>
          ) : (
            <span style={disabledStyle} aria-disabled="true">
              Sonraki <ChevronRight size={15} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
