import { useStore } from "@/lib/store";
import { getSubject, getCategory, getContentItem } from "@/lib/content-data";
import type { SubjectId } from "@/lib/types/content";
import type { ReviewCardContext } from "@/lib/review/types";

// 采集「记录」上下文（出处）的单一真相源，供划词 / 右键菜单复用。
// 默认读当前活动路由；复习板内划词传 overrideSubjectId 强制本科目。

export function currentRecordContext(overrideSubjectId?: SubjectId): ReviewCardContext {
  if (overrideSubjectId) {
    const name = getSubject(overrideSubjectId)?.name ?? overrideSubjectId;
    return { subjectId: overrideSubjectId, sourceLabel: `${name} / 复习板` };
  }
  const s = useStore.getState();
  const sid = s.activeSubjectId;
  const cid = s.activeCategoryId;
  const iid = s.activeItemId;
  const subjectName = getSubject(sid)?.name ?? String(sid);
  const catName = cid ? getCategory(sid, cid)?.name ?? cid : "";
  const itemTitle = cid && iid ? getContentItem(sid, cid, iid)?.title ?? iid : "";
  const sourceLabel = [subjectName, catName, itemTitle].filter(Boolean).join(" / ");
  return {
    subjectId: sid,
    categoryId: cid || undefined,
    itemId: iid || undefined,
    sourceLabel,
  };
}
