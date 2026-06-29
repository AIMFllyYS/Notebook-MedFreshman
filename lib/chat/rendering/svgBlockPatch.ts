const SVG_DIAGRAM_BLOCK_RE = /(<SvgDiagram\b[^>]*>)([\s\S]*?)(<\/SvgDiagram>)/gi;

export function replaceSvgDiagramBlock(content: string, blockIndex: number, nextSvg: string): string {
  if (!content || blockIndex < 0) return content;

  let current = 0;
  let replaced = false;
  const updated = content.replace(SVG_DIAGRAM_BLOCK_RE, (full, open: string, _body: string, close: string) => {
    if (current !== blockIndex) {
      current++;
      return full;
    }
    current++;
    replaced = true;
    return `${open}${nextSvg}${close}`;
  });

  return replaced ? updated : content;
}
