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
};

export default nextConfig;
