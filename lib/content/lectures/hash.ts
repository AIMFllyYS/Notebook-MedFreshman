// 课堂材料内容哈希（服务端专用，node:crypto）。
// 用于把「题」和「当时的原文/笔记文本」绑定：材料一改，哈希就变，校验即可发现题源过期。

import { createHash } from "node:crypto";

function sha256Hex(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

/** 原始文件字节内容的哈希（recording.md / notes.html 原样哈希）。 */
export function hashRawContent(raw: string): string {
  return sha256Hex(raw.replace(/\r\n/g, "\n"));
}

/** 提取后纯文本的哈希（notes.html 用 extractHtmlText 得到的 text 再哈希）。 */
export function hashExtractedText(text: string): string {
  return sha256Hex(text.replace(/\r\n/g, "\n").trim());
}
