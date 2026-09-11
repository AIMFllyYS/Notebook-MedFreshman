import { getCategory, getContentItem } from "@/lib/content-data";
import type { LayoutProfile, SubjectId } from "@/lib/types/content";
import { isSubjectId } from "@/lib/types/content";
import { layoutFlags, resolveLayoutProfile, type LayoutRightTab } from "@/lib/content/layoutProfile";

export interface ParsedContentRoute {
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
}

export interface ResolvedRouteLayout {
  route: ParsedContentRoute | null;
  profile: LayoutProfile;
  showRightPanel: boolean;
  rightTabs: LayoutRightTab[];
}

const HOME_RIGHT_TABS: LayoutRightTab[] = ["ai", "video", "interactive", "browser"];

export const HOME_ROUTE_LAYOUT: ResolvedRouteLayout = {
  route: null,
  profile: "full",
  showRightPanel: true,
  rightTabs: HOME_RIGHT_TABS,
};

/** 从 pathname 解析 /[subject]/[category]/[id]；科目或分类无效时视为非内容页。 */
export function parseContentRoute(pathname: string): ParsedContentRoute | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3) return null;
  const [subjectId, categoryId, itemId] = segments;
  if (!isSubjectId(subjectId)) return null;
  if (!getCategory(subjectId, categoryId)) return null;
  return { subjectId, categoryId, itemId };
}

export function resolveRouteLayout(pathname: string): ResolvedRouteLayout {
  const route = parseContentRoute(pathname);
  if (!route) return HOME_ROUTE_LAYOUT;
  const cat = getCategory(route.subjectId, route.categoryId);
  const item = getContentItem(route.subjectId, route.categoryId, route.itemId);
  const profile = resolveLayoutProfile(cat, item);
  const flags = layoutFlags(profile, cat, item);
  return {
    route,
    profile,
    showRightPanel: flags.rightTabs.length > 0,
    rightTabs: flags.rightTabs,
  };
}
