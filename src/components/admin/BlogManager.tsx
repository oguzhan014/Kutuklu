"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Pencil, X, Loader2, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { saveBlogPost, deleteBlogPost, togglePostPublished } from "@/app/actions/blog";
import { BLOG_GRADIENT_PRESETS } from "@/lib/blog-schema";

export type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string;
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

export function BlogManager({ posts }: { posts: BlogPostRecord[] }) {
  const [editing, setEditing] = useState<BlogPostRecord | "new" | null>(null);
  const [feedback, setFeedback] = useState({ text: "", error: false });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

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
          Blog Yazıları
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
            <Plus size={18} /> Yeni Yazı
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
        <BlogPostForm
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
            minWidth: "760px",
          }}
        >
          <thead style={{ background: "var(--color-gray-100)" }}>
            <tr>
              <th style={thStyle}>Başlık</th>
              <th style={thStyle}>Kategori</th>
              <th style={thStyle}>Yazar</th>
              <th style={thStyle}>Tarih</th>
              <th style={thStyle}>Durum</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-gray-500)" }}>
                  Henüz blog yazısı bulunmuyor.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "var(--color-black)" }}>
                      {post.title}
                      {post.isFeatured && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "var(--color-gold-dark)",
                            background: "rgba(212,175,55,0.15)",
                            padding: "2px 7px",
                            borderRadius: "100px",
                          }}
                        >
                          Öne Çıkan
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-gray-500)" }}>{post.slug}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>{post.category}</td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-600)" }}>{post.author}</td>
                  <td style={{ padding: "14px 16px", color: "var(--color-gray-500)", fontSize: "0.82rem" }}>
                    {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      type="button"
                      disabled={pendingId === post.id}
                      onClick={() => {
                        setPendingId(post.id);
                        togglePostPublished(post.id).then((result) => {
                          setPendingId(null);
                          if (!result.ok) setFeedback({ text: result.error, error: true });
                          router.refresh();
                        });
                      }}
                      style={{
                        padding: "4px 9px",
                        background: post.isPublished ? "#D1FAE5" : "#FEE2E2",
                        color: post.isPublished ? "#059669" : "#DC2626",
                        borderRadius: "4px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {post.isPublished ? "Yayında" : "Taslak"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {post.isPublished && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          style={{
                            padding: "6px",
                            background: "var(--color-gray-100)",
                            borderRadius: "4px",
                            color: "var(--color-gray-600)",
                            display: "inline-flex",
                          }}
                        >
                          <Eye size={15} />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(post)}
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
                      <BlogDeleteButton
                        postId={post.id}
                        title={post.title}
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

function BlogDeleteButton({
  postId,
  title,
  pendingId,
  setPendingId,
  onDone,
}: {
  postId: string;
  title: string;
  pendingId: string | null;
  setPendingId: (value: string | null) => void;
  onDone: (message: string, error: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || pendingId === postId}
      onClick={() => {
        if (!confirm(`"${title}" yazısı silinsin mi?`)) return;
        setPendingId(postId);
        startTransition(async () => {
          const result = await deleteBlogPost(postId);
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

function BlogPostForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: BlogPostRecord | null;
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "Kütüklü Ekibi");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? BLOG_GRADIENT_PRESETS[0].value);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    const result = await saveBlogPost({
      id: initial?.id,
      title,
      excerpt,
      content,
      category,
      author,
      imageUrl,
      isFeatured,
      isPublished,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }

    onDone(result.message ?? "Yazı kaydedildi.");
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
          {initial ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}
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
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Başlık *</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} />
          <FieldError message={fieldErrors.title} />
        </div>

        <div>
          <label style={labelStyle}>Kategori *</label>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Örn: Tarifler, Sağlık & Yaşam"
            style={inputStyle}
          />
          <FieldError message={fieldErrors.category} />
        </div>

        <div>
          <label style={labelStyle}>Yazar *</label>
          <input value={author} onChange={(event) => setAuthor(event.target.value)} style={inputStyle} />
          <FieldError message={fieldErrors.author} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Özet *</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="Liste sayfasında görünen kısa tanıtım metni"
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <FieldError message={fieldErrors.excerpt} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>İçerik *</label>
          <textarea
            rows={12}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"### Alt Başlık\n\nParagraf metni. **Kalın** yazmak için çift yıldız kullanın.\n\n> Alıntı metni\n\n1. Numaralı liste öğesi"}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "0.85rem" }}
          />
          <FieldError message={fieldErrors.content} />
          <span style={{ fontSize: "0.74rem", color: "var(--color-gray-500)", display: "block", marginTop: "4px" }}>
            Paragraflar arasına boş satır bırakın. Başlık için <code>###</code>, kalın için{" "}
            <code>**metin**</code>, alıntı için <code>&gt;</code>, numaralı liste için <code>1.</code> kullanabilirsiniz.
          </span>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Kapak Görseli</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {BLOG_GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setImageUrl(preset.value)}
                title={preset.label}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "8px",
                  background: preset.value,
                  border: `2px solid ${imageUrl === preset.value ? "var(--color-green)" : "transparent"}`,
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>
          <FieldError message={fieldErrors.imageUrl} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            id="blog-featured"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
            style={{ width: 17, height: 17, accentColor: "var(--color-green)" }}
          />
          <label htmlFor="blog-featured" style={{ fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}>
            Öne çıkan yazı
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            id="blog-published"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            style={{ width: 17, height: 17, accentColor: "var(--color-green)" }}
          />
          <label htmlFor="blog-published" style={{ fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}>
            Yayında
          </label>
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
