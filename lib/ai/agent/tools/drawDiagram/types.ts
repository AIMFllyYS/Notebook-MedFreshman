import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface DrawDiagramInput {
  title: string;
  description: string;
  type?: "circuit" | "optics" | "field" | "molecule" | "geometry" | "custom";
}

export type DrawDiagramOutput = TextToolOutput;
