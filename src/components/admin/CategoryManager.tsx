"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveCategory, deleteCategory, toggleCategoryActive } from "@/app/actions/category";

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "0.92rem",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--color-gray-600)",
  marginBottom: "6px",
};

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontWeight: 600,
  color: "var(--color-gray-600)",
  borderBottom: "1px solid var(--color-border)",
  fontSize: "0.85rem",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.74rem", color: "#DC2626", display: "block", marginTop: "4px" }}>
      {message}
    </span>
  );
}

/** Kategorileri üst-alt hiyerarşisine göre sıralı, girinti bilgisiyle düzler. */
function flattenTree(categories: CategoryRecord[]): { category: CategoryRecord; depth: number }[] {
  const byParent = new Map<string | null, CategoryRecord[]>();
  for (const category of categories) {
    const list = byParent.get(category.parentId) ?? [];
    list.push(category);
    byParent.set(category.parentId, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));
  }

  const result: { category: CategoryRecord; depth: number }[] = [];
  const visit = (parentId: string | null, depth: number, guard: Set<string>) => {
    for (const category of byParent.get(parentId) ?? []) {
      if (guard.has(category.id)) continue; // bozuk veri koruması
      result.push({ category, depth });
      visit(category.id, depth + 1, new Set(guard).add(category.id));
    }
  };
  visit(null, 0, new Set());

  return result;
}

export function CategoryManager({ categories }: { categories: CategoryRecord[] }) {
  const [editing, setEditing] = useState<CategoryRecord | "new" | null>(null);
  const [feedback, setFeedback] = useState({ text: "", error: false });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  const rows = flattenTree(categories);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
          Kategoriler
        </h1>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            style={{
              background: "var(--color-green)",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 500,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <Plus size={18} /> Yeni Kategori
          </button>
        )}
      </div>

      {feedback.text && (
        <div
          style={{
            background: feedback.error ? "#FEE2E2" : "#D1FAE5",
            color: feedback.error ? "#B91C1C" : "#047857",
            padding: "13px 16px",
            borderRadius: "8px",
            fontSize: "0.88rem",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {feedback.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {feedback.text}
        </div>
      )}

      {editing !== null && (
        <CategoryForm
          categories={categories}
          initial={editing === "new" ? null : editing}
          onDone={(message) => {
            setFeedback({ text: message, error: false });
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.9rem",
            minWidth: "700px",
          }}
        >
          <thead style={{ background: "var(--color-gray-100)" }}>
            <tr>
              <th style={thStyle}>Kategori</th>
              <th style={thStyle}>Slug</th>
              <th style={thStyle}>Ürün Sayısı</th>
              <th style={thStyle}>Sıra</th>
              <th style={thStyle}>Durum</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-gray-500)" }}>
                  Henüz kategori tanımlanmamış.
                </td>
              </tr>
            ) : (
              rows.map(({ category, depth }) => (
                <tr key={category.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: depth * 22 }}>
                      {depth > 0 && <span style={{ color: "var(--color-gray-400)" }}>↳</span>}
                      <span style={{ fontWeight: 600, color: "var(--color-black)" }}>{category.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-500)", fontFamily: "monospace", fontSize: "0.82rem" }}>
                    {category.slug}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>{category.productCount}</td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>{category.sortOrder}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      type="button"
                      disabled={pendingId === category.id}
                      onClick={() => {
                        setPendingId(category.id);
                        toggleCategoryActive(category.id).then((result) => {
                          setPendingId(null);
                          if (!result.ok) setFeedback({ text: result.error, error: true });
                          router.refresh();
                        });
                      }}
                      style={{
                        padding: "4px 9px",
                        background: category.isActive ? "#D1FAE5" : "#FEE2E2",
                        color: category.isActive ? "#059669" : "#DC2626",
                        borderRadius: "4px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {category.isActive ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setEditing(category)}
                        style={{
                          padding: "6px",
                          background: "var(--color-gray-100)",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "var(--color-gray-600)",
                          display: "inline-flex",
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <CategoryDeleteButton
                        categoryId={category.id}
                        name={category.name}
                        pendingId={pendingId}
                        setPendingId={setPendingId}
                        onDone={(message, error) => {
                          setFeedback({ text: message, error });
                          router.refresh();
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function CategoryDeleteButton({
  categoryId,
  name,
  pendingId,
  setPendingId,
  onDone,
}: {
  categoryId: string;
  name: string;
  pendingId: string | null;
  setPendingId: (value: string | null) => void;
  onDone: (message: string, error: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || pendingId === categoryId}
      onClick={() => {
        if (!confirm(`"${name}" kategorisi silinsin mi?`)) return;
        setPendingId(categoryId);
        startTransition(async () => {
          const result = await deleteCategory(categoryId);
          onDone(result.ok ? result.message ?? "Silindi." : result.error, !result.ok);
          setPendingId(null);
        });
      }}
      style={{
        padding: "6px",
        background: "#EF4444",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        color: "white",
        display: "inline-flex",
      }}
    >
      {pending ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
    </button>
  );
}

function CategoryForm({
  categories,
  initial,
  onDone,
  onCancel,
}: {
  categories: CategoryRecord[];
  initial: CategoryRecord | null;
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [parentId, setParentId] = useState(initial?.parentId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Bir kategori kendi altına veya kendi soyundan birinin altına taşınamaz;
  // bu yüzden düzenlenen kategori ve onun tüm alt ağacı seçenek listesinden çıkarılır.
  const excludedIds = new Set<string>();
  if (initial) {
    const collect = (id: string) => {
      excludedIds.add(id);
      for (const category of categories) {
        if (category.parentId === id) collect(category.id);
      }
    };
    collect(initial.id);
  }
  const parentOptions = categories.filter((category) => !excludedIds.has(category.id));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    const result = await saveCategory({
      id: initial?.id,
      name,
      description,
      parentId: parentId || null,
      isActive,
      sortOrder,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    onDone(result.message ?? "Kategori kaydedildi.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          {initial ? "Kategoriyi Düzenle" : "Yeni Kategori"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-500)" }}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "11px 14px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Kategori Adı *</label>
          <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label style={labelStyle}>Üst Kategori</label>
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            style={{ ...inputStyle, background: "white" }}
          >
            <option value="">Yok (Ana Kategori)</option>
            {parentOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.parentId} />
        </div>

        <div>
          <label style={labelStyle}>Sıralama</label>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            style={inputStyle}
          />
          <FieldError message={fieldErrors.sortOrder} />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "11px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              style={{ width: 17, height: 17, accentColor: "var(--color-green)" }}
            />
            <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>Kategori aktif</span>
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Açıklama</label>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "11px 24px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {saving && <Loader2 size={15} className="spin" />}
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            color: "var(--color-gray-700)",
            padding: "11px 24px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Vazgeç
        </button>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
