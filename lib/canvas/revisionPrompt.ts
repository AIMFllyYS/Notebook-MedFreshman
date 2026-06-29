import type { CanvasBlock } from './types';

interface BuildCanvasRevisionMessagesInput {
  block: CanvasBlock;
  instruction: string;
  topic?: string;
}

export function buildCanvasRevisionMessages({ block, instruction, topic }: BuildCanvasRevisionMessagesInput) {
  return [
    {
      role: 'system' as const,
      content: [
        'You are a local canvas revision engine.',
        'Revise the current canvas for a local-first educational app.',
        'Return exactly one JSON object and nothing else. No markdown fences, no explanations.',
        'Allowed kind values: raw-svg, plot, multi-plot, molecule, html.',
        'You may choose the best kind for the requested update. Preserve the current kind only when it remains the best representation.',
        'For raw-svg, source must be one complete <svg ...>...</svg> document with visible content and a viewBox.',
        'For plot, output a parseable fn string plus attrs. Prefer normal_pdf(x,mu,sigma), gaussian(x,mu,sigma), phi(x), sin, cos, exp, sqrt, log.',
        'For multi-plot, output plots as an array of { fn, label?, color?, samples? } and shared attrs.',
        'For molecule, output a SMILES string in source unless the user asks for a mechanism, projection, or custom drawing.',
        'For html, output a complete HTML document or complete fragment with inline CSS/JS.',
        'If the user asks for JSX or React components, return kind "html" with standalone HTML that loads React/ReactDOM/Babel from CDN or uses vanilla JS. Never return host-app JSX.',
      ].join('\n'),
    },
    {
      role: 'user' as const,
      content: JSON.stringify(
        {
          topic: topic || null,
          instruction,
          currentBlock: block,
          requiredOutputShape: {
            kind: 'raw-svg | plot | multi-plot | molecule | html',
            title: 'optional string',
            width: 'optional number',
            height: 'optional number',
            source: 'required for raw-svg, molecule, html',
            fn: 'required for plot',
            attrs: 'required object for plot and multi-plot',
            plots: 'required array for multi-plot',
          },
        },
        null,
        2,
      ),
    },
  ];
}
