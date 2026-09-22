import { translateNow } from "@/lib/i18n";
import { PERSIST_KEYS } from "@/lib/storage/idbStorage";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { createPersistedStore } from "@/lib/stores/_persist";
import { stripOpenIds } from "@/lib/stores/windowPersist";

export type ImageGenStatus = "idle" | "loading" | "done" | "error";

export interface ImageGenImage {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageGenSession {
  id: string;
  prompt: string;
  title: string;
  size: string;
  count: number;
  modelId?: string;
  status: ImageGenStatus;
  images: ImageGenImage[];
  error?: string;
  createdAt: number;
  /** 本轮生成开始时刻（进度条估算用）；完成 / 失败后保留最近一次。 */
  startedAt?: number;
  /** 该模型声明的典型耗时（毫秒），由开跑时按模型写入。 */
  expectedMs?: number;
}

export interface ImageGenSessionInit {
  id: string;
  prompt: string;
  title: string;
  size?: string;
  count?: number;
  modelId?: string;
}

interface ImageGenState {
  openIds: string[];
  sessions: Record<string, ImageGenSession>;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  openViewer: (init: ImageGenSessionInit) => void;
  closeViewer: (id: string) => void;
  bringToFront: (id: string) => void;
  updateSession: (id: string, patch: Partial<ImageGenSession>) => void;
  /** expectedMs = 该模型声明的典型耗时，只用于前端进度估算。 */
  startLoading: (id: string, expectedMs?: number) => void;
  removeSession: (id: string) => void;
}

function imageGenWindowId(id: string) {
  return `image-gen-viewer:${id}`;
}

function imageGenWindowGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 60, y: 80 }, size: { width: 720, height: 720 } };
  }
  const width = Math.min(720, Math.floor(window.innerWidth * 0.6));
  const height = Math.min(820, Math.floor(window.innerHeight * 0.88));
  const openCount = useImageGen.getState().openIds.length;
  const offset = openCount * 24;
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.16) + offset),
      y: Math.max(16, Math.floor(window.innerHeight * 0.04) + offset),
    },
    size: { width, height },
  };
}

export const useImageGen = createPersistedStore<ImageGenState>(
    (set, get) => ({
      openIds: [],
      sessions: {},
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      openViewer: (init) => {
        const id = init.id;
        const existing = get().sessions[id];
        const isAlreadyOpen = get().openIds.includes(id);

        const session: ImageGenSession = existing ?? {
          id,
          prompt: init.prompt,
          // 对话里的生图卡也是这个兜底标题（ImageGenCard → window.imageGen.card.defaultTitle）。
          title: init.title || translateNow("window.imageGen.card.defaultTitle"),
          size: init.size || "1024x1024",
          count: init.count || 1,
          modelId: init.modelId,
          status: "idle",
          images: [],
          createdAt: Date.now(),
        };

        const { pos, size } = imageGenWindowGeometry();
        useWindowManager.getState().openWindow({
          id: imageGenWindowId(id),
          type: "image-gen-viewer",
          title: session.title,
          pos,
          size,
          data: { imageGenId: id },
        });

        set((state) => ({
          openIds: isAlreadyOpen ? state.openIds : [...state.openIds, id],
          sessions: { ...state.sessions, [id]: session },
        }));
      },

      closeViewer: (id) => {
        useWindowManager.getState().closeWindow(imageGenWindowId(id));
        set((state) => ({
          openIds: state.openIds.filter((oid) => oid !== id),
        }));
      },

      bringToFront: (id) => {
        const winMgr = useWindowManager.getState();
        const win = winMgr.windows.find((w) => w.id === imageGenWindowId(id));

        if (!win) {
          const session = get().sessions[id];
          if (!session) return;
          const { pos, size } = imageGenWindowGeometry();
          winMgr.openWindow({
            id: imageGenWindowId(id),
            type: "image-gen-viewer",
            title: session.title,
            pos,
            size,
            data: { imageGenId: id },
          });
        } else if (win.minimized) {
          winMgr.restoreWindow(imageGenWindowId(id));
        } else {
          winMgr.bringToFront(imageGenWindowId(id));
        }

        set((state) => ({
          openIds: state.openIds.includes(id) ? state.openIds : [...state.openIds, id],
        }));
      },

      startLoading: (id, expectedMs) =>
        set((state) => {
          const cur = state.sessions[id];
          if (!cur) return state;
          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...cur,
                status: "loading",
                error: undefined,
                // 每次开跑都重置起点：重试时进度要从头走，而不是接着上一轮。
                startedAt: Date.now(),
                ...(expectedMs && expectedMs > 0 ? { expectedMs } : {}),
              },
            },
          };
        }),

      updateSession: (id, patch) =>
        set((state) => {
          const cur = state.sessions[id];
          if (!cur) return state;
          return {
            sessions: { ...state.sessions, [id]: { ...cur, ...patch } },
          };
        }),

      removeSession: (id) =>
        set((state) => {
          const next = { ...state.sessions };
          delete next[id];
          useWindowManager.getState().closeWindow(imageGenWindowId(id));
          return {
            sessions: next,
            openIds: state.openIds.filter((oid) => oid !== id),
          };
        }),
    }),
    {
      name: PERSIST_KEYS.imageGen,
      storage: "idb",
      partialize: (s) => ({ sessions: s.sessions }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          stripOpenIds(state);
          // リロードやプロセス再起動で死んだ fetch の残骸として "loading" が残ると、
          // 再オープン時に永久スピナーになる。中断エラーへ矯正してリトライ可能にする。
          for (const session of Object.values(state.sessions)) {
            if (session.status === "loading") {
              session.status = "error";
              session.error = translateNow("window.imageGen.interrupted");
            }
          }
        }
        state?._setHasHydrated(true);
      },
    },
);

export { imageGenWindowId };
