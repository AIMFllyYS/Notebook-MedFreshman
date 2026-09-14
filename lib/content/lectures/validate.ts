// 课堂内容落盘校验 + 目录构建（服务端 / 脚本专用，允许使用 fs）。
// gen-lectures-manifest 与 check-lectures 共用这一份校验逻辑，保证「生成即校验」。

import fs from "node:fs";
import path from "node:path";
import { CONTENT_ROOT } from "@/lib/content/contentPaths";
import { SUBJECT_IDS, type SubjectId } from "@/lib/content-data/subjects.registry";
import {
  LECTURE_MATERIAL_ROLES,
  LECTURE_QUIZ_SOURCE_ROLES,
  LECTURE_ROLE_SPEC,
  lectureArticleId,
  isValidLessonId,
  type LectureMaterialRole,
} from "@/lib/content/lectures/roles";
import {
  validateLessonManifest,
  type LessonManifest,
} from "@/lib/content/lectures/schema";
import { extractHtmlText, findUnsafeHtml } from "@/lib/content/lectures/extractHtml";
import { parseTranscriptTurns } from "@/lib/content/lectures/extractTranscript";
import { hashExtractedText, hashRawContent } from "@/lib/content/lectures/hash";
import type { LectureCatalogEntry } from "@/lib/content/lectures/catalog";
import type { QuizData } from "@/lib/quiz/types";

/** 单个 memory-card 指令块的原始体积上限（与 remarkDirectives 的 8192 对齐）。 */
export const MEMORY_CARD_RAW_LIMIT = 8192;
const ALLOWED_DIR_FILES = new Set([
  "lesson.json",
  ...LECTURE_MATERIAL_ROLES.map((r) => LECTURE_ROLE_SPEC[r].file),
]);

export interface LessonScanResult {
  entry: LectureCatalogEntry;
  manifest: LessonManifest;
  dirAbs: string;
}

export interface ScanAllResult {
  results: LessonScanResult[];
  errors: string[];
  warnings: string[];
}

function lecturesRoot(subjectId: string): string {
  return path.join(CONTENT_ROOT, subjectId, "lectures");
}

/** 列出所有 content/<subject>/lectures/<lessonId> 目录。 */
export function listLessonDirs(): { subjectId: string; lessonId: string; dirAbs: string }[] {
  const out: { subjectId: string; lessonId: string; dirAbs: string }[] = [];
  if (!fs.existsSync(CONTENT_ROOT)) return out;
  for (const subjectId of SUBJECT_IDS) {
    const root = lecturesRoot(subjectId);
    if (!fs.existsSync(root)) continue;
    for (const lessonId of fs.readdirSync(root)) {
      const dirAbs = path.join(root, lessonId);
      if (!fs.statSync(dirAbs).isDirectory()) continue;
      out.push({ subjectId, lessonId, dirAbs });
    }
  }
  return out;
}

function readUtf8(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

/** 提取 cards.md 中的 :::memory 记忆卡块（兼容别名 :::memory-card；含开标签属性与内部原文）。 */
function extractMemoryCardBlocks(md: string): { attrs: string; body: string }[] {
  const blocks: { attrs: string; body: string }[] = [];
  const re = /:::memory(?:-card)?([^\n]*)\n([\s\S]*?)\n:::/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    blocks.push({ attrs: m[1], body: m[2] });
  }
  return blocks;
}

function validateQuiz(
  subjectId: string,
  manifest: LessonManifest,
  recordingHash: string,
  notesTextHash: string,
  errors: string[],
): void {
  const quizPath = path.join(
    CONTENT_ROOT,
    "quiz",
    subjectId,
    `${manifest.quizId}.json`,
  );
  const raw = readUtf8(quizPath);
  if (raw === null) {
    errors.push(`缺少题源文件 content/quiz/${subjectId}/${manifest.quizId}.json`);
    return;
  }
  let quiz: QuizData;
  try {
    quiz = JSON.parse(raw) as QuizData;
  } catch (e) {
    errors.push(`题源 ${manifest.quizId}.json 不是合法 JSON：${String(e)}`);
    return;
  }
  if (quiz.subjectId !== subjectId) {
    errors.push(
      `题源 ${manifest.quizId}.json 的 subjectId「${quiz.subjectId}」与课程目录「${subjectId}」不一致`,
    );
  }
  if (quiz.chapterId !== manifest.quizId) {
    errors.push(
      `题源 ${manifest.quizId}.json 的 chapterId「${quiz.chapterId}」应等于 quizId「${manifest.quizId}」`,
    );
  }
  for (const q of quiz.questions ?? []) {
    const src = q.sourceRef?.source;
    if (src && !(LECTURE_QUIZ_SOURCE_ROLES as readonly string[]).includes(src)) {
      errors.push(
        `题 ${q.id} 的 sourceRef.source「${src}」非法：课堂测验题源只允许 ${LECTURE_QUIZ_SOURCE_ROLES.join(" / ")}`,
      );
    }
  }
  // 可选但推荐：contentRef 把题与当节材料哈希绑定，材料改动后校验会提示题源过期。
  const ref = quiz.contentRef;
  if (ref) {
    if (ref.lessonId !== manifest.lessonId) {
      errors.push(`题源 contentRef.lessonId「${ref.lessonId}」与「${manifest.lessonId}」不一致`);
    }
    if (ref.revision !== manifest.revision) {
      errors.push(
        `题源 contentRef.revision「${ref.revision}」与 lesson.json revision「${manifest.revision}」不一致（材料升版后需重新出题并更新绑定）`,
      );
    }
    if (ref.recordingHash && ref.recordingHash !== recordingHash) {
      errors.push(`题源 contentRef.recordingHash 与当前 recording.md 不一致（题源已过期，需重新出题）`);
    }
    if (ref.notesTextHash && ref.notesTextHash !== notesTextHash) {
      errors.push(`题源 contentRef.notesTextHash 与当前 notes.html 提取文本不一致（题源已过期）`);
    }
  }
}

/** 校验并构建单节课条目。 */
export function validateLesson(
  subjectId: SubjectId,
  dirLessonId: string,
  dirAbs: string,
): { result?: LessonScanResult; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isValidLessonId(dirLessonId)) {
    errors.push(`目录名「${dirLessonId}」不是合法 lessonId（rec-YYYY-season-NNN[-NNN]）`);
  }

  // 目录内文件白名单：一节课只允许 lesson.json + 四份固定材料。
  const present = fs.readdirSync(dirAbs);
  for (const name of present) {
    const p = path.join(dirAbs, name);
    if (fs.statSync(p).isDirectory()) {
      errors.push(`课节目录不允许嵌套子目录：${name}`);
    } else if (!ALLOWED_DIR_FILES.has(name)) {
      errors.push(`课节目录出现未授权文件「${name}」：只允许 lesson.json 与四份固定材料`);
    }
  }

  const metaPath = path.join(dirAbs, "lesson.json");
  const metaRaw = readUtf8(metaPath);
  if (metaRaw === null) {
    errors.push("缺少 lesson.json");
    return { errors, warnings };
  }
  let parsedMeta: unknown;
  try {
    parsedMeta = JSON.parse(metaRaw);
  } catch (e) {
    errors.push(`lesson.json 不是合法 JSON：${String(e)}`);
    return { errors, warnings };
  }

  const res = validateLessonManifest(parsedMeta, {
    expectedDirSubjectId: subjectId,
    expectedDirLessonId: dirLessonId,
  });
  if (!res.ok || !res.manifest) {
    errors.push(...res.errors);
    return { errors, warnings };
  }
  const manifest = res.manifest;

  const materialRaw: Record<LectureMaterialRole, string> = {} as never;
  for (const role of LECTURE_MATERIAL_ROLES) {
    const spec = LECTURE_ROLE_SPEC[role];
    const file = path.join(dirAbs, spec.file);
    const raw = readUtf8(file);
    if (raw === null) {
      errors.push(`缺少材料 ${spec.file}`);
      continue;
    }
    if (!raw.trim()) errors.push(`材料 ${spec.file} 内容为空`);
    materialRaw[role] = raw;
  }

  let notesTextHash = "";
  if (materialRaw.notes) {
    const unsafe = findUnsafeHtml(materialRaw.notes);
    if (unsafe.length) errors.push(`notes.html 静态安全检查未通过：${unsafe.join("；")}`);
    try {
      const extracted = extractHtmlText(materialRaw.notes);
      notesTextHash = hashExtractedText(extracted.text);
    } catch (e) {
      errors.push(`notes.html 文本提取失败：${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (materialRaw.recording) {
    const turns = parseTranscriptTurns(materialRaw.recording);
    if (turns.length === 0) errors.push("recording.md 未解析出任何发言轮次");
    else if (!turns.some((t) => t.speaker)) {
      warnings.push(`${dirLessonId} recording.md 没有「@说话人 N HH:MM」标记，按纯文本处理`);
    }
  }
  if (materialRaw.cards) {
    const blocks = extractMemoryCardBlocks(materialRaw.cards);
    if (blocks.length === 0) {
      warnings.push(`${dirLessonId} cards.md 没有 :::memory 记忆卡块`);
    }
    for (const b of blocks) {
      if (!/\bmode\s*=\s*["']?reveal/.test(b.attrs)) {
        errors.push("cards.md 的 :::memory 必须使用 mode=\"reveal\"（新手卡不再走默认逐行勾选/挖空）");
      }
      if (b.body.length > MEMORY_CARD_RAW_LIMIT) {
        errors.push(
          `cards.md 存在体积 ${b.body.length} > ${MEMORY_CARD_RAW_LIMIT} 的 :::memory，需拆卡而不是静默降级`,
        );
      }
    }
  }

  const recordingHash = materialRaw.recording ? hashRawContent(materialRaw.recording) : "";
  validateQuiz(subjectId, manifest, recordingHash, notesTextHash, errors);

  const entry: LectureCatalogEntry = {
    subjectId: manifest.subjectId,
    lessonId: manifest.lessonId,
    courseInstanceId: manifest.courseInstanceId,
    courseName: manifest.courseName,
    sessionRange: manifest.sessionRange,
    taughtOn: manifest.taughtOn,
    topic: manifest.topic,
    revision: manifest.revision,
    quizId: manifest.quizId,
    materials: Object.fromEntries(
      LECTURE_MATERIAL_ROLES.map((role) => [
        role,
        {
          role,
          file: LECTURE_ROLE_SPEC[role].file,
          format: LECTURE_ROLE_SPEC[role].render,
          articleId: lectureArticleId(manifest.lessonId, role),
        },
      ]),
    ) as LectureCatalogEntry["materials"],
    hashes: { recording: recordingHash, notesText: notesTextHash },
  };

  return { result: { entry, manifest, dirAbs }, errors, warnings };
}

/** 扫描并校验全部课节，同时做跨课节唯一性 / 节次重叠检查。 */
export function validateAllLessons(): ScanAllResult {
  const results: LessonScanResult[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  // lessonId / articleId 只要求「学科内唯一」：节次是课程内累计，不同学科天然会出现
  // 相同的 rec-2026-fall-001-002（路由 / 物理目录 / quiz 都以 subjectId 为命名空间）。
  const seenLesson = new Set<string>();
  const seenArticle = new Set<string>();
  const perSubjectRanges = new Map<string, Array<{ range: [number, number]; id: string }>>();

  for (const dir of listLessonDirs()) {
    const r = validateLesson(dir.subjectId as SubjectId, dir.lessonId, dir.dirAbs);
    errors.push(...r.errors.map((e) => `[${dir.subjectId}/${dir.lessonId}] ${e}`));
    warnings.push(...r.warnings.map((w) => `[${dir.subjectId}/${dir.lessonId}] ${w}`));
    if (!r.result) continue;
    const { entry } = r.result;
    const lessonKey = `${entry.subjectId}/${entry.lessonId}`;
    if (seenLesson.has(lessonKey)) errors.push(`同学科 lessonId 重复：${lessonKey}`);
    seenLesson.add(lessonKey);
    for (const role of LECTURE_MATERIAL_ROLES) {
      const aid = entry.materials[role].articleId;
      const articleKey = `${entry.subjectId}/${aid}`;
      if (seenArticle.has(articleKey)) errors.push(`同学科文章 id 重复：${articleKey}`);
      seenArticle.add(articleKey);
    }
    const list = perSubjectRanges.get(entry.subjectId) ?? [];
    const [s, e] = [entry.sessionRange.start, entry.sessionRange.end];
    for (const prev of list) {
      if (!(e < prev.range[0] || s > prev.range[1])) {
        errors.push(
          `[${entry.subjectId}] 课节 ${entry.lessonId} 的节次 ${s}-${e} 与 ${prev.id} 重叠`,
        );
      }
    }
    list.push({ range: [s, e], id: entry.lessonId });
    perSubjectRanges.set(entry.subjectId, list);
    results.push(r.result);
  }

  // 稳定排序：学科 → 上课日期 → 起始节次。
  results.sort(
    (a, b) =>
      a.entry.subjectId.localeCompare(b.entry.subjectId) ||
      a.entry.taughtOn.localeCompare(b.entry.taughtOn) ||
      a.entry.sessionRange.start - b.entry.sessionRange.start,
  );
  return { results, errors, warnings };
}
