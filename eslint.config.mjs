import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    // `next lint` used to ignore these by default
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier",
    "plugin:prettier/recommended",
  ),
];

export default eslintConfig;
