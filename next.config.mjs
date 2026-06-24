/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 桌面打包(Electron)：仅当 BUILD_STANDALONE=1 时产出自包含 standalone server，
  // 并关闭图片优化(免 sharp 原生依赖，便于离线打包)。Web/本地/EdgeOne 构建不受影响。
  ...(process.env.BUILD_STANDALONE === "1"
    ? { output: "standalone", images: { unoptimized: true } }
    : {}),
  // content/ 下的 .md/.json/.html 通过 outputFileTracingIncludes 打包进 standalone，
  // 供 serverless 运行时读取。但 content/.index/ (307MB 向量索引) 必须排除，
  // 否则 EdgeOne 复制 standalone 到 /dev/shm (64MB) 会 ENOSPC。
  // .index/ 改为运行时从 COS 下载到 /tmp 缓存（见 vectorStore.ts / bm25Store.ts）。
  outputFileTracingIncludes: {
    "/api/**": ["./content/**/*", "./lib/ai/prompts/**/*"],
  },
  outputFileTracingExcludes: {
    "/api/**": ["./content/.index/**/*", "./content/_raw/**/*", "./content/examples/**/*"],
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
