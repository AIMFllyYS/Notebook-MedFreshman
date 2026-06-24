/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // content/ and manim/ are read at runtime by API routes; keep them out of the
  // webpack module graph so large generated .md files don't bloat the bundle.
  outputFileTracingIncludes: {
    "/api/**": ["./content/**/*", "./lib/ai/prompts/**/*"],
    // 内容页 SSG/按需渲染（dynamicParams）在 Node Function 内经 loader 读取 .md，
    // 需把 content 一并打进函数包，否则未预生成的 id 运行期读不到文件。
    "/[subject]/[category]/[id]": ["./content/**/*"],
  },
  // 重型依赖按需加载，减少首屏 bundle 体积。lucide-react 有 18 处具名图标导入，
  // 加入后 Next 会把 barrel 导入改写为按图标深层导入，显著减小图标库体积。
  // 注意：katex 不可加入——它靠 `import "katex/contrib/mhchem"` 的副作用给 katex 单例打补丁，
  // barrel 优化的深层导入改写会破坏该单例关系，导致 SSR 包里 mhchem 的气体箭头 `^`、三键 `#`
  // 等惰性特性失效（\ce{N2 ^}、\ce{-C#CH} 渲染成红字错误），而 node 直跑无此改写故正常。
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
