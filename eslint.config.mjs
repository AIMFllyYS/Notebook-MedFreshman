// ESLint 扁平配置（Next.js 16 起 `next lint` 被移除，改由 ESLint CLI 直接驱动：见 package.json 的 lint 脚本）。
// 采用 create-next-app 在 16.x 的标准组合：core-web-vitals + typescript（二者导出均为扁平配置数组，直接展开）。
// 选用 typescript 预设是有意为之——代码中已存在针对 @typescript-eslint/no-explicit-any 的 eslint-disable 注释，
// 说明项目原本即按此规则集编写。注意：Next 16 工具链整体趋严（react-hooks v6 的 set-state-in-effect、
// no-unescaped-entities 等），本仓在升级前从未配置过可用的 lint，故首次启用会暴露存量告警；
// 这些与框架升级无关，lint 在 16 中已与 build 解耦（不阻塞构建），可作为独立的代码质量任务逐步清理。
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  // 构建产物与同仓的独立子项目（各自有自己的 lint 配置/锁文件）不纳入根 lint。
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "exhibition-hall/**",
    "showroom/**",
    "docs/refer/**",
    "**/*.test.ts",
    "**/*.test.tsx",
  ]),
]);
