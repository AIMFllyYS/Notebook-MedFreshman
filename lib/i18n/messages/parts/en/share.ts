import type { LocaleMessages } from "../../../types";

/** share namespace — conversation sharing (the C deep link and the public S page). */
export const shareEn = {
  action: "Share",
  failed: "Could not create the share link. Please try again.",
  empty: "There is nothing to share in this chat yet.",
  loginRequired: "Sign in to create a share link.",
  page: {
    badge: "Shared chat",
    readonly: "Read-only",
    cta: "Open in StudySolo",
    notFound: "This share does not exist or was revoked.",
    imagePlaceholder: "Image not included in this share",
  },
  dialog: {
    title: "Share this chat",
    intro: "Once you create the link, anyone who has it can read the following (read-only):",
    itemText: "The answer, the reasoning trace and tool results",
    itemSources: "Cited notes and web sources",
    itemArtifacts: "Artifacts generated in this chat",
    warning: "Images are not included in a share (cloud sync strips media), so the shared page shows placeholders.",
    confirm: "Create link",
    // "Creating…" here means the SHARE LINK is being created — not the same subject as
    // window.imageGen.card.working ("Generating…" an image). Keep them separate.
    creating: "Creating…",
    linkTitle: "Your link is ready",
    hint: "The link stays live until you turn it off under Assets → Shared links.",
  },
  assets: {
    tab: "Shared links",
    loginRequired: "Sign in to view your shared links.",
    toggleFailed: "Could not update the link.",
    empty: "You have not shared a chat yet.",
    loading: "Loading shared links…",
    failed: "Could not load shared links.",
    enabled: "On",
    disabled: "Off",
    enable: "Turn on",
    // Turning a switch off — not panel.common.close ("Close" a window). Both are kept on purpose.
    disable: "Turn off",
    open: "Open",
    createdAt: "Created {time}",
  },
  route: {
    loading: "Opening this chat…",
    notFound: "Chat not found.",
    backToAgent: "Back to Agent",
  },
} satisfies LocaleMessages["share"];
