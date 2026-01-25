import nextConfig from "eslint-config-next";

// eslint-config-next already returns a flat config array. Spread it and append custom ignores.
const baseConfigs = Array.isArray(nextConfig) ? nextConfig : [nextConfig];

export default [
  ...baseConfigs,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
