/** 把 Range 覆盖的文本节点包进 <mark>，供划词与引用定位共用。 */

export function wrapRange(range: Range, className = "crayon-highlight"): HTMLElement[] {
  const marks: HTMLElement[] = [];
  const root = range.commonAncestorContainer;
  const walkerRoot =
    root.nodeType === Node.ELEMENT_NODE ? (root as Element) : (root.parentElement as Element);
  if (!walkerRoot) return marks;

  const walker = document.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const tn = node as Text;
    if (range.intersectsNode(tn)) {
      const start = tn === range.startContainer ? range.startOffset : 0;
      const end = tn === range.endContainer ? range.endOffset : tn.length;
      if (start < end) textNodes.push(tn);
    }
  }

  for (const tn of textNodes) {
    const start = tn === range.startContainer ? range.startOffset : 0;
    const end = tn === range.endContainer ? range.endOffset : tn.length;
    const selected = tn.splitText(start);
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
