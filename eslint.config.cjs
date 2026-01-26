/** ESLint flat config for Next.js (CJS). */
const { FlatCompat } = require("@eslint/eslintrc");

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
