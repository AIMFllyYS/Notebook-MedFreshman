// [已废弃] artifact 生成现在由 /api/artifact 独立 SSE 路由负责。
// 不再使用内存态注册表或主 /api/chat 内联推送 artifact delta。
// 保留空导出以避免潜在的编译引用错误。
export {};
