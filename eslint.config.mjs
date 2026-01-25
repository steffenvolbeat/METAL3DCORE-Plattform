import { defineConfig } from "eslint";
import nextConfig from "eslint-config-next";

const eslintConfig = defineConfig([
  nextConfig,
  {
    ignores: [
      ".next/**",
      "out/**", 
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
]);

export default eslintConfig;
