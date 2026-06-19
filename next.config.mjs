/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 避免未配置 ESLint 时 next build 触发交互式安装提示；类型检查仍由 tsc 保证。
  eslint: { ignoreDuringBuilds: true },
  // content/ and manim/ are read at runtime by API routes; keep them out of the
  // webpack module graph so large generated .md files don't bloat the bundle.
  outputFileTracingIncludes: {
    "/api/**": ["./content/**/*"],
  },
  // 重型依赖按需加载，减少首屏 bundle 体积。lucide-react 有 18 处具名图标导入，
  // 加入后 Next 会把 barrel 导入改写为按图标深层导入，显著减小图标库体积。
  experimental: {
    optimizePackageImports: ["framer-motion", "katex", "lucide-react"],
  },
};

export default nextConfig;
