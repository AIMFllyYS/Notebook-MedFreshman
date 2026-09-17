/**
 * StudySolo 三模式（Studio / Agent / Class）的路由与 persist 约定。
 * 其它代理请读本文件 + `lib/stores/appMode.ts`，不要另写一份模式表。
 */

export const APP_MODES = ["studio", "agent", "class"] as const;
export type AppMode = (typeof APP_MODES)[number];

export const DEFAULT_APP_MODE: AppMode = "studio";
export const DEFAULT_STUDIO_PATH = "/";

/** 对外品牌名。顶栏默认文案是「StudySolo · Studio」。 */
export const APP_NAME = "StudySolo";

export const APP_MODE_LABELS: Record<AppMode, string> = {
  studio: "Studio",
  agent: "Agent",
  class: "Class",
};

export const APP_MODE_PATHS: Record<AppMode, string> = {
  studio: "/",
  agent: "/agent",
  class: "/class",
};

/** localStorage 键。值为 JSON：`{ mode, lastStudioPath }`。 */
export const APP_MODE_STORAGE_KEY = "studysolo-app-mode";

export interface AppModePersist {
  mode: AppMode;
  lastStudioPath: string;
}

export function isAppMode(value: unknown): value is AppMode {
  return typeof value === "string" && (APP_MODES as readonly string[]).includes(value);
}

export function parseAppMode(value: unknown): AppMode {
  return isAppMode(value) ? value : DEFAULT_APP_MODE;
}

function firstSegment(pathname: string): string | undefined {
  return pathname.split("/").filter(Boolean)[0];
}

/** `/login` 不参与模式路由，避免登录页改写 persist。 */
export function isAuthPath(pathname: string): boolean {
  return firstSegment(pathname) === "login";
}

export function isAppModePath(pathname: string): boolean {
  const first = firstSegment(pathname);
  return first === "agent" || first === "class";
}

/**
 * 从 URL 解析模式。
 * - `/agent` → agent
 * - `/class` → class
 * - `/login` → null（不改 persist）
 * - 其余 Studio 路由 → studio
 */
export function appModeFromPathname(pathname: string): AppMode | null {
  const first = firstSegment(pathname);
  if (first === "agent") return "agent";
  if (first === "class") return "class";
  if (isAuthPath(pathname)) return null;
  return "studio";
}

/** Studio 三栏壳：登录页保持现布局，Agent / Class 走独立工作区。 */
export function usesStudioChrome(pathname: string): boolean {
  return !isAppModePath(pathname);
}

export function resolveAppMode(pathname: string, persisted: AppMode): AppMode {
  return appModeFromPathname(pathname) ?? (isAuthPath(pathname) ? "studio" : persisted);
}

export function isRememberableStudioPath(pathname: string): boolean {
  return appModeFromPathname(pathname) === "studio";
}

export function hrefForAppMode(mode: AppMode, lastStudioPath: string): string {
  if (mode !== "studio") return APP_MODE_PATHS[mode];
  if (lastStudioPath && isRememberableStudioPath(lastStudioPath)) return lastStudioPath;
  return DEFAULT_STUDIO_PATH;
}

/** 顶栏默认展示：项目名 + 间隔点 + 当前模式。 */
export function appModeTitle(mode: AppMode): string {
  return `${APP_NAME} · ${APP_MODE_LABELS[mode]}`;
}

export function parseAppModePersist(raw: string | null | undefined): AppModePersist {
  const fallback: AppModePersist = {
    mode: DEFAULT_APP_MODE,
    lastStudioPath: DEFAULT_STUDIO_PATH,
  };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const rec = parsed as Record<string, unknown>;
      const lastStudioPath =
        typeof rec.lastStudioPath === "string" && isRememberableStudioPath(rec.lastStudioPath)
          ? rec.lastStudioPath
          : DEFAULT_STUDIO_PATH;
      return { mode: parseAppMode(rec.mode), lastStudioPath };
    }
  } catch {
    if (isAppMode(raw)) return { mode: raw, lastStudioPath: DEFAULT_STUDIO_PATH };
  }
  return fallback;
}
