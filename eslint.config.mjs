/** ESLint flat config for Next.js (ESM). */
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: new URL("./", import.meta.url).pathname,
  recommendedConfig: false,
  allConfig: false,
});

const config = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: ["**/.next/**", "**/node_modules/**", "coverage/**", "cypress/**", "dist/**", ".vercel/**"],
  },
];

export default config;
