import type { ComponentType } from "react";
import type { StudyToolName } from "@/lib/ai/agent/tools/names";
import type { ResultCardProps, ToolModule, ToolPart, ToolPresentation } from "@/lib/ai/agent/tools/registry";
import { TOOL_PRESENTATION } from "@/lib/ai/agent/tools/presentations";
import SearchNotesResultCard from "@/components/chat/toolCards/searchNotesCard";
import WebSearchResultCard from "@/components/chat/toolCards/webSearchCard";
import RenderInteractiveResultCard from "@/components/chat/toolCards/renderInteractiveCard";
import GenerateImageResultCard from "@/components/chat/toolCards/generateImageCard";
import CreateQuizResultCard from "@/components/chat/toolCards/createQuizCard";
import SearchNoteImagesResultCard from "@/components/chat/toolCards/searchNoteImagesCard";
import WriteDocumentResultCard from "@/components/chat/toolCards/writeDocumentCard";

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
  }),
  searchNoteImages: moduleOf("searchNoteImages", {
    ResultCard: SearchNoteImagesResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.images?.length,
  }),
  webSearch: moduleOf("webSearch", {
    ResultCard: WebSearchResultCard,
    shouldRender: (part) => part.state === "output-available" && !!part.output.sources?.length,
  }),
  imageSearch: moduleOf("imageSearch"),
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
  useSkill: moduleOf("useSkill"),
} satisfies { [N in StudyToolName]: ToolModule<N> };

/** 现网 ChatMessage 卡片顺序（不是 STUDY_TOOL_NAMES）：来源条插在 webSearch 之后。 */
export const RESULT_CARD_ORDER = [
  "searchNotes",
  "webSearch",
  "renderInteractive",
  "generateImage",
  "createQuiz",
  "searchNoteImages",
  "writeDocument",
] as const satisfies readonly StudyToolName[];

export interface ToolResultCardEntry {
  name: StudyToolName;
  presentation: ToolPresentation;
  ResultCard: ComponentType<ResultCardProps>;
  resultKey?: (part: ToolPart<StudyToolName>) => string | null;
  shouldRender?: (part: ToolPart<StudyToolName>) => boolean;
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
  };
});
