import type { Category, CategoryCapability, ContentItem, LayoutProfile } from "@/lib/types/content";

export type { LayoutProfile };

/** 与 `lib/stores/ui.ts` 的 RightTab 同形；此处不 import store，避免 ui → layoutProfile → ui 环。 */
export type LayoutRightTab = "ai" | "video" | "interactive" | "browser";

export function resolveLayoutProfile(
  cat: Pick<Category, "capabilities" | "layoutProfile"> | undefined,
  item?: Pick<ContentItem, "layoutProfile" | "type" | "renderType">,
): LayoutProfile {
  if (item?.layoutProfile) return item.layoutProfile;
  if (cat?.layoutProfile) return cat.layoutProfile;
  const caps = cat?.capabilities ?? [];
  if (caps.includes("examples") || caps.includes("quiz") || caps.includes("media")) return "full";
  if (item?.type === "document") return "article";
  return caps.length === 0 ? "reference" : "article";
}

export interface LayoutFlags {
  showExamplesTab: boolean;
  showQuizTab: boolean;
  showToc: boolean;
  rightTabs: LayoutRightTab[];
  defaultRightCollapsed: boolean;
  articleMaxWidth: "prose" | "wide";
}

function resolveRightTabs(
  profile: LayoutProfile,
  caps: readonly CategoryCapability[],
): LayoutRightTab[] {
  if (profile === "reference" || profile === "article") return ["ai"];
  const tabs: LayoutRightTab[] = ["ai"];
  if (caps.includes("media")) {
    tabs.push("video", "interactive");
  }
  tabs.push("browser");
  return tabs;
}

export function layoutFlags(
  profile: LayoutProfile,
  cat?: Pick<Category, "capabilities" | "layoutProfile">,
  item?: Pick<ContentItem, "layoutProfile" | "type" | "renderType">,
): LayoutFlags {
  const caps = cat?.capabilities ?? [];
  const renderType = item?.renderType ?? "markdown";
  return {
    showExamplesTab: profile === "full" && caps.includes("examples"),
    showQuizTab: profile === "full" && caps.includes("quiz"),
    showToc: renderType === "markdown",
    rightTabs: resolveRightTabs(profile, caps),
    defaultRightCollapsed: profile === "article",
    articleMaxWidth: profile === "full" ? "prose" : "wide",
  };
}
