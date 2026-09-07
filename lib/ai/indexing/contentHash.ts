import { createHash } from "node:crypto";

export function contentHashOf(chunks: Array<{ id: string; text: string }>): string {
  const h = createHash("sha256");
  for (const c of chunks) {
    h.update(c.id);
    h.update("\n");
    h.update(c.text);
    h.update("\n");
  }
  return h.digest("hex");
}
