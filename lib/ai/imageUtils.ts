/**
 * 图片附件处理工具 —— 供 AI 对话板块所有输入组件复用。
 *
 * 提供：尺寸压缩、File → base64 转换、File → AttachmentPreview 完整管线。
 * 所有函数纯客户端运行，不依赖 React，可在任意组件或 hook 中调用。
 */

import type { ChatAttachment } from "@/lib/types/chat";

/** 单图最大体积（2 MB），超过则触发 Canvas 压缩。 */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/** 支持的图片 MIME 类型集合。 */
export const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** 压缩后最长边像素上限。 */
const COMPRESS_MAX_DIM = 1920;
/** 压缩质量（0–1）。 */
const COMPRESS_QUALITY = 0.85;

/** 前端预览用的中间结构，包含 blob URL 供 <img> 渲染。 */
export interface AttachmentPreview {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

/**
 * 用 Canvas 将图片缩放至最长边 ≤ maxDim 并输出 JPEG data-url。
 * 小图或不需压缩时直接用 FileReader 读取。
 */
export function compressImage(file: File, maxDim = COMPRESS_MAX_DIM): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", COMPRESS_QUALITY));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** 将 File 读取为 data-url（base64）。 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 将单个图片 File 转换为 AttachmentPreview（含压缩、base64、blob 预览 URL）。
 * 非 image/* 文件抛出 Error。
 */
export async function fileToAttachment(file: File): Promise<AttachmentPreview> {
  if (!file.type.startsWith("image/")) {
    throw new Error("仅支持图片文件（JPG/PNG/GIF/WebP）");
  }
  const needsCompress = file.size > MAX_IMAGE_SIZE;
  const base64 = needsCompress
    ? await compressImage(file)
    : await readFileAsDataUrl(file);
  const previewUrl = URL.createObjectURL(file);
  const mimeType = needsCompress ? "image/jpeg" : file.type;
  return { file, previewUrl, base64, mimeType };
}

/**
 * 批量将 File 列表转换为 AttachmentPreview 列表。
 * 非图片文件会被跳过并收集错误信息。
 */
export async function filesToAttachments(
  files: File[],
): Promise<{ attachments: AttachmentPreview[]; errors: string[] }> {
  const attachments: AttachmentPreview[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      const att = await fileToAttachment(file);
      attachments.push(att);
    } catch (e) {
      errors.push((e as Error).message || `处理 ${file.name} 失败`);
    }
  }
  return { attachments, errors };
}

/** 从 ClipboardEvent 中提取所有图片 File。 */
export function getImagesFromClipboard(e: React.ClipboardEvent | ClipboardEvent): File[] {
  const items = "clipboardData" in e ? e.clipboardData?.items : null;
  if (!items) return [];
  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const f = item.getAsFile();
      if (f) files.push(f);
    }
  }
  return files;
}

/** 从 DragEvent 中提取所有图片 File。 */
export function getImagesFromDragEvent(e: React.DragEvent | DragEvent): File[] {
  const dt = "dataTransfer" in e ? e.dataTransfer : null;
  if (!dt) return [];
  return Array.from(dt.files || []).filter((f) => f.type.startsWith("image/"));
}

/** 将 AttachmentPreview[] 转换为发送给 API 的 ChatAttachment[]。 */
export function toChatAttachments(previews: AttachmentPreview[]): ChatAttachment[] {
  return previews.map((a) => ({
    type: "image" as const,
    mimeType: a.mimeType,
    base64: a.base64,
  }));
}

/** 释放一组 AttachmentPreview 的 blob URL，防止内存泄漏。 */
export function revokeAttachments(previews: AttachmentPreview[]): void {
  previews.forEach((a) => URL.revokeObjectURL(a.previewUrl));
}
