/**
 * useImageAttachments —— 可复用的图片附件管理 hook。
 *
 * 统一处理 paste / drop / file-input 三种图片输入方式，
 * 内置 vision 模型守卫、压缩、预览、错误提示。
 *
 * 任何 AI 对话输入组件均可直接调用：
 * ```ts
 * const { attachments, addFiles, remove, clear, handlePaste, handleDrop, handleDragOver, error } = useImageAttachments();
 * ```
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  filesToAttachments,
  toChatAttachments,
  revokeAttachments,
  getImagesFromClipboard,
  getImagesFromDragEvent,
  type AttachmentPreview,
} from "@/lib/ai/imageUtils";
import { useSettings } from "@/lib/hooks/useSettings";
import { getModelInfo } from "@/lib/ai/models";
import type { ChatAttachment } from "@/lib/types/chat";

export interface UseImageAttachmentsResult {
  /** 当前附件预览列表（含 blob URL）。 */
  attachments: AttachmentPreview[];
  /** 添加 File 列表（自动过滤非图片、压缩、生成预览）。 */
  addFiles: (files: File[]) => Promise<void>;
  /** 移除指定索引的附件。 */
  remove: (idx: number) => void;
  /** 清空全部附件并释放 blob URL。 */
  clear: () => void;
  /** 转换为 API 发送用的 ChatAttachment[]。 */
  toChatFormat: () => ChatAttachment[] | undefined;
  /** textarea 的 onPaste 处理器——直接绑定到组件。 */
  handlePaste: (e: React.ClipboardEvent) => void;
  /** 容器的 onDrop 处理器——直接绑定到组件。 */
  handleDrop: (e: React.DragEvent) => void;
  /** 容器的 onDragOver 处理器——阻止默认行为以允许 drop。 */
  handleDragOver: (e: React.DragEvent) => void;
  /** 容器的 onDragEnter 处理器——维护拖拽计数器。 */
  handleDragEnter: (e: React.DragEvent) => void;
  /** 容器的 onDragLeave 处理器——维护拖拽计数器。 */
  handleDragLeave: (e: React.DragEvent) => void;
  /** 是否正在拖拽图片（用于 UI 高亮）。 */
  isDragging: boolean;
  /** 错误信息（3 秒后自动清除）。 */
  error: string | null;
  /** 手动清除错误。 */
  clearError: () => void;
}

export function useImageAttachments(): UseImageAttachmentsResult {
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // 错误 3 秒自动清除
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  // 组件卸载时释放所有 blob URL
  useEffect(() => {
    return () => {
      setAttachments((prev) => {
        revokeAttachments(prev);
        return [];
      });
    };
  }, []);

  /** 检查当前模型是否支持 vision，不支持则设置错误并返回 false。 */
  const checkVisionSupport = useCallback((): boolean => {
    const modelId = useSettings.getState().selectedModelId;
    const info = getModelInfo(modelId);
    if (info && !info.vision) {
      setError(`当前模型 ${info.label} 不支持图片上传`);
      return false;
    }
    return true;
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if (!checkVisionSupport()) return;
      const { attachments: newOnes, errors } = await filesToAttachments(files);
      if (errors.length > 0) setError(errors[0]);
      if (newOnes.length > 0) {
        setAttachments((prev) => [...prev, ...newOnes]);
      }
    },
    [checkVisionSupport],
  );

  const remove = useCallback((idx: number) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const clear = useCallback(() => {
    setAttachments((prev) => {
      revokeAttachments(prev);
      return [];
    });
  }, []);

  const toChatFormat = useCallback((): ChatAttachment[] | undefined => {
    if (attachments.length === 0) return undefined;
    return toChatAttachments(attachments);
  }, [attachments]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const images = getImagesFromClipboard(e);
      if (images.length === 0) return;
      // 有图片时阻止默认粘贴（避免同时插入图片的文件名文本）
      e.preventDefault();
      addFiles(images);
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      const images = getImagesFromDragEvent(e);
      if (images.length > 0) addFiles(images);
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    // 必须 preventDefault 才能触发 drop
    e.preventDefault();
  }, []);

  // 使用 dragenter/dragleave 维护拖拽计数器（解决子元素闪烁问题）
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    attachments,
    addFiles,
    remove,
    clear,
    toChatFormat,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    isDragging,
    error,
    clearError,
  };
}
