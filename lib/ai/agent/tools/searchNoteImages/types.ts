import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface SearchNoteImagesInput {
  query: string;
  crossYear?: boolean;
  subjectId?: string;
  limit?: number;
}

export interface NoteImageHit {
  /** 站内根相对路径，如 /images/anatomy/textbook/p0405_01.png。 */
  src: string;
  alt: string;
  caption: string;
  /** 所在笔记的复合路径，如 anatomy/textbook/ch09-4，可直传 getSection。 */
  path: string;
  subjectId: string;
  categoryId: string;
  itemId: string;
  /** 所在笔记的面包屑标题。 */
  title: string;
  /** 图片前后的正文片段，帮助模型判断是否切题。 */
  context: string;
  score: number;
}

export interface SearchNoteImagesOutput extends TextToolOutput {
  contextKey?: string;
  images: NoteImageHit[];
  deduped?: boolean;
}
