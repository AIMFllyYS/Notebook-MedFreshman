import { PROJECT_LIMITS } from "./limits";
import type { ProjectFileEntry, ProjectFileStatus, ProjectStudioRef } from "./types";

/**
 * 请求体里携带的「项目文件目录」与「本轮切片」构造器。纯函数。
 *
 * 为什么这么拆：服务端工具读不到浏览器 IndexedDB（见 lib/ai/agent/tools/_shared.ts 的既有范式），
 * 所以目录（小）随每次请求上行，正文（大）只在「本轮携带」的范围内上行。
 */

export interface ProjectSliceIndexItem {
  sliceId: string;
  title: string;
  chars: number;
  summary: string;
}

export interface ProjectFileCatalogItem {
  fileId: string;
  name: string;
  kind: ProjectFileEntry["kind"];
  status: ProjectFileStatus;
  error?: string;
  /** Studio 教材软链接：只有 path，正文由既有 getSection(path) 读。 */
  studioRef?: ProjectStudioRef;
  slices: ProjectSliceIndexItem[];
}

export interface ProjectCatalog {
  projectId: string;
  files: ProjectFileCatalogItem[];
  bytes: number;
  /** 目录超上限被裁过（工具里会说明，避免模型以为文件就这么点切片）。 */
  truncated: boolean;
}

function toCatalogItem(file: ProjectFileEntry): ProjectFileCatalogItem {
  return {
    fileId: file.id,
    name: file.name,
    kind: file.kind,
    status: file.status,
    ...(file.error ? { error: file.error } : {}),
    ...(file.studioRef ? { studioRef: file.studioRef } : {}),
    slices: file.slices.map((slice) => ({
      sliceId: slice.id,
      title: slice.title,
      chars: slice.chars,
      summary: slice.summary,
    })),
  };
}

function byteSize(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function buildProjectCatalog(files: ProjectFileEntry[], projectId: string): ProjectCatalog {
  const items = files
    .filter((file) => file.projectId === projectId)
    .map(toCatalogItem)
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));

  let truncated = false;
  let bytes = byteSize(items);
  // 超上限就从最后一片开始砍（前面的文件保留完整目录），并在结果里标明被裁过。
  while (bytes > PROJECT_LIMITS.MAX_CATALOG_BYTES && items.some((item) => item.slices.length > 0)) {
    truncationPass: {
      for (let index = items.length - 1; index >= 0; index -= 1) {
        const item = items[index]!;
        if (item.slices.length === 0) continue;
        item.slices = item.slices.slice(0, Math.max(0, item.slices.length - 1));
        truncated = true;
        break truncationPass;
      }
    }
    bytes = byteSize(items);
  }

  return { projectId, files: items, bytes, truncated };
}

export interface ProjectSlicePayload {
  fileId: string;
  sliceId: string;
  title: string;
  text: string;
}

export interface CarryPlan {
  /** all = 项目不大，默认全带；pinned = 只带用户勾的；none = 没有可带的内容。 */
  mode: "all" | "pinned" | "none";
  sliceIds: string[];
  chars: number;
  /** 项目切片正文总字数（用来告诉用户「已带入 N 片 / 共 M 片」）。 */
  totalChars: number;
  totalSlices: number;
  truncated: boolean;
}

/**
 * 携带计划：正文合计 ≤ MAX_CARRY_CHARS 就全部默认带上（用户不用手动勾），
 * 超了才只带 pinned 的切片（窗口里明确显示已带入多少片）。
 */
export function planCarry(files: ProjectFileEntry[], projectId?: string): CarryPlan {
  const pool = files.filter(
    (file) => file.kind === "imported" && (projectId === undefined || file.projectId === projectId),
  );
  const totalSlices = pool.reduce((sum, file) => sum + file.slices.length, 0);
  const totalChars = pool.reduce(
    (sum, file) => sum + file.slices.reduce((inner, slice) => inner + slice.chars, 0),
    0,
  );
  if (totalSlices === 0) {
    return { mode: "none", sliceIds: [], chars: 0, totalChars, totalSlices, truncated: false };
  }
  if (totalChars <= PROJECT_LIMITS.MAX_CARRY_CHARS) {
    return {
      mode: "all",
      sliceIds: [],
      chars: totalChars,
      totalChars,
      totalSlices,
      truncated: false,
    };
  }
  const pinned = pool.flatMap((file) => file.slices.filter((slice) => slice.pinned).map((slice) => slice.id));
  if (pinned.length === 0) {
    return { mode: "none", sliceIds: [], chars: 0, totalChars, totalSlices, truncated: true };
  }
  return {
    mode: "pinned",
    sliceIds: pinned,
    chars: 0,
    totalChars,
    totalSlices,
    truncated: true,
  };
}

export interface SliceBodyResult {
  payloads: ProjectSlicePayload[];
  chars: number;
  truncated: boolean;
}

/** 按携带计划取出切片正文；总额仍以 MAX_CARRY_CHARS 封顶。 */
export function buildProjectSliceBodies(
  files: ProjectFileEntry[],
  plan: CarryPlan,
  projectId?: string,
): SliceBodyResult {
  const pool = files.filter(
    (file) => file.kind === "imported" && (projectId === undefined || file.projectId === projectId),
  );
  const pinnedSet = new Set(plan.sliceIds);
  const payloads: ProjectSlicePayload[] = [];
  let chars = 0;
  let truncated = false;
  for (const file of pool) {
    for (const slice of file.slices) {
      const carried = plan.mode === "all" || pinnedSet.has(slice.id);
      if (!carried) continue;
      if (chars + slice.chars > PROJECT_LIMITS.MAX_CARRY_CHARS) {
        truncated = true;
        continue;
      }
      chars += slice.chars;
      payloads.push({ fileId: file.id, sliceId: slice.id, title: slice.title, text: slice.text });
    }
  }
  return { payloads, chars, truncated };
}