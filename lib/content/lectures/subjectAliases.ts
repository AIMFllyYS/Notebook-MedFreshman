// 云盘课程名（中文全称 / 简称）→ 平台 subjectId 的**显式**映射表（P0 契约）。
//
// 为什么需要它：云盘目录、课表、录音文件名用的是中文课程名（如「分析化学」），
// 而站点用的是英文 subjectId。历史上「分析化学」曾被误并进 chemistry（有机化学），
// 因此这里**不做任何模糊匹配 / 关键字包含**，只接受白名单里的精确名称；
// 遇到没登记过的课程名一律抛错，要求先在本表登记，杜绝静默错配。
//
// 纯函数模块，可被客户端 / 服务端 / 脚本共同引用。

import { SUBJECT_IDS, type SubjectId } from "@/lib/content-data/subjects.registry";

const SUBJECT_ID_SET: ReadonlySet<string> = new Set(SUBJECT_IDS);

interface AliasEntry {
  subjectId: SubjectId;
  /** 该学科在云盘 / 课表中可能出现的全部名称（精确匹配，已做去空格归一）。 */
  aliases: string[];
}

/**
 * 登记顺序即「课程 → 学科」的唯一事实源。新增课程接入时在此补一行，
 * 并在 docs/sop/12 的别名表中同步说明。
 */
const ALIAS_TABLE: AliasEntry[] = [
  {
    subjectId: "instrumental-analysis",
    aliases: ["分析化学", "仪器分析", "分析化学与仪器分析"],
  },
  { subjectId: "chemistry", aliases: ["有机化学", "基础化学", "普通化学"] },
  { subjectId: "histology", aliases: ["人体组织学", "组织学与胚胎学", "组织学"] },
  { subjectId: "anatomy", aliases: ["系统解剖学", "解剖学", "人体解剖学"] },
  { subjectId: "cell-biology", aliases: ["细胞生物学", "医学细胞生物学"] },
  {
    subjectId: "biochemistry",
    aliases: ["生物化学与分子生物学", "生物化学", "生化", "分子生物学"],
  },
  { subjectId: "medical-english", aliases: ["医学英语", "专业英语"] },
  {
    subjectId: "probability",
    aliases: ["概率论与数理统计", "概率论", "概率统计", "概率论与数理统计（全英文）"],
  },
  { subjectId: "physics", aliases: ["大学物理", "医用物理学", "物理学"] },
  { subjectId: "modern-history", aliases: ["中国近现代史纲要", "近现代史纲要", "纲要"] },
  {
    subjectId: "maogai",
    aliases: ["毛泽东思想和中国特色社会主义理论体系概论", "毛泽东思想概论", "毛概", "毛中特"],
  },
  { subjectId: "medical-statistics", aliases: ["医学统计学", "卫生统计学"] },
  { subjectId: "cell-biology-lab", aliases: ["医学细胞生物学实验", "细胞生物学实验"] },
];

/**
 * 云盘里已有目录、但平台**尚未建立对应学科**的课程。
 * 这些名称显式登记为「待映射」，遇到时给出可操作的报错，而不是悄悄塞进别的学科。
 */
export const UNMAPPED_COURSE_NAMES: ReadonlySet<string> = new Set([
  "创新管理",
  "医学研究规范与技能",
]);

const NAME_TO_SUBJECT: ReadonlyMap<string, SubjectId> = (() => {
  const m = new Map<string, SubjectId>();
  for (const entry of ALIAS_TABLE) {
    for (const name of entry.aliases) {
      const key = normalizeCourseName(name);
      if (m.has(key)) {
        throw new Error(`subjectAliases 重复登记课程名「${name}」`);
      }
      m.set(key, entry.subjectId);
    }
  }
  return m;
})();

/** 名称归一：去首尾空白、合并内部连续空格、全角括号转半角（仅用于匹配，不改原始值）。 */
export function normalizeCourseName(name: string): string {
  return name
    .trim()
    .replace(/[（）]/g, (ch) => (ch === "（" ? "(" : ch === "）" ? ")" : ch))
    .replace(/\s+/g, " ");
}

export class UnknownCourseError extends Error {
  constructor(public readonly courseName: string) {
    super(
      `未登记的课程名「${courseName}」：请在 lib/content/lectures/subjectAliases.ts 显式映射到对应 subjectId；` +
        `若平台尚无该学科，应先建学科而不是并入相近学科。`,
    );
    this.name = "UnknownCourseError";
  }
}

/** 把云盘课程名解析为平台 subjectId；未登记 / 待映射 / 非合法 SubjectId 时抛错。 */
export function resolveSubjectByCourseName(courseName: string): SubjectId {
  const key = normalizeCourseName(courseName);
  if (UNMAPPED_COURSE_NAMES.has(key)) {
    throw new UnknownCourseError(courseName);
  }
  const subjectId = NAME_TO_SUBJECT.get(key);
  if (!subjectId) throw new UnknownCourseError(courseName);
  if (!SUBJECT_ID_SET.has(subjectId)) {
    throw new Error(`课程「${courseName}」映射到了不存在的 subjectId「${subjectId}」`);
  }
  return subjectId;
}

/** 仅判断是否可解析（不抛错），用于需要分支而非异常的场景。 */
export function isRegisteredCourseName(courseName: string): boolean {
  const key = normalizeCourseName(courseName);
  if (UNMAPPED_COURSE_NAMES.has(key)) return false;
  return NAME_TO_SUBJECT.has(key);
}
