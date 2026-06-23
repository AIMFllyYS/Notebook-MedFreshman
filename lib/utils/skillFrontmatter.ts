// 技能 Markdown 解析（纯函数，前端上传时调用）。
// 解析顶部 YAML frontmatter 的 name / description（仅这两字段，正则即可，不引 yaml 库），
// 并剥离 frontmatter 得到正文。缺失时：name 回退文件名、description 回退正文首个非标题段。

export interface ParsedSkillMd {
  name: string;
  description: string;
  /** 已剥离 frontmatter 的正文。 */
  content: string;
}

function stripQuotes(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** 取正文首个非空、非标题、非分隔线的段落，去掉简单 markdown 标记，截断 200 字。 */
function firstParagraph(body: string): string {
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('#')) continue; // 跳过标题
    if (/^([-*=_])\1{2,}$/.test(t)) continue; // 跳过 --- / *** 分隔线
    const clean = t
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) → text
      .replace(/[*_`>]/g, '')
      .trim();
    if (clean) return clean.slice(0, 200);
  }
  return '';
}

export function parseSkillMarkdown(raw: string, fileName: string): ParsedSkillMd {
  const text = raw.replace(/^﻿/, ''); // 去 BOM
  let fmName = '';
  let fmDesc = '';
  let body = text;

  const fm = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (fm) {
    body = text.slice(fm[0].length);
    for (const line of fm[1].split(/\r?\n/)) {
      const kv = /^([A-Za-z_][\w-]*)[ \t]*:[ \t]*(.*)$/.exec(line);
      if (!kv) continue;
      const key = kv[1].toLowerCase();
      if (key === 'name') fmName = stripQuotes(kv[2]);
      else if (key === 'description') fmDesc = stripQuotes(kv[2]);
    }
  }

  const fallbackName = fileName.replace(/\.(md|markdown)$/i, '').trim();
  const name = (fmName || fallbackName || '未命名技能').trim();
  const description = (fmDesc || firstParagraph(body)).trim();

  return { name, description, content: body.trim() };
}
