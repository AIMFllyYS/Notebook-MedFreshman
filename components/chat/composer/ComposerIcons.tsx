import type { SVGProps } from "react";
import type { ForcedComposerTool } from "@/lib/chat/composerIntent";

function Frame({ color, children, ...props }: SVGProps<SVGSVGElement> & { color: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true" focusable="false" {...props}>
      <rect width={18} height={18} rx={5} fill={color} />
      <g fill="none" stroke="#fff" strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function PlanModeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Frame color="#7c3aed" data-composer-icon="plan" {...props}>
      <path d="M5 4.4h8M5 8h8M5 11.6h4.6" />
      <circle cx="12.4" cy="12.2" r="1.7" />
    </Frame>
  );
}

export function GenerateImageToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Frame color="#e11d48" data-composer-icon="generateImage" {...props}>
      <rect x="4.2" y="5" width="9.6" height="8" rx="1.4" />
      <circle cx="7" cy="8" r="1" />
      <path d="m4.6 12.2 2.6-2.4 2.2 2 1.4-1.3 2.4 2.2" />
    </Frame>
  );
}

export function InteractiveHtmlToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Frame color="#0d9488" data-composer-icon="renderInteractive" {...props}>
      <rect x="3.8" y="4.8" width="10.4" height="8.4" rx="1.5" />
      <path d="M6.2 8.2 7.8 9.6 6.2 11M9.2 11.2h2.4" />
    </Frame>
  );
}

export function LongArticleToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Frame color="#d97706" data-composer-icon="writeDocument" {...props}>
      <path d="M6 4.4h4.4L13.2 7v6.6H6z" />
      <path d="M10.2 4.4V7h2.8M7.2 9.2h3.6M7.2 11.4h2.6" />
    </Frame>
  );
}

export function FlashcardToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Frame color="#ea580c" data-composer-icon="flashcards" {...props}>
      <rect x="5.4" y="4.8" width="8" height="6.4" rx="1.2" />
      <path d="M4.6 7.2v5.2a1.2 1.2 0 0 0 1.2 1.2h6.8" />
    </Frame>
  );
}

export function NotesToolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Frame color="#16a34a" data-composer-icon="notes" {...props}>
      <path d="M5.2 4.6h7.6v9H5.2z" />
      <path d="M7.2 4.6v9M8.6 7.4h3M8.6 9.6h2.4" />
    </Frame>
  );
}

const TOOL_ICONS: Record<ForcedComposerTool, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
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
