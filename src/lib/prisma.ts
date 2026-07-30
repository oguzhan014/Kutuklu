import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Tek Prisma client / tek connection pool.
 * Dev modunda HMR her dosya değişiminde modülü yeniden çalıştırdığı için
 * instance'ı globalThis üzerinde saklıyoruz; aksi halde pool sayısı sürekli artar.
 */
const globalForPrisma = globalThis as unknown as {
  prismaPool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPool = pool;
  globalForPrisma.prisma = prisma;
}

/** `db` eski kodda kullanılan takma ad — aynı instance'ı işaret eder. */
export const db = prisma;
