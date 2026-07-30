"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Trash2, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/product";

/**
 * Ürün ekleme / düzenleme formu.
 *
 * Görseller `/api/admin/upload` ucuna yüklenir; uç yalnızca ADMIN'e açıktır,
 * dosya türünü imzadan doğrular ve dosya adını sunucuda üretir.
 */

type Category = { id: string; name: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isOrganic: boolean;
  harvestType: "STANDARD" | "EARLY_HARVEST" | "ORGANIC" | "GOURMET";
  volume: string;
  type: "SIMPLE" | "VARIABLE";
  price: string;
  comparePrice: string;
  sku: string;
  stock: string;
  primaryImage: string | null;
  galleryImages: string[];
  attributes: { name: string; options: string[] }[];
  variants: { sku: string; price: string; stock: string; attributes: Record<string, string> }[];
};

type AttributeState = { name: string; options: string[]; inputValue?: string };
type VariantState = {
  key: string;
  attributes: Record<string, string>;
  sku: string;
  price: string;
  stock: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: "8px",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid var(--color-border)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{ fontSize: "0.75rem", color: "#DC2626", display: "block", marginTop: "5px" }}>
      {message}
    </span>
  );
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [productType, setProductType] = useState<"SIMPLE" | "VARIABLE">(
    initial?.type ?? "SIMPLE"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Temel bilgiler
  const [name, setName] = useState(initial?.name ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isOrganic, setIsOrganic] = useState(initial?.isOrganic ?? false);
  const [harvestType, setHarvestType] = useState<ProductFormInitial["harvestType"]>(
    initial?.harvestType ?? "STANDARD"
  );
  const [volume, setVolume] = useState(initial?.volume ?? "");

  // Basit ürün
  const [price, setPrice] = useState(initial?.price ?? "");
  const [comparePrice, setComparePrice] = useState(initial?.comparePrice ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [stock, setStock] = useState(initial?.stock ?? "");

  // Görseller
  const [primaryImage, setPrimaryImage] = useState<string | null>(initial?.primaryImage ?? null);
  const [galleryImages, setGalleryImages] = useState<string[]>(initial?.galleryImages ?? []);
  const [uploading, setUploading] = useState<"primary" | "gallery" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Varyasyonlar
  const [attributes, setAttributes] = useState<AttributeState[]>(
    initial?.attributes?.length
      ? initial.attributes.map((attribute) => ({ ...attribute, inputValue: "" }))
      : [{ name: "Hacim", options: ["250ml", "500ml"], inputValue: "" }]
  );
  const [variants, setVariants] = useState<VariantState[]>(
    initial?.variants?.map((variant, index) => ({
      key: `v${index}`,
      attributes: variant.attributes,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    })) ?? []
  );

  // ── Görsel yükleme ───────────────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setUploadError(result?.error ?? "Görsel yüklenemedi.");
      return null;
    }

    return result.url as string;
  };

  const handlePrimaryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading("primary");
    setUploadError("");
    const url = await uploadFile(file);
    if (url) setPrimaryImage(url);
    setUploading(null);
    if (primaryInputRef.current) primaryInputRef.current.value = "";
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (galleryImages.length >= 4) {
      setUploadError("En fazla 4 ekstra görsel ekleyebilirsiniz.");
      return;
    }

    setUploading("gallery");
    setUploadError("");
    const url = await uploadFile(file);
    if (url) setGalleryImages((current) => [...current, url]);
    setUploading(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  // ── Nitelik / varyasyon yönetimi ─────────────────────────
  const addAttribute = () =>
    setAttributes((current) => [...current, { name: "", options: [], inputValue: "" }]);

  const updateAttributeName = (index: number, value: string) =>
    setAttributes((current) =>
      current.map((attribute, i) => (i === index ? { ...attribute, name: value } : attribute))
    );

  const updateAttributeInput = (index: number, value: string) =>
    setAttributes((current) =>
      current.map((attribute, i) => (i === index ? { ...attribute, inputValue: value } : attribute))
    );

  const addOption = (index: number) => {
    setAttributes((current) =>
      current.map((attribute, i) => {
        if (i !== index) return attribute;
        const option = attribute.inputValue?.trim();
        if (!option || attribute.options.includes(option)) {
          return { ...attribute, inputValue: "" };
        }
        return { ...attribute, options: [...attribute.options, option], inputValue: "" };
      })
    );
  };

  const removeOption = (attrIndex: number, optionIndex: number) =>
    setAttributes((current) =>
      current.map((attribute, i) =>
        i === attrIndex
          ? { ...attribute, options: attribute.options.filter((_, o) => o !== optionIndex) }
          : attribute
      )
    );

  const removeAttribute = (index: number) =>
    setAttributes((current) => current.filter((_, i) => i !== index));

  const addVariation = () => {
    const emptyAttrs: Record<string, string> = {};
    for (const attribute of attributes) {
      if (attribute.name.trim() !== "") emptyAttrs[attribute.name] = "";
    }

    setVariants((current) => [
      ...current,
      {
        key: `v${Date.now()}${current.length}`,
        attributes: emptyAttrs,
        sku: "",
        price: "",
        stock: "",
      },
    ]);
  };

  const removeVariation = (index: number) =>
    setVariants((current) => current.filter((_, i) => i !== index));

  // ── Gönderim ─────────────────────────────────────────────
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const validAttributes = attributes
      .filter((attribute) => attribute.name.trim() !== "" && attribute.options.length > 0)
      .map((attribute) => ({ name: attribute.name.trim(), options: attribute.options }));

    const payload = {
      id: initial?.id,
      name,
      shortDesc,
      description,
      categoryId,
      isActive,
      isFeatured,
      isOrganic,
      harvestType,
      volume,
      type: productType,
      price,
      comparePrice,
      sku,
      stock,
      attributes: productType === "VARIABLE" ? validAttributes : [],
      variants:
        productType === "VARIABLE"
          ? variants.map((variant) => ({
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              attributes: variant.attributes,
            }))
          : [],
      primaryImage,
      galleryImages,
    };

    try {
      const result = isEdit ? await updateProduct(payload) : await createProduct(payload);

      if (!result.ok) {
        setFormError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormError("Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1000px" }}
    >
      {/* Üst bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/admin/products"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "white",
              color: "var(--color-black)",
              border: "1px solid var(--color-border)",
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", margin: 0 }}>
            {isEdit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: "var(--color-green)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
          {isSubmitting ? "Kaydediliyor…" : "Ürünü Kaydet"}
        </button>
      </div>

      {formError && (
        <div
          style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            padding: "14px 18px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={17} /> {formError}
        </div>
      )}

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }} className="product-form-grid">
        {/* Sol kolon */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "20px" }}>
              Temel Bilgiler
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Ürün Adı *</label>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Örn: Kütüklü Erken Hasat"
                  style={inputStyle}
                />
                <FieldError message={fieldErrors.name} />
              </div>

              <div>
                <label style={labelStyle}>Kısa Açıklama</label>
                <input
                  value={shortDesc}
                  onChange={(event) => setShortDesc(event.target.value)}
                  placeholder="Ürün kartlarında görünen tek satırlık tanıtım"
                  maxLength={200}
                  style={inputStyle}
                />
                <FieldError message={fieldErrors.shortDesc} />
              </div>

              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ürün detaylarını buraya yazın…"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                <FieldError message={fieldErrors.description} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Hacim (ml)</label>
                  <input
                    type="number"
                    min={0}
                    value={volume}
                    onChange={(event) => setVolume(event.target.value)}
                    placeholder="Örn: 500"
                    style={inputStyle}
                  />
                  <FieldError message={fieldErrors.volume} />
                </div>
                <div>
                  <label style={labelStyle}>Hasat Tipi</label>
                  <select
                    value={harvestType}
                    onChange={(event) =>
                      setHarvestType(event.target.value as ProductFormInitial["harvestType"])
                    }
                    style={inputStyle}
                  >
                    <option value="STANDARD">Klasik Sızma</option>
                    <option value="EARLY_HARVEST">Erken Hasat</option>
                    <option value="ORGANIC">Organik</option>
                    <option value="GOURMET">Gurme / Limited</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Fiyat ve varyasyonlar */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
                Fiyat ve Varyasyonlar
              </h2>
              <select
                value={productType}
                onChange={(event) => setProductType(event.target.value as "SIMPLE" | "VARIABLE")}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                <option value="SIMPLE">Basit Ürün (Tek Fiyat)</option>
                <option value="VARIABLE">Varyasyonlu Ürün</option>
              </select>
            </div>

            {productType === "SIMPLE" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Fiyat (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                  <FieldError message={fieldErrors.price} />
                </div>
                <div>
                  <label style={labelStyle}>İndirimsiz Fiyat (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={comparePrice}
                    onChange={(event) => setComparePrice(event.target.value)}
                    placeholder="Üstü çizili fiyat"
                    style={inputStyle}
                  />
                  <FieldError message={fieldErrors.comparePrice} />
                </div>
                <div>
                  <label style={labelStyle}>Stok Kodu (SKU)</label>
                  <input
                    value={sku}
                    onChange={(event) => setSku(event.target.value)}
                    placeholder="Örn: KLS-500"
                    style={inputStyle}
                  />
                  <FieldError message={fieldErrors.sku} />
                </div>
                <div>
                  <label style={labelStyle}>Stok Adedi *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="0"
                    style={inputStyle}
                  />
                  <FieldError message={fieldErrors.stock} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div
                  style={{
                    padding: "16px",
                    background: "var(--color-gray-100)",
                    borderRadius: "8px",
                    border: "1px dashed var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>Nitelikler</h3>
                    <button
                      type="button"
                      onClick={addAttribute}
                      style={{
                        padding: "6px 12px",
                        background: "white",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Plus size={14} /> Nitelik Ekle
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    {attributes.map((attribute, index) => (
                      <div key={index} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <input
                            placeholder="Örn: Hacim"
                            value={attribute.name}
                            onChange={(event) => updateAttributeName(index, event.target.value)}
                            style={{ ...inputStyle, padding: "10px" }}
                          />
                        </div>
                        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              placeholder="Seçenek yazıp Enter'a basın"
                              value={attribute.inputValue ?? ""}
                              onChange={(event) => updateAttributeInput(index, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  addOption(index);
                                }
                              }}
                              style={{ ...inputStyle, padding: "10px", flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => addOption(index)}
                              style={{
                                padding: "0 16px",
                                background: "var(--color-black)",
                                color: "white",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                            >
                              Ekle
                            </button>
                          </div>

                          {attribute.options.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                              {attribute.options.map((option, optionIndex) => (
                                <span
                                  key={option}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "var(--color-green)",
                                    color: "white",
                                    padding: "4px 10px",
                                    borderRadius: "100px",
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {option}
                                  <button
                                    type="button"
                                    onClick={() => removeOption(index, optionIndex)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "white",
                                      cursor: "pointer",
                                      padding: 0,
                                      display: "flex",
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          style={{
                            padding: "10px",
                            background: "white",
                            color: "#DC2626",
                            border: "1px solid var(--color-border)",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {attributes.some((attribute) => attribute.name.trim() !== "") && (
                    <button
                      type="button"
                      onClick={addVariation}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "var(--color-black)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      + Yeni Varyasyon Ekle
                    </button>
                  )}
                </div>

                <FieldError message={fieldErrors.variants} />

                {variants.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "12px" }}>
                      Varyasyonlar
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {variants.map((variant, index) => {
                        const validAttrs = attributes.filter((a) => a.name.trim() !== "");

                        return (
                          <div
                            key={variant.key}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                              padding: "16px",
                              border: "1px solid var(--color-border)",
                              borderRadius: "8px",
                              background: "white",
                            }}
                          >
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                              {validAttrs.map((attribute) => (
                                <div key={attribute.name} style={{ flex: 1, minWidth: "150px" }}>
                                  <label
                                    style={{
                                      display: "block",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      marginBottom: "4px",
                                      color: "var(--color-gray-600)",
                                    }}
                                  >
                                    {attribute.name}
                                  </label>
                                  <select
                                    value={variant.attributes[attribute.name] ?? ""}
                                    onChange={(event) =>
                                      setVariants((current) =>
                                        current.map((v, i) =>
                                          i === index
                                            ? {
                                                ...v,
                                                attributes: {
                                                  ...v.attributes,
                                                  [attribute.name]: event.target.value,
                                                },
                                              }
                                            : v
                                        )
                                      )
                                    }
                                    style={{ ...inputStyle, padding: "8px", fontSize: "0.9rem" }}
                                  >
                                    <option value="">Seçiniz…</option>
                                    {attribute.options.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>

                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>
                                  SKU
                                </label>
                                <input
                                  value={variant.sku}
                                  onChange={(event) =>
                                    setVariants((current) =>
                                      current.map((v, i) =>
                                        i === index ? { ...v, sku: event.target.value } : v
                                      )
                                    )
                                  }
                                  style={{ ...inputStyle, padding: "8px" }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>
                                  Fiyat (₺)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={variant.price}
                                  onChange={(event) =>
                                    setVariants((current) =>
                                      current.map((v, i) =>
                                        i === index ? { ...v, price: event.target.value } : v
                                      )
                                    )
                                  }
                                  style={{ ...inputStyle, padding: "8px" }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>
                                  Stok
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={variant.stock}
                                  onChange={(event) =>
                                    setVariants((current) =>
                                      current.map((v, i) =>
                                        i === index ? { ...v, stock: event.target.value } : v
                                      )
                                    )
                                  }
                                  style={{ ...inputStyle, padding: "8px" }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVariation(index)}
                                style={{
                                  padding: "9px",
                                  background: "white",
                                  color: "#DC2626",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sağ kolon */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px", minWidth: "280px" }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px" }}>
              Durum &amp; Kategori
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Kategori *</label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                style={inputStyle}
              >
                <option value="">Kategori Seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.categoryId} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "var(--color-green)" }}
                />
                <span style={{ fontWeight: 500 }}>Yayında (satışa açık)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) => setIsFeatured(event.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "var(--color-green)" }}
                />
                <span style={{ fontWeight: 500 }}>Öne çıkan ürün</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(event) => setIsOrganic(event.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "var(--color-green)" }}
                />
                <span style={{ fontWeight: 500 }}>Organik sertifikalı</span>
              </label>
            </div>
          </div>

          {/* Görseller */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px" }}>Görseller</h2>

            {uploadError && (
              <div
                style={{
                  background: "#FEE2E2",
                  color: "#B91C1C",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  marginBottom: "14px",
                }}
              >
                {uploadError}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Ana Görsel (Kapak)</label>

              <input
                ref={primaryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePrimaryUpload}
                style={{ display: "none" }}
              />

              {primaryImage ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-cream)",
                  }}
                >
                  {/* Yerel yükleme; next/image optimizasyonu gerekmiyor. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImage}
                    alt="Ana görsel"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(null)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "white",
                      border: "none",
                      borderRadius: "50%",
                      padding: "5px",
                      cursor: "pointer",
                      color: "#DC2626",
                      display: "flex",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => primaryInputRef.current?.click()}
                  disabled={uploading !== null}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    border: "2px dashed var(--color-border)",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--color-gray-500)",
                    background: "var(--color-gray-100)",
                    gap: "10px",
                  }}
                >
                  {uploading === "primary" ? (
                    <Loader2 size={30} className="spin" />
                  ) : (
                    <Upload size={30} />
                  )}
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {uploading === "primary" ? "Yükleniyor…" : "Görsel Yükle"}
                  </span>
                </button>
              )}
            </div>

            <div>
              <label style={labelStyle}>Ekstra Görseller (Maks 4)</label>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleGalleryUpload}
                style={{ display: "none" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {galleryImages.map((image, index) => (
                  <div
                    key={image}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-cream)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`Görsel ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryImages((current) => current.filter((_, i) => i !== index))
                      }
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "white",
                        border: "none",
                        borderRadius: "50%",
                        padding: "4px",
                        cursor: "pointer",
                        color: "#DC2626",
                        display: "flex",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {galleryImages.length < 4 && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploading !== null}
                    style={{
                      aspectRatio: "1",
                      border: "2px dashed var(--color-border)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--color-gray-500)",
                      background: "var(--color-gray-100)",
                    }}
                  >
                    {uploading === "gallery" ? (
                      <Loader2 size={22} className="spin" />
                    ) : (
                      <Plus size={22} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .product-form-grid { flex-direction: column !important; }
        }
      `}</style>
    </form>
  );
}
