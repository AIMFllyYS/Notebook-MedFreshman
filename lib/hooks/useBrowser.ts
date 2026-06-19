import { create } from "zustand";

/** 收藏夹书签：渲染为右侧顶部 Tab 栏里的固定标签，点击即跳转。 */
export interface Bookmark {
  id: string;
  name: string;
  url: string;
}

interface BrowserPersist {
  bookmarks: Bookmark[];
  homeUrl: string;
  currentUrl: string;
}

interface BrowserState extends BrowserPersist {
  /** 用于强制 iframe 重载（key 的一部分）。 */
  reloadNonce: number;
  navigate: (raw: string) => void;
  reload: () => void;
  goHome: () => void;
  addBookmark: (name: string, url: string) => string | null;
  removeBookmark: (id: string) => void;
  setHomeUrl: (url: string) => void;
}

const LS_KEY = "gailvlun-browser-v1";

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "bm-bili", name: "B站", url: "https://www.bilibili.com" },
  { id: "bm-bili-course", name: "B站课程", url: "https://search.bilibili.com/all?keyword=大学课程" },
];

function loadPersist(): BrowserPersist {
  const fallback: BrowserPersist = { bookmarks: DEFAULT_BOOKMARKS, homeUrl: "", currentUrl: "" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw);
    return {
      bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : DEFAULT_BOOKMARKS,
      homeUrl: typeof p.homeUrl === "string" ? p.homeUrl : "",
      currentUrl: typeof p.currentUrl === "string" ? p.currentUrl : "",
    };
  } catch {
    return fallback;
  }
}

function save(state: BrowserPersist) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ bookmarks: state.bookmarks, homeUrl: state.homeUrl, currentUrl: state.currentUrl }),
    );
  } catch {
    /* 忽略持久化失败 */
  }
}

/**
 * 地址规范化 + 站点适配：
 * - 无协议且像网址 → 补 https://；不像网址 → 走必应搜索。
 * - B 站视频页（主站禁止 iframe 内嵌）→ 改写为官方可内嵌播放器，方便在右侧刷网课。
 */
export function normalizeUrl(raw: string): string {
  const s0 = raw.trim();
  if (!s0) return "";
  let s = s0;
  if (!/^https?:\/\//i.test(s)) {
    const looksLikeUrl = /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(s) || s.startsWith("localhost");
    if (looksLikeUrl) s = "https://" + s;
    else return "https://www.bing.com/search?q=" + encodeURIComponent(s);
  }
  const bili = s.match(/bilibili\.com\/video\/(BV[\w]+)/i);
  if (bili) {
    const pMatch = s.match(/[?&]p=(\d+)/);
    const page = pMatch ? `&p=${pMatch[1]}` : "";
    return `https://player.bilibili.com/player.html?bvid=${bili[1]}&autoplay=0&high_quality=1${page}`;
  }
  const b23 = s.match(/b23\.tv\/(BV[\w]+)/i);
  if (b23) return `https://player.bilibili.com/player.html?bvid=${b23[1]}&autoplay=0&high_quality=1`;
  return s;
}

let idSeq = 0;
function genId(): string {
  idSeq += 1;
  return `bm-${Date.now().toString(36)}-${idSeq}`;
}

export const useBrowser = create<BrowserState>((set, get) => ({
  ...loadPersist(),
  reloadNonce: 0,

  navigate: (raw) => {
    const url = normalizeUrl(raw);
    if (!url) return;
    set({ currentUrl: url });
    save({ ...get() });
  },

  reload: () => set((s) => ({ reloadNonce: s.reloadNonce + 1 })),

  goHome: () => {
    const home = get().homeUrl;
    set({ currentUrl: home ? normalizeUrl(home) : "" });
    save({ ...get() });
  },

  addBookmark: (name, url) => {
    const u = url.trim();
    if (!u) return null;
    const bm: Bookmark = { id: genId(), name: name.trim() || u, url: u };
    set((s) => ({ bookmarks: [...s.bookmarks, bm] }));
    save({ ...get() });
    return bm.id;
  },

  removeBookmark: (id) => {
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
    save({ ...get() });
  },

  setHomeUrl: (url) => {
    set({ homeUrl: url.trim() });
    save({ ...get() });
  },
}));
