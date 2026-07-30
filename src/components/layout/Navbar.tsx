"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search, Leaf, User, Heart } from "lucide-react";
import { useCartHydrated } from "@/lib/use-cart-hydrated";
import { useWishlistHydrated } from "@/lib/use-wishlist-hydrated";
import { useWishlistStore } from "@/lib/wishlist-store";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/hikayemiz", label: "Hikayemiz" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

import { useCartStore } from "@/lib/store";

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { items, setIsOpen } = useCartStore();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchValue.trim();
    setIsSearchOpen(false);
    router.push(query ? `/urunler?q=${encodeURIComponent(query)}` : "/urunler");
  };

  // Sepet sayacı yalnızca localStorage yüklendikten sonra gösterilir.
  const hydrated = useCartHydrated();
  const cartItemCount = hydrated
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistHydrated = useWishlistHydrated();
  const wishlistCount = wishlistHydrated ? wishlistItems.length : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Üst bilgi çubuğu */}
      <div
        style={{
          background: "var(--color-green)",
          color: "var(--color-cream)",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textAlign: "center",
          padding: "8px 24px",
        }}
      >
        🌿 Ücretsiz Kargo – 500₺ ve Üzeri Siparişlerde &nbsp;|&nbsp; Organik
        Sertifikalı &nbsp;|&nbsp; Soğuk Sıkım
      </div>

      {/* Ana Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: isScrolled
            ? "rgba(245, 241, 232, 0.95)"
            : "var(--color-cream)",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: `1px solid ${isScrolled ? "var(--color-border)" : "transparent"}`,
          transition: "all 0.3s ease",
          boxShadow: isScrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div className="container">
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "72px",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--color-green)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Leaf size={18} color="var(--color-gold)" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  letterSpacing: "0.02em",
                }}
              >
                Kütüklü
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <ul
              style={{
                display: "flex",
                gap: "36px",
                listStyle: "none",
              }}
              className="hidden md:flex"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      color: "var(--color-gray-700)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      position: "relative",
                    }}
                    className="nav-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Sağ İkonlar */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                aria-label={isSearchOpen ? "Aramayı kapat" : "Ürün ara"}
                onClick={() => {
                  setIsSearchOpen((open) => !open);
                  setIsMobileOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isSearchOpen ? "var(--color-green)" : "var(--color-gray-600)",
                  padding: "6px",
                  borderRadius: "4px",
                  transition: "color 0.2s",
                  display: "flex",
                }}
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Favorilerim */}
              <Link
                href="/favorilerim"
                aria-label="Favorilerim"
                style={{
                  position: "relative",
                  color: "var(--color-gray-600)",
                  padding: "6px",
                  display: "flex",
                  transition: "color 0.2s",
                }}
              >
                <Heart size={21} />
                {wishlistCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 16,
                      height: 16,
                      background: "#DC2626",
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Hesabım — oturum yoksa layout girişe yönlendirir */}
              <Link
                href="/hesabim"
                aria-label="Hesabım"
                style={{
                  color: "var(--color-gray-600)",
                  padding: "6px",
                  display: "flex",
                  transition: "color 0.2s",
                }}
              >
                <User size={21} />
              </Link>

              <button
                onClick={() => setIsOpen(true)}
                aria-label="Sepetim"
                style={{
                  position: "relative",
                  color: "var(--color-gray-600)",
                  padding: "6px",
                  display: "flex",
                  transition: "color 0.2s",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 16,
                      height: 16,
                      background: "var(--color-gold)",
                      color: "var(--color-black)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobil Menü Butonu */}
              <button
                aria-label="Menüyü aç/kapat"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-gray-700)",
                  padding: "6px",
                  display: "flex",
                }}
                className="flex md:hidden"
              >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Arama Çubuğu */}
        {isSearchOpen && (
          <div
            style={{
              background: "var(--color-white)",
              borderTop: "1px solid var(--color-border)",
              padding: "16px 24px",
            }}
          >
            <form
              onSubmit={submitSearch}
              className="container"
              style={{ display: "flex", gap: "10px", alignItems: "center" }}
            >
              <Search size={18} color="var(--color-gray-400)" style={{ flexShrink: 0 }} />
              <input
                autoFocus
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ürün ara… (ör. erken hasat, organik)"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "0.95rem",
                  fontFamily: "var(--font-body)",
                  background: "transparent",
                  color: "var(--color-black)",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "var(--color-green)",
                  color: "var(--color-cream)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 18px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ara
              </button>
            </form>
          </div>
        )}

        {/* Mobil Menü */}
        {isMobileOpen && (
          <div
            style={{
              background: "var(--color-cream)",
              borderTop: "1px solid var(--color-border)",
              padding: "16px 24px 24px",
            }}
          >
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[...navLinks, { href: "/favorilerim", label: "Favorilerim" }, { href: "/hesabim", label: "Hesabım" }, { href: "/siparis-takibi", label: "Sipariş Takibi" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "var(--color-gray-700)",
                      textDecoration: "none",
                      display: "block",
                      padding: "8px 0",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

    </>
  );
}
