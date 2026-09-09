import { create } from "zustand";

/** 收藏夹书签：渲染为右侧顶部 Tab 栏里的「独立固定标签」，点击即切到该站点。 */
export interface Bookmark {
  id: string;
  name: string;
  url: string;
}

/** 渲染视图模式：mobile=模拟手机视口并缩放贴合；desktop=按面板原宽 1:1。 */
export type ViewMode = "mobile" | "desktop";

/** 通用浏览器（搜索/自由浏览）这一标签的内部标识；与书签 id 区分。 */
export const BROWSE_TAB = "__browse__";

/** 移动视图模拟的逻辑视口宽度（iframe 以此宽渲染再缩放贴合面板）。 */
export const MOBILE_LOGICAL_WIDTH = 414;

interface BrowserPersist {
  bookmarks: Bookmark[];
  homeUrl: string;
  /** 通用浏览器标签当前页面（与书签标签分开记忆）；空 → 显示必应搜索起始页。 */
  browseUrl: string;
  viewMode: ViewMode;
}

interface BrowserState extends BrowserPersist {
  /** 当前正在显示的 URL（由 activeTabId 派生：通用浏览器=browseUrl，书签=该书签 url）。 */
  currentUrl: string;
  /** 当前激活的标签：BROWSE_TAB 或某书签 id。 */
  activeTabId: string;
  /** 用于强制 iframe 重载（key 的一部分）。 */
  reloadNonce: number;
  /** 在通用浏览器里导航（地址栏/搜索）。 */
  navigate: (raw: string) => void;
  /** 切到通用浏览器标签（恢复其上次页面，空则显示起始页）。 */
  openBrowse: () => void;
  /** 切到某书签标签并显示其站点。 */
  openBookmark: (id: string) => void;
  reload: () => void;
  goHome: () => void;
  addBookmark: (name: string, url: string) => string | null;
  removeBookmark: (id: string) => void;
  setHomeUrl: (url: string) => void;
  setViewMode: (m: ViewMode) => void;
}

const LS_KEY = "gailvlun-browser-v1";

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "bm-bili", name: "B站", url: "https://www.bilibili.com" },
  { id: "bm-bili-course", name: "B站课程", url: "https://search.bilibili.com/all?keyword=大学课程" },
];

function loadPersist(): BrowserPersist {
  const fallback: BrowserPersist = {
    bookmarks: DEFAULT_BOOKMARKS,
    homeUrl: "",
    browseUrl: "",
    viewMode: "mobile",
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw);
    return {
      bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : DEFAULT_BOOKMARKS,
      homeUrl: typeof p.homeUrl === "string" ? p.homeUrl : "",
      // 兼容旧版（曾用 currentUrl 持久化通用浏览器页面）
      browseUrl:
        typeof p.browseUrl === "string"
          ? p.browseUrl
          : typeof p.currentUrl === "string"
            ? p.currentUrl
            : "",
      viewMode: p.viewMode === "desktop" ? "desktop" : "mobile",
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
      JSON.stringify({
        bookmarks: state.bookmarks,
        homeUrl: state.homeUrl,
        browseUrl: state.browseUrl,
        viewMode: state.viewMode,
      }),
    );
  } catch {
    /* 忽略持久化失败 */
  }
}

/**
 * 地址规范化 + 站点适配：
 * - 无协议且像网址 → 补 https://；不像网址 → 走必应搜索结果页（可内嵌；首页带 XFO 不可嵌）。
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

const persisted = loadPersist();

export const useBrowser = create<BrowserState>((set, get) => ({
  ...persisted,
  currentUrl: persisted.browseUrl,
  activeTabId: BROWSE_TAB,
  reloadNonce: 0,

  navigate: (raw) => {
    const url = normalizeUrl(raw);
    if (!url) return;
    set({ browseUrl: url, currentUrl: url, activeTabId: BROWSE_TAB });
    save({ ...get() });
  },

  openBrowse: () => {
    set((s) => ({ activeTabId: BROWSE_TAB, currentUrl: s.browseUrl }));
  },

  openBookmark: (id) => {
    const bm = get().bookmarks.find((b) => b.id === id);
    if (!bm) return;
    set({ activeTabId: id, currentUrl: normalizeUrl(bm.url) });
  },

  reload: () => set((s) => ({ reloadNonce: s.reloadNonce + 1 })),

  goHome: () => {
    const home = get().homeUrl.trim();
    const url = home ? normalizeUrl(home) : "";
    set({ browseUrl: url, currentUrl: url, activeTabId: BROWSE_TAB });
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
    set((s) => {
      const bookmarks = s.bookmarks.filter((b) => b.id !== id);
      if (s.activeTabId === id) {
        return { bookmarks, activeTabId: BROWSE_TAB, currentUrl: s.browseUrl };
      }
      return { bookmarks };
    });
    save({ ...get() });
  },

  setHomeUrl: (url) => {
    set({ homeUrl: url.trim() });
    save({ ...get() });
  },

  setViewMode: (m) => {
    set({ viewMode: m });
    save({ ...get() });
  },
}));
