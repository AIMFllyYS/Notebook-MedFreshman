import type { GetCurrentPageInput, GetCurrentPageOutput } from "@/lib/ai/agent/tools/getCurrentPage/types";
import type { GetOutlineInput, GetOutlineOutput } from "@/lib/ai/agent/tools/getOutline/types";
import type { GetSectionInput, GetSectionOutput } from "@/lib/ai/agent/tools/getSection/types";
import type { SearchNotesInput, SearchNotesOutput } from "@/lib/ai/agent/tools/searchNotes/types";
import type { SearchNoteImagesInput, SearchNoteImagesOutput } from "@/lib/ai/agent/tools/searchNoteImages/types";
import type { WebSearchInput, WebSearchOutput } from "@/lib/ai/agent/tools/webSearch/types";
import type { ImageSearchInput, ImageSearchOutput } from "@/lib/ai/agent/tools/imageSearch/types";
import type { RenderInteractiveInput, RenderInteractiveOutput } from "@/lib/ai/agent/tools/renderInteractive/types";
import type { DrawDiagramInput, DrawDiagramOutput } from "@/lib/ai/agent/tools/drawDiagram/types";
import type { GenerateImageInput, GenerateImageOutput } from "@/lib/ai/agent/tools/generateImage/types";
import type { CreateQuizInput, CreateQuizOutput } from "@/lib/ai/agent/tools/createQuiz/types";
import type { WriteDocumentInput, WriteDocumentOutput } from "@/lib/ai/agent/tools/writeDocument/types";
import type { GetArtifactInput, GetArtifactOutput } from "@/lib/ai/agent/tools/getArtifact/types";
import type { UseSkillInput, UseSkillOutput } from "@/lib/ai/agent/tools/useSkill/types";

/** 供 UIMessage<…, StudyTools> 使用的 UITools 形状（type alias 才能满足 Record 约束）。 */
export type StudyTools = {
  getCurrentPage: { input: GetCurrentPageInput; output: GetCurrentPageOutput };
  getOutline: { input: GetOutlineInput; output: GetOutlineOutput };
  getSection: { input: GetSectionInput; output: GetSectionOutput };
  searchNotes: { input: SearchNotesInput; output: SearchNotesOutput };
  searchNoteImages: { input: SearchNoteImagesInput; output: SearchNoteImagesOutput };
  webSearch: { input: WebSearchInput; output: WebSearchOutput };
  imageSearch: { input: ImageSearchInput; output: ImageSearchOutput };
  renderInteractive: { input: RenderInteractiveInput; output: RenderInteractiveOutput };
  drawDiagram: { input: DrawDiagramInput; output: DrawDiagramOutput };
  generateImage: { input: GenerateImageInput; output: GenerateImageOutput };
  createQuiz: { input: CreateQuizInput; output: CreateQuizOutput };
  writeDocument: { input: WriteDocumentInput; output: WriteDocumentOutput };
  getArtifact: { input: GetArtifactInput; output: GetArtifactOutput };
  useSkill: { input: UseSkillInput; output: UseSkillOutput };
};

export type StudyToolName = keyof StudyTools;

export const STUDY_TOOL_NAMES: readonly StudyToolName[] = [
  "getCurrentPage",
  "getOutline",
  "getSection",
  "searchNotes",
  "searchNoteImages",
  "webSearch",
  "imageSearch",
  "renderInteractive",
  "drawDiagram",
  "generateImage",
  "createQuiz",
  "writeDocument",
  "getArtifact",
  "useSkill",
];
