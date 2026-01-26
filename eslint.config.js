/** ESLint flat config for Next.js (CJS). */
require("@rushstack/eslint-patch/modern-module-resolution");

const { FlatCompat } = require("@eslint/eslintrc");

// Use FlatCompat to consume the legacy Next.js shareable config in flat mode
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: false,
  allConfig: false,
});

module.exports = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: ["**/.next/**", "**/node_modules/**", "coverage/**", "cypress/**", "dist/**", ".vercel/**"],
  },
];
