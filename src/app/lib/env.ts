import "dotenv/config";

const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
const missing = required.filter(key => !process.env[key]);

if (missing.length) {
  console.warn("⚠️ Fehlende Env Variablen:", missing.join(","));
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",
  nextAuthUrl: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
};
