import type { ChatFolder, SessionMeta } from "@/lib/storage/chatStorage";

/**
 * Agent 左栏的项目/最近视图：从 folders + sessionsMeta 推导，**不额外存一份**。
 * 规则只有三条（与用户口径一致）：
 * - 系统项目「笔记记录」= kind note、未归档；「划词摘录」= kind floating、未归档；
 * - 用户项目 = 会话 meta.folderId 指向该项目、未归档；
 * - Recents = 既不属系统项目、也没有 folderId 的普通会话、未归档。
 * 归档会话单独成列（左栏底部的归档开关），不进上面任何一组。
 */

export interface AgentProjectView {
  id: string;
  name: string;
  system?: ChatFolder["system"];
  /** 成员会话，已按 updatedAt 倒序。 */
  sessions: SessionMeta[];
  /** 项目最近活跃时间（取最新成员；空项目退回到项目自身的创建/更新时间）。 */
  updatedAt: number;
}

function byUpdatedAtDesc(a: SessionMeta, b: SessionMeta): number {
  if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
  return a.id.localeCompare(b.id);
}

export function sortSessions(sessions: SessionMeta[]): SessionMeta[] {
  return [...sessions].sort(byUpdatedAtDesc);
}

export function isSystemKindSession(session: SessionMeta): boolean {
  return session.kind === "note" || session.kind === "floating" || session.kind === "scheduled";
}

export function selectRecentSessions(sessionsMeta: SessionMeta[]): SessionMeta[] {
  return sortSessions(
    sessionsMeta.filter((s) => !s.archived && !isSystemKindSession(s) && !s.folderId),
  );
}

export function selectArchivedSessions(sessionsMeta: SessionMeta[]): SessionMeta[] {
  return sortSessions(sessionsMeta.filter((s) => s.archived));
}

export function systemProjectSessions(
  system: NonNullable<ChatFolder["system"]>,
  sessionsMeta: SessionMeta[],
): SessionMeta[] {
  return sortSessions(sessionsMeta.filter((s) => !s.archived && s.kind === system));
}

/** 系统项目在前、用户项目按时新在前；成员会话各自排好序。 */
export function buildProjectViews(
  folders: ChatFolder[],
  sessionsMeta: SessionMeta[],
): AgentProjectView[] {
  return folders.map((folder) => {
    const sessions = folder.system
      ? systemProjectSessions(folder.system, sessionsMeta)
      : sortSessions(
          sessionsMeta.filter((s) => !s.archived && !isSystemKindSession(s) && s.folderId === folder.id),
        );
    const fallback = folder.updatedAt ?? folder.createdAt;
    return {
      id: folder.id,
      name: folder.name,
      system: folder.system,
      sessions,
      updatedAt: sessions[0]?.updatedAt ?? fallback,
    };
  });
}

/** 输入框 chip 的「最近项目」：只列用户项目，按最近活跃排序，空项目按自身时间垫底。 */
export function recentProjects(views: AgentProjectView[], limit = 5): AgentProjectView[] {
  return views
    .filter((view) => !view.system)
    .sort((a, b) => (b.updatedAt !== a.updatedAt ? b.updatedAt - a.updatedAt : a.name.localeCompare(b.name)))
    .slice(0, limit);
}

export function projectNameOf(folders: ChatFolder[], projectId: string | null | undefined): string | null {
  if (!projectId) return null;
  return folders.find((folder) => folder.id === projectId)?.name ?? null;
}
