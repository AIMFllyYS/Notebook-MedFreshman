/** BM25 索引构建与紧凑 JSON 编解码。构建文本含标题加权（章节名重复两次）。 */

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let englishBuf = "";

  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code > 0x4dff && code < 0x9fff) {
      if (englishBuf.trim()) {
        tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
        englishBuf = "";
      }
      tokens.push(char);
    } else if (/[a-zA-Z0-9]/.test(char)) {
      englishBuf += char;
    } else if (englishBuf.trim()) {
      tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
      englishBuf = "";
    }
  }
  if (englishBuf.trim()) {
    tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
  }

  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    result.push(tokens[i]);
    if (
      i < tokens.length - 1 &&
      tokens[i].length === 1 &&
      tokens[i + 1].length === 1 &&
      tokens[i].codePointAt(0)! > 0x4dff &&
      tokens[i + 1].codePointAt(0)! > 0x4dff
    ) {
      result.push(tokens[i] + tokens[i + 1]);
    }
  }
  return result;
}

/** 去掉科目 / 板块前缀，只留章节与小节名。 */
export function shortTitleForIndex(title: string): string {
  const parts = title.split(" > ").map((p) => p.trim()).filter(Boolean);
  return (parts.length > 2 ? parts.slice(2) : parts).join(" ") || title;
}

export function bm25DocumentText(title: string, text: string): string {
  const short = shortTitleForIndex(title);
  return `${short} ${short}\n${text}`;
}

export interface CompactBm25Index {
  version: 3;
  builtAt: string;
  avgDocLen: number;
  docCount: number;
  ids: string[];
  invertedIndex: Record<string, { df: number; p: number[] }>;
  docLengths: number[];
}

export interface RuntimeBm25Index {
  builtAt: string;
  avgDocLen: number;
  docCount: number;
  invertedIndex: Record<string, { df: number; postings: Array<{ id: string; tf: number }> }>;
  docLengths: Record<string, number>;
}

export function buildCompactBm25Index(
  chunks: Array<{ id: string; title: string; text: string }>,
): CompactBm25Index {
  const ids = chunks.map((c) => c.id);
  const idToIdx = new Map(ids.map((id, i) => [id, i]));
  const invertedIndex: Record<string, { df: number; p: number[] }> = {};
  const docLengths: number[] = new Array(chunks.length);
  let totalLen = 0;

  for (const chunk of chunks) {
    const idx = idToIdx.get(chunk.id)!;
    const terms = tokenize(bm25DocumentText(chunk.title, chunk.text));
    docLengths[idx] = terms.length;
    totalLen += terms.length;

    const termFreqs: Record<string, number> = {};
    for (const term of terms) termFreqs[term] = (termFreqs[term] || 0) + 1;

    for (const [term, tf] of Object.entries(termFreqs)) {
      if (!invertedIndex[term]) invertedIndex[term] = { df: 0, p: [] };
      invertedIndex[term].df += 1;
      invertedIndex[term].p.push(idx, tf);
    }
  }

  return {
    version: 3,
    builtAt: new Date().toISOString(),
    avgDocLen: chunks.length > 0 ? totalLen / chunks.length : 0,
    docCount: chunks.length,
    ids,
    invertedIndex,
    docLengths,
  };
}

export function parseBm25Index(raw: unknown): RuntimeBm25Index | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version === 3 && Array.isArray(obj.ids)) {
    const compact = obj as unknown as CompactBm25Index;
    const invertedIndex: RuntimeBm25Index["invertedIndex"] = {};
    for (const [term, entry] of Object.entries(compact.invertedIndex ?? {})) {
      const postings: Array<{ id: string; tf: number }> = [];
      const p = entry.p ?? [];
      for (let i = 0; i + 1 < p.length; i += 2) {
        const id = compact.ids[p[i]];
        if (!id) continue;
        postings.push({ id, tf: p[i + 1] });
      }
      invertedIndex[term] = { df: entry.df, postings };
    }
    const docLengths: Record<string, number> = {};
    compact.ids.forEach((id, i) => {
      docLengths[id] = compact.docLengths[i] ?? 1;
    });
    return {
      builtAt: compact.builtAt,
      avgDocLen: compact.avgDocLen,
      docCount: compact.docCount,
      invertedIndex,
      docLengths,
    };
  }

  const inverted = obj.invertedIndex as RuntimeBm25Index["invertedIndex"] | undefined;
  const docLengths = obj.docLengths as Record<string, number> | undefined;
  if (!inverted || !docLengths) return null;
  return {
    builtAt: typeof obj.builtAt === "string" ? obj.builtAt : "",
    avgDocLen: Number(obj.avgDocLen) || 0,
    docCount: Number(obj.docCount) || 0,
    invertedIndex: inverted,
    docLengths,
  };
}
