interface SvgRepairPromptInput {
  svg: string;
  title?: string;
  instruction?: string;
  topic?: string;
}

export interface SvgRepairMessage {
  role: 'system' | 'user';
  content: string;
}

export function buildSvgRepairMessages(input: SvgRepairPromptInput): SvgRepairMessage[] {
  const title = input.title?.trim() || 'Untitled SVG diagram';
  const topic = input.topic?.trim() || 'unknown topic';
  const instruction = input.instruction?.trim() || 'Repair the diagram so it is visible and educationally useful.';

  return [
    {
      role: 'system',
      content: [
        'You are an SVG repair engine for an educational chat canvas.',
        'Return only one complete <svg ...>...</svg> document.',
        'Do not output markdown, code fences, explanations, comments, JSON, or XML declarations.',
        'Do not output <think> tags.',
        'Use a valid viewBox and keep all visible geometry inside it.',
        'Use SVG kebab-case attributes such as stroke-width, font-size, text-anchor, and dominant-baseline.',
        'Avoid scripts, event handlers, foreignObject, external images, external fonts, style tags, and style attributes.',
        'Use theme-safe colors: currentColor, var(--diagram-primary), var(--diagram-secondary), var(--diagram-tertiary), var(--diagram-error), var(--diagram-outline), and transparent fills.',
        'Do not rely on white strokes or white fills for visible foreground marks.',
        'Include at least one visible primitive such as path, line, circle, rect, polygon, polyline, ellipse, or text.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Diagram title: ${title}`,
        `Topic/context: ${topic}`,
        `User repair instruction: ${instruction}`,
        '',
        'Current SVG markup:',
        input.svg.slice(0, 12000),
        '',
        'Rewrite the SVG canvas content now. Output only the final complete <svg> root.',
      ].join('\n'),
    },
  ];
}

export function extractSvgRepairMarkup(output: string): string {
  const text = output.trim().replace(/^```(?:svg|xml)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const match = text.match(/<svg\b[\s\S]*<\/svg>/i);
  return (match ? match[0] : text).trim();
}
