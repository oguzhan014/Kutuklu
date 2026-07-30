import * as fs from "node:fs";
import * as path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 CLI .env dosyasını otomatik yüklemiyor; burada elle okuyoruz.
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const url = process.env["DATABASE_URL"];
if (!url) {
  throw new Error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
