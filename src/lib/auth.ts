import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";

/**
 * Kimlik doğrulama yapılandırması.
 *
 * Güvenlik notları:
 * - Giriş hatalarında TEK ve genel bir mesaj döner. "Kullanıcı bulunamadı" ile
 *   "Hatalı şifre" ayrımı, saldırganın hangi e-postaların kayıtlı olduğunu
 *   öğrenmesini sağlar (user enumeration). Bu ayrım kaldırıldı.
 * - Kullanıcı bulunamadığında da sahte bir bcrypt karşılaştırması yapılır;
 *   böylece yanıt süresinden e-postanın varlığı anlaşılamaz (timing attack).
 * - JWT içindeki `role` hız için taşınır; yetki gerektiren her mutasyon
 *   `requireAdmin()` ile veritabanından yeniden doğrulanır (bkz. auth-guards.ts).
 */

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

// Kullanıcı yokken de sabit maliyetli bir karşılaştırma yapmak için kullanılan
// geçerli ama kimseye ait olmayan bir bcrypt hash'i.
const DUMMY_HASH =
  "$2b$10$WcuzfdS5LEZRq1hRV/14Z.x8hRiIII6sA3l/ucc/gVyPmZQdE343e";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 gün
  },
  trustHost: true,
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          // Girdi biçimi bile hatalıysa yine de genel mesaj dönüyoruz.
          return null;
        }

        const email = parsed.data.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
            image: true,
          },
        });

        // Kullanıcı yoksa bile aynı maliyetli işlemi yaparak zaman sızıntısını kapat.
        const passwordHash = user?.password ?? DUMMY_HASH;
        const isCorrectPassword = await bcrypt.compare(
          parsed.data.password,
          passwordHash
        );

        if (!user || !user.password || !isCorrectPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Profil güncellendiğinde rolü/adı tazele.
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, name: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.name = fresh.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
