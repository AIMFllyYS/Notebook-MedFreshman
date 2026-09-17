import type { ReactElement, SVGProps } from "react";
import type { ForcedComposerTool } from "@/lib/chat/composerIntent";

/** 与顶栏红绿灯同形：12px 圆点 + 细描边字形，菜单文字略大于图标。 */
function TrafficGlyph({
  color,
  children,
  ...props
}: SVGProps<SVGSVGElement> & { color: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true" focusable="false" {...props}>
      <circle cx={6} cy={6} r={5.5} fill={color} />
      <g fill="none" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function PlanModeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#7c3aed" data-composer-icon="plan" {...props}>
      <path d="M3.4 4h5.2M3.4 6h5.2M3.4 8h3.1" />
    </TrafficGlyph>
  );
}

export function GenerateImageToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#e11d48" data-composer-icon="generateImage" {...props}>
      <rect x="3.1" y="3.6" width="5.8" height="4.8" rx="1" />
      <path d="m3.4 7.4 1.6-1.5 1.3 1.2.9-.8 1.5 1.3" />
    </TrafficGlyph>
  );
}

export function InteractiveHtmlToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#0d9488" data-composer-icon="renderInteractive" {...props}>
      <path d="M4.1 4.6 5.7 6 4.1 7.4M6.4 7.4h1.7" />
    </TrafficGlyph>
  );
}

export function LongArticleToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#d97706" data-composer-icon="writeDocument" {...props}>
      <path d="M4.2 3.6h2.4L8 5.1v3.4H4.2z" />
      <path d="M6.5 3.6V5.1H8" />
    </TrafficGlyph>
  );
}

export function FlashcardToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#ea580c" data-composer-icon="flashcards" {...props}>
      <rect x="3.6" y="3.5" width="5" height="3.8" rx="0.8" />
      <path d="M3.2 5.1v2.8a.8.8 0 0 0 .8.8h4.2" />
    </TrafficGlyph>
  );
}

export function NotesToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#16a34a" data-composer-icon="notes" {...props}>
      <path d="M3.8 3.5h4.4v5.1H3.8z" />
      <path d="M5.1 3.5v5.1M5.9 5.2h1.7M5.9 6.6h1.3" />
    </TrafficGlyph>
  );
}

export function SkillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <TrafficGlyph color="#2563eb" data-composer-icon="skill" {...props}>
      <path d="M6 3.4v5.2M3.4 6h5.2" />
    </TrafficGlyph>
  );
}

const TOOL_ICONS: Record<ForcedComposerTool, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  generateImage: GenerateImageToolIcon,
  renderInteractive: InteractiveHtmlToolIcon,
  writeDocument: LongArticleToolIcon,
  flashcards: FlashcardToolIcon,
  notes: NotesToolIcon,
};

export function ForcedToolIcon({ tool, ...props }: SVGProps<SVGSVGElement> & { tool: ForcedComposerTool }) {
  const Icon = TOOL_ICONS[tool];
  return <Icon {...props} />;
}
