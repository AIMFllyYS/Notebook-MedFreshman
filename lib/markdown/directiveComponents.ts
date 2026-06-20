import type { Components } from "react-markdown";
import { Callout } from "@/components/shared/directives/Callout";
import { Derivation } from "@/components/shared/directives/Derivation";
import { MediaEmbed } from "@/components/shared/directives/MediaEmbed";

export const directiveComponents = {
  callout: Callout,
  derivation: Derivation,
  mediaembed: MediaEmbed,
} as unknown as Partial<Components>;
