import { ACADEMIC_YEAR_IDS, ACADEMIC_YEAR_LABELS } from "@/lib/constants/academic-year";
import { subjectsOfYear } from "@/lib/content-data/subjects.registry";

export interface DescribeSubjectsByYearOptions {
  /** 默认 false：与 getOutline 工具描述一致，不把「其他」写进学年名单。 */
  includeOther?: boolean;
  /** 默认 short：工具 schema 用短名；global.md 用全名以免漏科。 */
  name?: "short" | "full";
  /** 默认 "/"。 */
  joiner?: string;
}

/** 由 registry 拼出「大二上：细胞生物/生化/…；大一下：概率论/物理/…」。空学期不写入。 */
export function describeSubjectsByYear(opts?: DescribeSubjectsByYearOptions): string {
  const includeOther = opts?.includeOther ?? false;
  const nameKey = opts?.name === "full" ? "name" : "shortName";
  const joiner = opts?.joiner ?? "/";
  return ACADEMIC_YEAR_IDS.map((year) => {
    const names = subjectsOfYear(year)
      .filter((s) => includeOther || s.id !== "other")
      .map((s) => s[nameKey]);
    if (names.length === 0) return null;
    return `${ACADEMIC_YEAR_LABELS[year].replace("学期", "")}：${names.join(joiner)}`;
  })
    .filter((part): part is string => part !== null)
    .join("；");
}
