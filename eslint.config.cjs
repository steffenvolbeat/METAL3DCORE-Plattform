// CJS ESLint config for Vercel
const nextConfig = require("eslint-config-next");

module.exports = [
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
