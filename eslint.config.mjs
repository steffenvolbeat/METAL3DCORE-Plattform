// Use CommonJS require to avoid ESM named-export issues on Vercel
const nextConfig = require("eslint-config-next");

module.exports = [
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
