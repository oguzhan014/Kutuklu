import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rota koruması (Next.js 16'da `middleware` → `proxy` olarak yeniden adlandırıldı).
 *
 * ÖNEMLİ: Burası bir GÜVENLİK SINIRI DEĞİLDİR, yalnızca hızlı bir yönlendirmedir.
 * Burada sadece oturum çerezinin VARLIĞINA bakılır; çerezin geçerliliği ve
 * kullanıcının rolü doğrulanmaz (proxy'nin render koduna ve veritabanına
 * bağlanmaması önerilir).
 *
 * Asıl doğrulama iki yerde yapılır:
 *   1. Layout'larda `auth()` / `getCurrentUser()` ile oturum doğrulaması
 *   2. Her Server Action içinde `requireUser()` / `requireAdmin()` ile
 *      veritabanından rol doğrulaması
 *
 * Böylece sahte bir çerez ile proxy geçilse bile hiçbir korumalı veri okunamaz
 * veya değiştirilemez.
 */

/** Auth.js v5 oturum çerezi adları (http ve https varyantları). */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  // Eski NextAuth v4 adları (geçiş dönemi için)
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin giriş sayfası korumanın dışında kalmalı, aksi hâlde döngü oluşur.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname.startsWith("/hesabim")) {
    const loginUrl = new URL("/giris", request.url);
    // Giriş sonrası kullanıcıyı gitmek istediği sayfaya geri gönder.
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
