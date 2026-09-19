/**
 * 项目文件（本地索引 + 切片）的数据形状。
 *
 * 口径（用户确认）：**文件内容不上云**。本机把文件解析成两样东西——
 * 一份「隐藏索引 md」（indexMarkdown）和若干「切片」（slices）；Agent 靠工具按需读切片。
 */

export interface ProjectSlice {
  id: string;
  title: string;
  chars: number;
  /** 首 80 字，给索引用（本地截断，不调模型）。 */
  summary: string;
  text: string;
  /** 用户手动勾选「带入对话」的切片；项目不大时不需要勾（自动全带）。 */
  pinned?: boolean;
}

export type ProjectFileKind = "imported" | "studio-ref";

export type ProjectFileStatus = "indexed" | "parsing" | "error";

/** Studio 教材软链接：只有 path，没有正文，正文由既有 getSection(path) 读。 */
export interface ProjectStudioRef {
  path: string;
  title: string;
  address: string;
  subjectId: string;
  categoryId: string;
  itemId: string;
}

export interface ProjectFileEntry {
  id: string;
  projectId: string;
  kind: ProjectFileKind;
  name: string;
  mimeType?: string;
  sizeBytes?: number;
  mtime?: number;
  /** 本机绝对路径（仅 Electron 拿得到）：只作展示与快捷链接，不上云。 */
  absPath?: string;
  studioRef?: ProjectStudioRef;
  status: ProjectFileStatus;
  error?: string;
  /** 「隐藏索引 md」：文件结构 + 切片表，给人和 Agent 一起看的目录。 */
  indexMarkdown: string;
  charCount: number;
  slices: ProjectSlice[];
  createdAt: number;
  updatedAt: number;
}