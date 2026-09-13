// 课堂原文（逐字稿）→ 发言轮次块（纯函数，服务端 / 脚本共用）。
//
// 背景：旧链路把逐字稿当 Markdown 先 stripMarkdown 再按「# 标题」切块，
// 但逐字稿没有 Markdown 标题，只有 `@说话人 1  01:09` 这样的说话人标记，
// 结果整堂课被并成一块、还丢掉了说话人/时间戳。这里改为按「发言轮次」切块，
// 长发言在句读边界二次切分，并保证切块拼接后可无损还原原文（覆盖率校验）。

export interface TranscriptTurn {
  speaker: string;
  stamp: string;
  text: string;
}

export interface TranscriptBlock extends TranscriptTurn {
  /** 同一轮发言被切成多块时的序号（从 0 起）。 */
  part: number;
}

/** 说话人标记行：`@说话人 1  01:09` 或 `@说话人 2 1:09:32`，独占一行。 */
const SPEAKER_LINE_RE = /^@说话人\s*(\S+)\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*$/;

/** 单块目标字符上限：超过则在句读边界二次切分（仍保证无损）。 */
const DEFAULT_MAX_BLOCK = 600;

/** 仅用于覆盖率比对：去掉全部空白字符。 */
export function normalizeForCoverage(s: string): string {
  return s.replace(/\s+/g, "");
}

/**
 * 把整份逐字稿解析为「发言轮次」（尚未二次切分）。
 * 标记行与正文交替；没有前导标记的正文归入 speaker="" 的轮次（不丢字）。
 */
export function parseTranscriptTurns(raw: string): TranscriptTurn[] {
  const lines = raw.split(/\r?\n/);
  const turns: TranscriptTurn[] = [];
  let cur: TranscriptTurn | null = null;
  const body: string[] = [];

  const flush = () => {
    if (!cur) return;
    const text = body.join("\n").trim();
    if (text) turns.push({ speaker: cur.speaker, stamp: cur.stamp, text });
    body.length = 0;
  };

  for (const line of lines) {
    const m = line.match(SPEAKER_LINE_RE);
    if (m) {
      flush();
      cur = { speaker: m[1], stamp: m[2], text: "" };
    } else if (cur) {
      body.push(line);
    } else {
      // 首个说话人标记之前的散文本（一般为空），保留以免丢字。
      cur = { speaker: "", stamp: "", text: "" };
      body.push(line);
    }
  }
  flush();
  return turns;
}

/**
 * 在句读边界把超长文本切成 join 后与原文**逐字相等**的片段。
 * 找不到句读时硬切，因此永远不会丢字 / 加字。
 */
export function chunkKeep(s: string, maxLen = DEFAULT_MAX_BLOCK): string[] {
  if (maxLen <= 0) throw new Error("chunkKeep maxLen 必须为正");
  const out: string[] = [];
  const boundaries = "。！？!?；;\n";
  let i = 0;
  while (i < s.length) {
    if (s.length - i <= maxLen) {
      out.push(s.slice(i));
      break;
    }
    const win = s.slice(i, i + maxLen);
    let br = -1;
    for (let k = win.length - 1; k >= 0; k--) {
      if (boundaries.includes(win[k])) {
        br = k + 1;
        break;
      }
    }
    if (br <= 0) br = maxLen;
    out.push(s.slice(i, i + br));
    i += br;
  }
  return out.length ? out : [""];
}

/** 逐字稿 → 检索/出题用的发言块（长轮次二次切分，保留说话人与时间戳）。 */
export function extractTranscriptBlocks(
  raw: string,
  maxLen = DEFAULT_MAX_BLOCK,
): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = [];
  for (const turn of parseTranscriptTurns(raw)) {
    const chunks = chunkKeep(turn.text, maxLen);
    chunks.forEach((text, part) => {
      blocks.push({ speaker: turn.speaker, stamp: turn.stamp, part, text });
    });
  }
  return blocks;
}

/** 块 → 带说话人/时间戳前缀的纯文本（检索与题源使用）。 */
export function formatTranscriptBlock(b: TranscriptBlock): string {
  const head = b.speaker ? `@说话人 ${b.speaker} ${b.stamp}`.trim() : "";
  return head ? `${head}\n${b.text}` : b.text;
}
