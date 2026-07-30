"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { deleteProduct, toggleProductActive } from "@/app/actions/product";

export function ProductRowActions({
  productId,
  productName,
  isActive,
}: {
  productId: string;
  productName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleDelete = () => {
    if (!confirm(`"${productName}" ürünü silinsin mi? Bu işlem geri alınamaz.`)) return;

    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (!result.ok) {
        setMessage(result.error);
        // Pasife alınmış olabilir; listeyi yine de tazele.
        router.refresh();
        return;
      }
      router.refresh();
    });
  };

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProductActive(productId);
      router.refresh();
    });
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          title={isActive ? "Yayından kaldır" : "Yayına al"}
          style={{
            padding: "6px",
            color: "var(--color-gray-600)",
            background: "var(--color-gray-100)",
            border: "none",
            borderRadius: "4px",
            display: "inline-flex",
            cursor: pending ? "not-allowed" : "pointer",
          }}
        >
          {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        <Link
          href={`/admin/products/${productId}`}
          title="Düzenle"
          style={{
            padding: "6px",
            color: "var(--color-gray-600)",
            background: "var(--color-gray-100)",
            borderRadius: "4px",
            display: "inline-flex",
          }}
        >
          <Edit2 size={16} />
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          title="Sil"
          style={{
            padding: "6px",
            color: "white",
            background: "#EF4444",
            border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            borderRadius: "4px",
            display: "inline-flex",
          }}
        >
          {pending ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "0.75rem",
            color: "#B45309",
            maxWidth: "260px",
            textAlign: "right",
            lineHeight: 1.4,
          }}
        >
          {message}
        </div>
      )}

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
