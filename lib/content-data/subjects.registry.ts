// 学科元数据单一真相源。
// 新增学科只需在 SUBJECT_REGISTRY 追加一个对象；SubjectId 类型、学年归属、图标、颜色、
// 中文名、AI 提示词文件名全部由此派生，不要在别处再写一份学科表。
import type { AcademicYearId } from "@/lib/constants/academic-year";
import type { SubjectIconName } from "@/lib/ui/subjectIcons";

export interface SubjectMeta {
  id: string;
  /** 完整中文名（侧边栏 / 书架 / AI 提示词） */
  name: string;
  /** 移动端顶栏等窄空间用的短名 */
  shortName: string;
  /** lucide 图标名，必须在 lib/ui/subjectIcons.ts 白名单内 */
  icon: SubjectIconName;
  /** 学科主色（书脊 / 图标 / 水印） */
  color: string;
  year: AcademicYearId;
  /** 相对 lib/ai/prompts/ 的学科提示词文件；缺省为 subjects/{id}.md（不存在则只用 global.md） */
  promptFile?: string;
  /** 内容目录覆盖：仅概率论 detail 沿用历史目录 content/chapters */
  contentRoot?: { detail?: "chapters" };
}

export const SUBJECT_REGISTRY = [
  {
    id: "probability",
    name: "概率论与数理统计",
    shortName: "概率论",
    icon: "Calculator",
    color: "#6366f1",
    year: "freshman-2",
    contentRoot: { detail: "chapters" },
  },
  { id: "physics", name: "大学物理", shortName: "物理", icon: "Atom", color: "#0ea5e9", year: "freshman-2" },
  { id: "chemistry", name: "有机化学", shortName: "有机", icon: "FlaskConical", color: "#10b981", year: "freshman-2" },
  { id: "modern-history", name: "中国近现代史纲要", shortName: "近代史", icon: "BookOpen", color: "#ef4444", year: "freshman-2" },
  {
    id: "maogai",
    name: "毛泽东思想和中国特色社会主义理论体系概论",
    shortName: "毛概",
    icon: "Scale",
    color: "#f59e0b",
    year: "freshman-2",
  },
  { id: "other", name: "其他", shortName: "其他", icon: "FolderOpen", color: "#64748b", year: "freshman-2" },
  { id: "cell-biology", name: "医学细胞生物学", shortName: "细胞生物", icon: "Microscope", color: "#a855f7", year: "sophomore-1" },
  { id: "biochemistry", name: "生物化学与分子生物学", shortName: "生化", icon: "Dna", color: "#ec4899", year: "sophomore-1" },
  { id: "anatomy", name: "系统解剖学", shortName: "系统解剖", icon: "Bone", color: "#f97316", year: "sophomore-1" },
  { id: "histology", name: "组织学与胚胎学", shortName: "组胚", icon: "Layers", color: "#14b8a6", year: "sophomore-1" },
  { id: "instrumental-analysis", name: "仪器分析", shortName: "仪分", icon: "ScanLine", color: "#2563eb", year: "sophomore-1" },
] as const satisfies readonly SubjectMeta[];

export type SubjectId = (typeof SUBJECT_REGISTRY)[number]["id"];

export const SUBJECT_IDS: readonly SubjectId[] = SUBJECT_REGISTRY.map((s) => s.id);

export const SUBJECT_BY_ID: Record<SubjectId, SubjectMeta> = Object.fromEntries(
  SUBJECT_REGISTRY.map((s) => [s.id, s]),
) as Record<SubjectId, SubjectMeta>;

export function isSubjectId(value: unknown): value is SubjectId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SUBJECT_BY_ID, value);
}

/** 未知 id 返回 undefined，调用方自行回退。 */
export function getSubjectMeta(id: string): SubjectMeta | undefined {
  return isSubjectId(id) ? SUBJECT_BY_ID[id] : undefined;
}

/** 学科中文名；未知 id 原样返回。 */
export function subjectName(id: string | undefined | null): string {
  if (!id) return "";
  return getSubjectMeta(id)?.name ?? id;
}

/** 学科短名；未知 id 回退完整名 / 原 id。 */
export function subjectShortName(id: string | undefined | null): string {
  if (!id) return "";
  const meta = getSubjectMeta(id);
  return meta?.shortName ?? meta?.name ?? id;
}

/** 学科主色（未知回退石板灰）。 */
export function subjectColor(id: string): string {
  return getSubjectMeta(id)?.color ?? "#64748b";
}

/** 学科 icon 名（未知回退 Folder）。 */
export function subjectIconName(id: string): SubjectIconName {
  return getSubjectMeta(id)?.icon ?? "Folder";
}

export function subjectsOfYear(year: AcademicYearId): readonly SubjectMeta[] {
  return SUBJECT_REGISTRY.filter((s) => s.year === year);
}

/** manifest 中 Subject 节点的头部字段，避免在 contentTree 里重复写 name / icon。 */
export function subjectHeader(id: SubjectId): { id: SubjectId; name: string; icon: string } {
  const meta = SUBJECT_BY_ID[id];
  return { id, name: meta.name, icon: meta.icon };
}
