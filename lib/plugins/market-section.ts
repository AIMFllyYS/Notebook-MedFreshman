/**
 * 市场分区类型与解析。
 *
 * 单独成文件是因为详情页路由（app/agent/plugins/[section]/[id]/page.tsx）
 * 是 Server Component，只能从「无 React client hook」的模块里取值；
 * market.ts 里有 useMarketManifest，引它会让整个路由树编不过。
 */

/** manifest 顶层分区，也是详情页路由里的 [section]。 */
export type MarketSection = "mcp" | "cli" | "skills";

export const MARKET_SECTIONS: readonly MarketSection[] = ["mcp", "cli", "skills"];

export function parseMarketSection(raw: string): MarketSection | null {
  return (MARKET_SECTIONS as readonly string[]).includes(raw) ? (raw as MarketSection) : null;
}
