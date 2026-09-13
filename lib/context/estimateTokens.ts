// 纯函数 token 估算：无 Node.js 依赖，客户端/服务端皆可安全导入。

export function estimateTokens(text: string): number {
  let tokens = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    // CJK Unified Ideographs U+4E00–U+9FFF and Extension A U+3400–U+4DBF (inclusive).
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)) {
      tokens += 2;
    } else if (/[a-zA-Z]/.test(char)) {
      tokens += 0.325;
    } else if (/\s/.test(char)) {
      tokens += 0.2;
    } else {
      tokens += 1;
    }
  }
  return Math.ceil(tokens);
}
