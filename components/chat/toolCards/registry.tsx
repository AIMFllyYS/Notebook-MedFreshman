import type { ComponentType } from "react";
import type { StudyToolName } from "@/lib/ai/agent/tools/names";
import type { NoteImageHit, SearchHit } from "@/lib/ai/agent/toolTypes";
import type { ResultCardProps, ToolModule, ToolPart, ToolPresentation } from "@/lib/ai/agent/tools/registry";
import { TOOL_PRESENTATION } from "@/lib/ai/agent/tools/presentations";
import { noteImageItemKey, noteItemKey, webItemKey } from "@/lib/chat/traceSources";
import type { WebSearchSource } from "@/lib/types/chat";
import SearchNotesResultCard from "@/components/chat/toolCards/searchNotesCard";
import WebSearchResultCard from "@/components/chat/toolCards/webSearchCard";
import RenderInteractiveResultCard from "@/components/chat/toolCards/renderInteractiveCard";
import GenerateImageResultCard from "@/components/chat/toolCards/generateImageCard";
import CreateQuizResultCard from "@/components/chat/toolCards/createQuizCard";
import SearchNoteImagesResultCard from "@/components/chat/toolCards/searchNoteImagesCard";
import WriteDocumentResultCard from "@/components/chat/toolCards/writeDocumentCard";
import ImageSearchResultCard from "@/components/chat/toolCards/imageSearchCard";

function moduleOf<N extends StudyToolName>(
  name: N,
  extras: Omit<ToolModule<N>, "name" | "presentation"> = {},
): ToolModule<N> {
  return { name, presentation: TOOL_PRESENTATION[name], ...extras };
}

export const TOOL_REGISTRY = {
  getCurrentPage: moduleOf("getCurrentPage"),
  getOutline: moduleOf("getOutline"),
  getSection: moduleOf("getSection"),
  searchNotes: moduleOf("searchNotes", {
    ResultCard: SearchNotesResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.hits?.length,
    aggregate: true,
    itemKey: (item) => noteItemKey(item as SearchHit),
    itemsOf: (part) => (part.state === "output-available" ? part.output.hits ?? [] : []),
    withItems: (part, items) =>
      part.state === "output-available" ? { ...part, output: { ...part.output, hits: items as SearchHit[] } } : part,
  }),
  searchNoteImages: moduleOf("searchNoteImages", {
    ResultCard: SearchNoteImagesResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.images?.length,
    aggregate: true,
    itemKey: (item) => noteImageItemKey(item as NoteImageHit),
    itemsOf: (part) => (part.state === "output-available" ? part.output.images ?? [] : []),
    withItems: (part, items) =>
      part.state === "output-available" ? { ...part, output: { ...part.output, images: items as NoteImageHit[] } } : part,
  }),
  webSearch: moduleOf("webSearch", {
    ResultCard: WebSearchResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.sources?.length,
    aggregate: true,
    itemKey: (item) => webItemKey(item as WebSearchSource),
    itemsOf: (part) => (part.state === "output-available" ? part.output.sources ?? [] : []),
    withItems: (part, items) =>
      part.state === "output-available" ? { ...part, output: { ...part.output, sources: items as WebSearchSource[] } } : part,
  }),
  imageSearch: moduleOf("imageSearch", {
    ResultCard: ImageSearchResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.sources?.length,
    aggregate: true,
    itemKey: (item) => webItemKey(item as WebSearchSource),
    itemsOf: (part) => (part.state === "output-available" ? part.output.sources ?? [] : []),
    withItems: (part, items) =>
      part.state === "output-available" ? { ...part, output: { ...part.output, sources: items as WebSearchSource[] } } : part,
  }),
  renderInteractive: moduleOf("renderInteractive", {
    ResultCard: RenderInteractiveResultCard,
    resultKey: (part) => (part.state === "output-available" ? part.output.artifactId : null),
  }),
  drawDiagram: moduleOf("drawDiagram"),
  generateImage: moduleOf("generateImage", {
    ResultCard: GenerateImageResultCard,
    resultKey: (part) => (part.state === "output-available" ? part.output.imageGenId : null),
  }),
  createQuiz: moduleOf("createQuiz", {
    ResultCard: CreateQuizResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.questions?.length,
    resultKey: (part) => (part.state === "output-available" ? part.output.quizId : null),
  }),
  writeDocument: moduleOf("writeDocument", {
    ResultCard: WriteDocumentResultCard,
    resultKey: (part) => (part.state === "output-available" ? part.output.documentId : null),
  }),
  getArtifact: moduleOf("getArtifact"),
  useSkill: moduleOf("useSkill"),
} satisfies { [N in StudyToolName]: ToolModule<N> };

/** 现网 ChatMessage 卡片顺序（不是 STUDY_TOOL_NAMES）。imageSearch 追加在末尾，与收回前的气泡顺序一致。 */
export const RESULT_CARD_ORDER = [
  "searchNotes",
  "webSearch",
  "renderInteractive",
  "generateImage",
  "createQuiz",
  "searchNoteImages",
  "writeDocument",
  "imageSearch",
] as const satisfies readonly StudyToolName[];

export interface ToolResultCardEntry {
  name: StudyToolName;
  presentation: ToolPresentation;
  ResultCard: ComponentType<ResultCardProps>;
  resultKey?: (part: ToolPart<StudyToolName>) => string | null;
  shouldRender?: (part: ToolPart<StudyToolName>) => boolean;
  aggregate?: boolean;
  itemKey?: (item: unknown) => string | null;
  itemsOf?: (part: ToolPart<StudyToolName>) => readonly unknown[];
  withItems?: (part: ToolPart<StudyToolName>, items: readonly unknown[]) => ToolPart<StudyToolName>;
}

export const TOOL_RESULT_CARDS: readonly ToolResultCardEntry[] = RESULT_CARD_ORDER.map((name) => {
  const mod = TOOL_REGISTRY[name];
  if (!mod.ResultCard) throw new Error(`TOOL_RESULT_CARDS: ${name} 缺少 ResultCard`);
  return {
    name,
    presentation: mod.presentation,
    ResultCard: mod.ResultCard as ComponentType<ResultCardProps>,
    resultKey: mod.resultKey as ToolResultCardEntry["resultKey"],
    shouldRender: mod.shouldRender as ToolResultCardEntry["shouldRender"],
    aggregate: mod.aggregate,
    itemKey: mod.itemKey,
    itemsOf: mod.itemsOf as ToolResultCardEntry["itemsOf"],
    withItems: mod.withItems as ToolResultCardEntry["withItems"],
  };
});
