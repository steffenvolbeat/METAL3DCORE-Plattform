/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**", "cypress/**"],
  },
];

export default config;
