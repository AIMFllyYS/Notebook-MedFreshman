import type { Components } from "react-markdown";
import { Callout } from "@/components/shared/directives/Callout";
import { Derivation } from "@/components/shared/directives/Derivation";
import { MediaEmbed } from "@/components/shared/directives/MediaEmbed";
import { Figure } from "@/components/shared/directives/Figure";
import { PlotDirective } from "@/components/canvas/PlotDirective";
import { CanvasDirective } from "@/components/canvas/CanvasDirective";
import { MemoryCard } from "@/components/shared/directives/MemoryCard";
import { Timeline } from "@/components/shared/directives/Timeline";
import { EventCard } from "@/components/shared/directives/EventCard";
import { ConceptCard } from "@/components/shared/directives/ConceptCard";
import { CompareTable } from "@/components/shared/directives/CompareTable";
import { CauseEffect } from "@/components/shared/directives/CauseEffect";
import { KeyPoint } from "@/components/shared/directives/KeyPoint";
import { HistoryMap } from "@/components/shared/directives/HistoryMap";

export const directiveComponents = {
  callout: Callout,
  derivation: Derivation,
  mediaembed: MediaEmbed,
  figuremedia: Figure,
  functionplot: PlotDirective,
  svgcanvas: CanvasDirective,
  memorycard: MemoryCard,
  timeline: Timeline,
  eventcard: EventCard,
  conceptcard: ConceptCard,
  comparetable: CompareTable,
  causeeffect: CauseEffect,
  keypoint: KeyPoint,
  historymap: HistoryMap,
} as unknown as Partial<Components>;
