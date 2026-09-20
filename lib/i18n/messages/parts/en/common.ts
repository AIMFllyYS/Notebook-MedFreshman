/**
 * common namespace (English) — action words shared across modules.
 *
 * These used to be duplicated verbatim per namespace (cancel ×4, retry ×3, copy ×3, copied ×2);
 * one shared key per word now. Near-synonyms that are deliberately NOT merged here:
 * - "Close" (panel.common.close) vs "Off" / "Turn off" (menu.thinking.off.label / share.assets.disable);
 * - "Failed" as a result (window.common.failed) vs "failed" as a status word
 *   (trace.step.status.error / menu.history.status.error).
 */
export const commonEn = {
  cancel: "Cancel",
  retry: "Retry",
  copy: "Copy",
  copied: "Copied",
};
