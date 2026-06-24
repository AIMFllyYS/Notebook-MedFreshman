// Baked, NON-SECRET runtime config for the desktop build.
// These are URLs / model names / modes — safe to ship inside the .exe.
// The 3 real secrets (AI_API_KEY / MIMO_API_KEY / ZHIPU_API_KEY) are NEVER here;
// the user enters them on first run and they are stored encrypted in userData.
// Values mirror the project's .env.local (non-secret fields only). Edit & rebuild
// if your endpoints/models change.
module.exports = {
  AI_BASE_URL: "https://api.siliconflow.cn/v1",
  AI_MODEL_PRO: "deepseek-ai/DeepSeek-V4-Pro",
  AI_MODEL_FLASH: "deepseek-ai/DeepSeek-V4-Flash",
  AI_REASONING_FIELD: "reasoning_content",
  AI_ENABLE_THINKING: "1",
  MIMO_BASE_URL: "https://api.xiaomimimo.com/v1",
  AI_EMBEDDING_MODEL: "BAAI/bge-m3",
  AI_RERANK_MODEL: "BAAI/bge-reranker-v2-m3",
  AI_SEARCH_MODE: "hybrid",
  // Video CDN is client-inlined at BUILD time (NEXT_PUBLIC_*); kept here so the
  // build script can pass it to `next build`. Also harmless at runtime.
  NEXT_PUBLIC_VIDEO_CDN_BASE: "https://qimo1b-1392708216.cos.ap-nanjing.myqcloud.com",
  // Index is bundled offline; this stays as a remote fallback only.
  COS_INDEX_BASE_URL: "https://qimo1b-1392708216.cos.ap-nanjing.myqcloud.com/index/",
};
