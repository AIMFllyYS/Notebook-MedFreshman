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
    "dist-desktop/**",
    "next-env.d.ts",
    "node_modules/**",
    "exhibition-hall/**",
    "showroom/**",
    "docs/refer/**",
    "scripts/one-off/**",
    ".claude/**",
    ".trae/**",
    ".mimocode/**",
    ".workbuddy/**",
    "tmp/**",
    "public/rdkit/**",
  ]),
  // Next 16 工具链把一批存量写法升成 error。计划 18 只建立门禁，不改业务组件；
  // 这些规则降为 warn，后续计划再逐项清理。
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // react-hooks/static-components 已清完，恢复默认 error
      // react-hooks/purity 已清完，恢复默认 error
      // react/no-unescaped-entities、no-explicit-any 已清完，恢复默认 error
    },
  },
  {
    files: ["electron/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["components/**", "lib/hooks/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: [
            "@/lib/ai/agent/tools/**/tool",
            "@/lib/ai/agent/tools/server",
            "**/lib/ai/agent/tools/**/tool",
            "**/lib/ai/agent/tools/server",
          ],
          message: "客户端不得导入 Agent 工具的服务端定义（tool.ts / server.ts），以免把 fs 与密钥打进浏览器 bundle。请从 @/lib/ai/agent/tools 导入类型、presentation 或 ResultCard。",
        }],
      }],
    },
  },
  {
    files: ["components/notes/**", "components/layout/RightPanel.tsx", "components/interactives/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["@/components/chat/*", "@/lib/hooks/useArtifacts", "@/lib/hooks/useDocuments", "@/lib/hooks/useImageGen"],
            message: "AI 对话产物（artifact/document/imageGen）只能由 components/chat 与 AppShell 的全局窗口层渲染，不得在笔记区/右侧 tab 直接引用。见 docs/plans/17 §5。",
          },
          {
            group: [
              "@/lib/ai/agent/tools/**/tool",
              "@/lib/ai/agent/tools/server",
              "**/lib/ai/agent/tools/**/tool",
              "**/lib/ai/agent/tools/server",
            ],
            message: "客户端不得导入 Agent 工具的服务端定义（tool.ts / server.ts），以免把 fs 与密钥打进浏览器 bundle。",
          },
        ],
      }],
    },
  },
  {
    files: ["components/canvas/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@/components/chat/*"], message: "canvas 是纯渲染层，不得反向依赖 chat。" },
          {
            group: [
              "@/lib/ai/agent/tools/**/tool",
              "@/lib/ai/agent/tools/server",
              "**/lib/ai/agent/tools/**/tool",
              "**/lib/ai/agent/tools/server",
            ],
            message: "客户端不得导入 Agent 工具的服务端定义（tool.ts / server.ts），以免把 fs 与密钥打进浏览器 bundle。",
          },
        ],
      }],
    },
  },
  {
    files: ["lib/**"],
    rules: {
      // 存量：lib/markdown 的指令映射仍从 components 拉渲染组件（16 处）。计划 22 再拆，本计划不改业务。
      "no-restricted-imports": ["warn", {
        patterns: [{ group: ["@/components/*"], message: "lib 不得依赖 components。" }],
      }],
    },
  },
  {
    // 必须排在 lib/** 之后：扁平配置同名规则按后写覆盖，否则 hooks 会丢掉 tool.ts 边界。
    files: ["lib/hooks/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@/components/*"], message: "lib 不得依赖 components。" },
          {
            group: [
              "@/lib/ai/agent/tools/**/tool",
              "@/lib/ai/agent/tools/server",
              "**/lib/ai/agent/tools/**/tool",
              "**/lib/ai/agent/tools/server",
            ],
            message: "客户端不得导入 Agent 工具的服务端定义（tool.ts / server.ts），以免把 fs 与密钥打进浏览器 bundle。",
          },
        ],
      }],
    },
  },
]);
