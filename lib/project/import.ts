"use client";

import { recordImport } from "@/lib/stores/imports";
import { useProjectFiles } from "@/lib/stores/projectFiles";
import { PROJECT_LIMITS } from "./limits";
import { parseFileToSlices } from "./parse";

export interface ImportProjectFileInput {
  projectId: string;
  file: File;
  /** Electron 下才有：记进导入记录，方便「用系统打开」。 */
  absPath?: string;
}

export interface ImportProjectFileResult {
  id: string | null;
  error?: string;
  note?: string;
}

/**
 * 把一个本地文件导入项目：占位 → 本机解析（索引 + 切片）→ 落库 → 记一条导入记录。
 * 失败只影响这一个文件：条目留在库里并标 error，用户可重试或删掉。
 */
export async function importProjectFile(input: ImportProjectFileInput): Promise<ImportProjectFileResult> {
  const { projectId, file, absPath } = input;
  if (file.size > PROJECT_LIMITS.MAX_TEXT_BYTES) {
    const mb = Math.round(PROJECT_LIMITS.MAX_TEXT_BYTES / (1024 * 1024));
    return { id: null, error: `${file.name} 超过 ${mb} MB，先拆分再导入。` };
  }
  const id = useProjectFiles.getState().beginImport({
    projectId,
    name: file.name,
    absPath,
    mimeType: file.type || undefined,
    sizeBytes: file.size,
    mtime: file.lastModified,
  });
  try {
    const parsed = await parseFileToSlices(file);
    useProjectFiles.getState().finishImport(id, parsed);
    // 资产页「文件」栏据此也能看到它（只存路径与元数据）。
    recordImport({
      kind: "file",
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type || undefined,
      absPath,
      projectId,
      source: "project-files",
    });
    return { id, ...(parsed.note ? { note: parsed.note } : {}) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "解析失败";
    useProjectFiles.getState().failImport(id, message);
    return { id, error: message };
  }
}