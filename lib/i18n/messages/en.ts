import type { LocaleMessages } from "../types";

/**
 * 英文词典。用 `satisfies` 而不是类型注解：既保证与中文词典 key 完全一致（多一个少一个都报错），
 * 又保留字面量类型，方便未来做「哪些 key 还没翻」的静态检查。
 *
 * 与 zh.ts 同样分片：四个新命名空间在 `parts/en/<namespace>.ts`，这里合并。
 * 任何一边少一个 key，`satisfies LocaleMessages` 都会在 typecheck 阶段报错。
 */
import { appEn } from "./parts/en/app";
import { menuEn } from "./parts/en/menu";
import { panelEn } from "./parts/en/panel";
import { settingsEn } from "./parts/en/settings";
import { shareEn } from "./parts/en/share";
import { traceEn } from "./parts/en/trace";
import { windowEn } from "./parts/en/window";

export const en = {
  app: appEn,
  agent: {
    nav: {
      aria: "Agent section navigation",
      newChat: "New chat",
      assets: "My assets",
      scheduled: "Scheduled",
      plugins: "Plugins",
    },
    sidebar: {
      title: "Chat",
      search: "Search",
      collapse: "Collapse sidebar",
      projects: "Projects",
      recents: "Recents",
      archived: "Archived",
      newProject: "New project",
      backToList: "Back to chats",
      viewArchived: "View archived chats",
      more: "{count} more",
      project: {
        name: "Project name",
        newChat: "New chat in “{name}”",
        rename: "Rename project",
      },
      empty: {
        project: "Empty project",
        notes: "No note chats yet",
        selection: "No selection chats yet",
        recents: "No chats yet",
        archived: "No archived chats",
      },
    },
    session: {
      rename: "Chat name",
      untitled: "New chat",
      empty: "Empty chat",
      messageCount: "{count} messages",
    },
    menu: {
      aria: "Chat actions",
      newChat: "New chat",
      newChatInProject: "New chat here",
      renameSession: "Rename",
      moveToProject: "Move to project",
      removeFromProject: "Remove from project",
      systemNote: "This group is set by its source (the Agent inside a note) and cannot be moved to another project.",
      systemFloating: "This group is set by its source (the selection assistant) and cannot be moved to another project.",
      archive: "Archive",
      deleteSession: "Delete chat",
      deleteProject: "Delete project",
      deleteSessionConfirm: "The cloud record is deleted as well and cannot be recovered.",
      deleteProjectConfirm: "Chats inside move back to Recents; the chats themselves are kept.",
      cancel: "Cancel",
      confirmDelete: "Delete",
    },
    center: {
      tab: {
        answer: "Answer",
        links: "Links",
        images: "Images",
      },
      tabs: {
        aria: "Content views",
      },
    },
    sources: {
      title: "Sources",
      // Window titles: the dock tab bar renders win.title verbatim.
      traceWindowTitle: "Sources · {count}",
      webWindowTitle: "Web sources · {count}",
      untitled: "Untitled source",
      count: "Sources · {count}",
      openPanel: "Open sources panel",
      outline: "Source outline",
      query: "Searched “{query}”",
      empty: "No references to trace in this round.",
      noLink: "No link",
      snippet: "Matched excerpt",
      reading: "Loading note…",
      missing: "Full text not found; showing the matched excerpt.",
      openOriginal: "Open original page",
      summary: "Page summary",
      rawJson: "Raw JSON",
      round: {
        web: "Web search",
        notes: "Note search",
        images: "Image search",
      },
      kind: {
        note: "Note",
        web: "Web",
      },
    },
    links: {
      empty: "No traceable sources in this chat yet.",
    },
    images: {
      empty: "No images in this chat yet.",
      search: "Searched images",
      generated: "Generated images",
    },
    quiz: {
      empty: "Could not build the quiz: there are no questions to render.",
      card: {
        title: "{title} · {count} questions",
      },
      redo: "Retry",
      progress: "{done} / {total} answered",
      dropped: "({count} malformed questions were dropped)",
      dock: {
        title: "Quiz",
        open: "Answer in the side panel",
        created: "Quiz ready · {count} questions",
      },
      intent: {
        check: "Quick check",
        diagnose: "Gap diagnosis",
        practice: "Practice",
        exam: "Short test",
      },
      reveal: {
        blank: "Show answer",
        multiple: "Confirm and check",
        default: "Show explanation",
      },
    },
    selection: {
      title: "Selection · {snippet}",
      explain: "Explain",
      ask: "Ask follow-up",
      example: "Give examples",
    },
    dock: {
      collapse: "Collapse panel",
      global: "Expand panel",
      shrink: "Shrink to panel",
    },
  },
  settings: settingsEn,
  menu: menuEn,
  panel: panelEn,
  trace: traceEn,
  window: windowEn,
  share: shareEn,
} satisfies LocaleMessages;
