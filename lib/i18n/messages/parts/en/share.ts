import type { LocaleMessages } from "../../../types";

/** share namespace — conversation sharing (the C deep link and the public S page). */
export const shareEn = {
  action: "Share",
  creating: "Creating share link…",
  copied: "Link copied",
  failed: "Could not create the share link. Please try again.",
  empty: "There is nothing to share in this chat yet.",
  loginRequired: "Sign in to create a share link.",
  linkLabel: "Share link",
  page: {
    badge: "Shared chat",
    readonly: "Read-only",
    cta: "Open in StudySolo",
    notFound: "This share does not exist or was revoked.",
    expired: "This share link has expired.",
    imagePlaceholder: "Image not included in this share",
  },
  route: {
    loading: "Opening this chat…",
    notFound: "Chat not found.",
    backToAgent: "Back to Agent",
  },
} satisfies LocaleMessages["share"];
