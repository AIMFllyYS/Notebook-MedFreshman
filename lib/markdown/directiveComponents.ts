import type { Components } from "react-markdown";
import { Callout } from "@/components/shared/directives/Callout";
import { Derivation } from "@/components/shared/directives/Derivation";
import { MediaEmbed } from "@/components/shared/directives/MediaEmbed";
import { Figure } from "@/components/shared/directives/Figure";
import { PlotDirective } from "@/components/canvas/PlotDirective";
import { CanvasDirective } from "@/components/canvas/CanvasDirective";

export const directiveComponents = {
  callout: Callout,
  derivation: Derivation,
  mediaembed: MediaEmbed,
  figuremedia: Figure,
  functionplot: PlotDirective,
  svgcanvas: CanvasDirective,
} as unknown as Partial<Components>;
