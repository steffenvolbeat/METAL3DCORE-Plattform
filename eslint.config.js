import nextConfig from "eslint-config-next";

// Flat config in ESM; Vercel Next.js expects eslint.config.js (ESM)
export default [
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
