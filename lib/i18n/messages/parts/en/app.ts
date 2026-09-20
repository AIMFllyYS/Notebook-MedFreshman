import type { LocaleMessages } from "../../../types";

/**
 * app namespace — the application-level chrome: top bar, loaders, lightbox.
 *
 * Studio chapter names and all textbook / note body text are intentionally NOT translated.
 */
export const appEn = {
  topbar: {
    expandNav: "Show navigation",
    collapseNav: "Hide navigation",
    expandTopBar: "Show top bar",
    collapseTopBar: "Hide top bar",
    enterFullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    expandDock: "Show right workspace",
    collapseDock: "Hide right workspace",
    expandAiPanel: "Show AI panel",
    closeSidebar: "Close sidebar",
  },
  loading: {
    label: "Loading",
  },
  lightbox: {
    label: "Image viewer",
    close: "Close",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset",
  },
  account: {
    guest: "Guest",
    aria: "Account {name}",
  },
} satisfies LocaleMessages["app"];
