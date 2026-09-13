import type { StudyToolName } from "@/lib/ai/agent/tools/names";
import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
import type { ToolPresentation } from "@/lib/ai/agent/tools/registry";
import { presentation as getCurrentPage } from "@/lib/ai/agent/tools/getCurrentPage/presentation";
import { presentation as getOutline } from "@/lib/ai/agent/tools/getOutline/presentation";
import { presentation as getSection } from "@/lib/ai/agent/tools/getSection/presentation";
import { presentation as searchNotes } from "@/lib/ai/agent/tools/searchNotes/presentation";
import { presentation as searchNoteImages } from "@/lib/ai/agent/tools/searchNoteImages/presentation";
import { presentation as webSearch } from "@/lib/ai/agent/tools/webSearch/presentation";
import { presentation as imageSearch } from "@/lib/ai/agent/tools/imageSearch/presentation";
import { presentation as renderInteractive } from "@/lib/ai/agent/tools/renderInteractive/presentation";
import { presentation as drawDiagram } from "@/lib/ai/agent/tools/drawDiagram/presentation";
import { presentation as generateImage } from "@/lib/ai/agent/tools/generateImage/presentation";
import { presentation as createQuiz } from "@/lib/ai/agent/tools/createQuiz/presentation";
import { presentation as writeDocument } from "@/lib/ai/agent/tools/writeDocument/presentation";
import { presentation as getArtifact } from "@/lib/ai/agent/tools/getArtifact/presentation";
import { presentation as useSkill } from "@/lib/ai/agent/tools/useSkill/presentation";

export const TOOL_PRESENTATION: Record<StudyToolName, ToolPresentation> = {
  getCurrentPage,
  getOutline,
  getSection,
  searchNotes,
  searchNoteImages,
  webSearch,
  imageSearch,
  renderInteractive,
  drawDiagram,
  generateImage,
  createQuiz,
  writeDocument,
  getArtifact,
  useSkill,
};

/** 设置面板「工具调用」区展示的工具，按 STUDY_TOOL_NAMES 顺序。 */
export const TOGGLEABLE_TOOLS: readonly { name: StudyToolName; label: string; desc: string }[] = STUDY_TOOL_NAMES
  .filter((name) => TOOL_PRESENTATION[name].toggleable)
  .map((name) => ({ name, label: TOOL_PRESENTATION[name].settingsLabel, desc: TOOL_PRESENTATION[name].description }));

export function getToolPresentation(name: string): ToolPresentation | undefined {
  return (TOOL_PRESENTATION as Record<string, ToolPresentation | undefined>)[name];
}
