import { serializeCanvasBlockToSvgDiagram } from '@/lib/canvas/serialize';
import type { CanvasBlock } from '@/lib/canvas/types';

const SVG_DIAGRAM_BLOCK_RE = /<SvgDiagram\b[^>]*(?:\/>|>[\s\S]*?<\/SvgDiagram>)/gi;

export function replaceCanvasBlock(content: string, blockIndex: number, nextBlock: CanvasBlock): string {
  if (!content || blockIndex < 0) return content;

  let current = 0;
  let replaced = false;
  const nextMarkup = serializeCanvasBlockToSvgDiagram(nextBlock);
  const updated = content.replace(SVG_DIAGRAM_BLOCK_RE, (full: string) => {
    if (current !== blockIndex) {
      current += 1;
      return full;
    }
    current += 1;
    replaced = true;
    return nextMarkup;
  });

  return replaced ? updated : content;
}
