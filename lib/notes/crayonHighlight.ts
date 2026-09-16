/** 把 Range 覆盖的文本节点包进 <mark>，供划词与引用定位共用。 */

export function wrapRange(range: Range, className = "crayon-highlight"): HTMLElement[] {
  const marks: HTMLElement[] = [];
  const root = range.commonAncestorContainer;
  const walkerRoot =
    root.nodeType === Node.ELEMENT_NODE ? (root as Element) : (root.parentElement as Element);
  if (!walkerRoot) return marks;

  // 先拍下起止节点与偏移，再 splitText。跨行 / 多节点时一边切一边读 Range 会错位。
  const startNode = range.startContainer;
  const endNode = range.endContainer;
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;

  const walker = document.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT);
  const planned: { tn: Text; start: number; end: number }[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const tn = node as Text;
    if (!range.intersectsNode(tn)) continue;
    const start = tn === startNode ? startOffset : 0;
    const end = tn === endNode ? endOffset : tn.length;
    if (start < end) planned.push({ tn, start, end });
  }

  for (const { tn, start, end } of planned) {
    const selected = start > 0 ? tn.splitText(start) : tn;
    if (end - start < selected.length) selected.splitText(end - start);
    const mark = document.createElement("mark");
    mark.className = className;
    selected.parentNode!.insertBefore(mark, selected);
    mark.appendChild(selected);
    marks.push(mark);
  }

  return marks;
}

export function unwrapMark(mark: HTMLElement) {
  const parent = mark.parentNode;
  if (!parent) return;
  while (mark.firstChild) {
    parent.insertBefore(mark.firstChild, mark);
  }
  parent.removeChild(mark);
  parent.normalize();
}
