import { unzipSync, strFromU8 } from "fflate";
import { parseSkillMarkdown, type ParsedSkillMd } from "@/lib/utils/skillFrontmatter";

export type SkillImportKind = "markdown" | "archive" | "unknown";

export interface SkillImportResult {
  skills: ParsedSkillMd[];
  rejected: number;
  errors: string[];
}

const ARCHIVE_EXT = /\.(zip|skill)$/i;
const MARKDOWN_EXT = /\.(md|markdown)$/i;

export function detectSkillImportKind(fileName: string, mime = ""): SkillImportKind {
  if (MARKDOWN_EXT.test(fileName) || mime === "text/markdown") return "markdown";
  if (ARCHIVE_EXT.test(fileName) || mime === "application/zip" || mime === "application/x-zip-compressed") {
    return "archive";
  }
  return "unknown";
}

function isSkippedArchivePath(path: string): boolean {
  const parts = path.split("/");
  return parts.some((part) => part === "__MACOSX" || part.startsWith(".") || part === "Thumbs.db");
}

function folderNameForSkillMd(path: string, archiveName: string): string {
  const folder = path.replace(/\/?SKILL\.md$/i, "");
  const leaf = folder.split("/").filter(Boolean).pop();
  if (leaf) return leaf;
  return archiveName.replace(ARCHIVE_EXT, "") || "skill";
}

/** Agent skills 包：优先每个 SKILL.md；否则收包内全部 Markdown。 */
export function parseSkillArchive(bytes: Uint8Array, archiveName: string): ParsedSkillMd[] {
  const files = unzipSync(bytes);
  const names = Object.keys(files).filter((name) => !name.endsWith("/") && !isSkippedArchivePath(name));
  const skillMdPaths = names.filter((name) => /(^|\/)SKILL\.md$/i.test(name));
  const sources = skillMdPaths.length > 0
    ? skillMdPaths.map((path) => ({ path, fileName: `${folderNameForSkillMd(path, archiveName)}.md` }))
    : names
      .filter((name) => MARKDOWN_EXT.test(name))
      .map((path) => ({ path, fileName: path.split("/").pop() ?? path }));
  return sources.map(({ path, fileName }) => parseSkillMarkdown(strFromU8(files[path]), fileName));
}

export async function importSkillFiles(files: Iterable<File>): Promise<SkillImportResult> {
  const skills: ParsedSkillMd[] = [];
  let rejected = 0;
  const errors: string[] = [];

  for (const file of files) {
    const kind = detectSkillImportKind(file.name, file.type);
    if (kind === "unknown") {
      rejected += 1;
      continue;
    }
    try {
      if (kind === "markdown") {
        skills.push(parseSkillMarkdown(await file.text(), file.name));
        continue;
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const parsed = parseSkillArchive(bytes, file.name);
      if (parsed.length === 0) {
        rejected += 1;
        errors.push(`${file.name} 里没有 SKILL.md 或 Markdown。`);
        continue;
      }
      skills.push(...parsed);
    } catch {
      rejected += 1;
      errors.push(`${file.name} 无法解析。`);
    }
  }

  return { skills, rejected, errors };
}
