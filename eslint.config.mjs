import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Layer boundaries, see docs/ARCHITECTURE.md.
const restrict = (files, patterns) => ({
  files,
  rules: { "no-restricted-imports": ["error", { patterns }] },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  restrict(["src/core/**"], [
    { group: ["react", "react-dom", "next", "next/*"], message: "core must stay framework-free." },
    { group: ["@/config/*", "@/components/*", "@/features/*", "@/app/*"], message: "core cannot depend on outer layers." },
  ]),
  restrict(["src/config/**"], [{ group: ["@/components/*", "@/features/*", "@/app/*"], message: "config cannot depend on outer layers." }]),
  restrict(["src/hooks/**"], [{ group: ["@/components/*", "@/features/*", "@/app/*"], message: "hooks cannot depend on components, features or routes." }]),
  restrict(["src/components/ui/**", "src/components/seo/**", "src/components/icons/**", "src/components/tool/**", "src/components/json/**"], [
    { group: ["@/features/*", "@/components/layout/*", "@/app/*"], message: "Shared components cannot depend on features or layout." },
  ]),
  restrict(["src/features/**"], [{ group: ["@/components/layout/*", "@/app/*"], message: "Features cannot depend on layout or routes." }]),
  restrict(["src/features/tools/*/*.ts", "src/features/converters/*/*.ts", "src/features/utilities/*/*.ts"], [
    { group: ["react", "react-dom", "next", "next/*", "@/components/*", "@/app/*"], message: "Tool helpers and meta must stay framework-free." },
  ]),
  {
    rules: { "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
