import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { createPersistedStore } from "@/lib/stores/_persist";
import type { DocumentSpec, DocumentSection, StoredDocument, DocumentStatus } from "@/lib/documents/types";
import { assembleDocumentMarkdown } from "@/lib/documents/types";
import { scheduleCloudTombstone, scheduleCloudUpsert } from "@/lib/sync/schedule";
import { stripViewerId } from "@/lib/stores/windowPersist";

interface DocumentsState {
  byId: Record<string, StoredDocument>;
  viewerId: string | null;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  create: (id: string, spec: DocumentSpec, modelId?: string) => void;
  setSections: (id: string, sections: DocumentSection[]) => void;
  setSectionMarkdown: (id: string, index: number, markdown: string) => void;
  setSectionStatus: (id: string, index: number, status: DocumentSection["status"], error?: string) => void;
  appendSection: (id: string, section: DocumentSection) => void;
  setStatus: (id: string, status: DocumentStatus, error?: string) => void;
  openViewer: (id: string, title?: string) => void;
  closeViewer: () => void;
  prune: (keepIds: string[]) => void;
}

function documentWindowId(id: string) {
  return `document-viewer:${id}`;
}

function documentWindowGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 24, y: 64 }, size: { width: 860, height: 720 } };
  }
  const width = Math.min(900, Math.floor(window.innerWidth * 0.75));
  const height = Math.floor(window.innerHeight * 0.92);
  return {
    pos: { x: Math.max(16, Math.floor(window.innerWidth * 0.02)), y: Math.max(16, Math.floor(window.innerHeight * 0.03)) },
    size: { width, height },
  };
}

export const useDocuments = createPersistedStore<DocumentsState>(
    (set) => ({
      byId: {},
      viewerId: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      create: (id, spec, modelId) =>
        set((s) => {
          scheduleCloudUpsert("document", id);
          return {
            byId: {
              ...s.byId,
              [id]: {
                id,
                spec,
                modelId,
                sections: spec.outline?.map((title) => ({ title, status: "pending" })) ?? [],
                status: "idle",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          };
        }),

      setSections: (id, sections) =>
        set((s) => {
          const doc = s.byId[id];
          if (!doc) return s;
          scheduleCloudUpsert("document", id);
          return { byId: { ...s.byId, [id]: { ...doc, sections, updatedAt: Date.now() } } };
        }),

      setSectionMarkdown: (id, index, markdown) =>
        set((s) => {
          const doc = s.byId[id];
          if (!doc) return s;
          const sections = doc.sections.map((sec, i) => (i === index ? { ...sec, markdown } : sec));
          return { byId: { ...s.byId, [id]: { ...doc, sections, updatedAt: Date.now() } } };
        }),

      setSectionStatus: (id, index, status, error) =>
        set((s) => {
          const doc = s.byId[id];
          if (!doc) return s;
          const sections = doc.sections.map((sec, i) => (i === index ? { ...sec, status, error } : sec));
          return { byId: { ...s.byId, [id]: { ...doc, sections, updatedAt: Date.now() } } };
        }),

      appendSection: (id, section) =>
        set((s) => {
          const doc = s.byId[id];
          if (!doc) return s;
          return { byId: { ...s.byId, [id]: { ...doc, sections: [...doc.sections, section], updatedAt: Date.now() } } };
        }),

      setStatus: (id, status, error) =>
        set((s) => {
          const doc = s.byId[id];
          if (!doc) return s;
          scheduleCloudUpsert("document", id);
          return { byId: { ...s.byId, [id]: { ...doc, status, error, updatedAt: Date.now() } } };
        }),

      /**
       * 打开（或复用）文档浮窗。与演示同一口径：**文档还没落盘也要开窗**——
       * Agent 面里卡片是 silent 的，参考列点进来时它可能还在分节撰写，
       * 以前 `if (!doc) return s` 会让这一下点击毫无反应（同 artifacts.openViewer 的老毛病）。
       */
      openViewer: (id, title) =>
        set((s) => {
          const doc = s.byId[id];
          const windowId = documentWindowId(id);
          const wm = useWindowManager.getState();
          const existing = wm.windows.find((win) => win.id === windowId);
          const nextTitle = doc?.spec.title || title || windowId;
          if (existing) {
            wm.updateWindow(windowId, { title: nextTitle });
            if (existing.minimized) wm.restoreWindow(windowId);
            else wm.bringToFront(windowId);
          } else {
            const { pos, size } = documentWindowGeometry();
            wm.openWindow({
              id: windowId,
              type: "document-viewer",
              title: nextTitle,
              pos,
              size,
              data: { documentId: id },
            });
          }
          return { viewerId: id };
        }),

      closeViewer: () =>
        set((s) => {
          if (s.viewerId) useWindowManager.getState().closeWindow(documentWindowId(s.viewerId));
          return { viewerId: null };
        }),

      prune: (keepIds) =>
        set((s) => {
          const keepSet = new Set(keepIds);
          const byId: Record<string, StoredDocument> = {};
          for (const id of keepSet) if (s.byId[id]) byId[id] = s.byId[id];
          for (const id of Object.keys(s.byId)) {
            if (!keepSet.has(id)) scheduleCloudTombstone("document", id);
          }
          return { byId };
        }),
    }),
    {
      name: PERSIST_KEYS.documents,
      storage: "idb",
      partialize: (s) => ({ byId: s.byId }),
      onRehydrateStorage: () => (state) => {
        if (state) stripViewerId(state);
        state?._setHasHydrated(true);
      },
    },
);

export function getDocumentMarkdown(id: string): string | null {
  const doc = useDocuments.getState().byId[id];
  return doc ? assembleDocumentMarkdown(doc) : null;
}
