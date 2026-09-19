import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildProjectViews,
  projectNameOf,
  recentProjects,
  selectArchivedSessions,
  selectRecentSessions,
  type AgentProjectView,
} from "./projectViews.ts";
import type { ChatFolder, SessionMeta } from "@/lib/storage/chatStorage";

function session(id: string, patch: Partial<SessionMeta> = {}): SessionMeta {
  return {
    id,
    title: id,
    createdAt: 1,
    updatedAt: 10,
    messageCount: 1,
    artifactIds: [],
    ...patch,
  };
}

const FOLDERS: ChatFolder[] = [
  { id: "project-note", name: "笔记记录", createdAt: 0, system: "note" },
  { id: "project-floating", name: "划词摘录", createdAt: 0, system: "floating" },
  { id: "folder-a", name: "组胚", createdAt: 5, updatedAt: 5 },
];

test("系统项目按 kind 归拢，用户项目按 folderId 归拢", () => {
  const views = buildProjectViews(FOLDERS, [
    session("n1", { kind: "note", updatedAt: 30 }),
    session("f1", { kind: "floating", updatedAt: 40 }),
    session("m1", { folderId: "folder-a", updatedAt: 20 }),
    session("m2", { updatedAt: 50 }),
  ]);
  assert.deepEqual(views.map((view) => view.id), ["project-note", "project-floating", "folder-a"]);
  assert.deepEqual(views[0].sessions.map((s) => s.id), ["n1"]);
  assert.deepEqual(views[1].sessions.map((s) => s.id), ["f1"]);
  assert.deepEqual(views[2].sessions.map((s) => s.id), ["m1"]);
  // 系统项目的成员不会同时出现在用户项目里
  assert.equal(views.some((view) => view.sessions.some((s) => s.id === "f1") && !view.system), false);
});

test("归档会话不进任何项目，也不进 Recents", () => {
  const sessions = [
    session("m1", { archived: true, updatedAt: 60 }),
    session("f1", { kind: "floating", archived: true, updatedAt: 70 }),
  ];
  const views = buildProjectViews(FOLDERS, sessions);
  assert.deepEqual(views.map((view) => view.sessions.length), [0, 0, 0]);
  assert.deepEqual(selectRecentSessions(sessions), []);
  assert.deepEqual(selectArchivedSessions(sessions).map((s) => s.id), ["f1", "m1"]);
});

test("Recents 只收未归项目的普通对话，且按 updatedAt 倒序", () => {
  const sessions = [
    session("m-old", { updatedAt: 10 }),
    session("m-new", { updatedAt: 90 }),
    session("in-project", { folderId: "folder-a", updatedAt: 99 }),
    session("n1", { kind: "note", updatedAt: 95 }),
  ];
  assert.deepEqual(selectRecentSessions(sessions).map((s) => s.id), ["m-new", "m-old"]);
});

test("项目活跃时间取最新成员；空项目退回项目自身时间", () => {
  const views = buildProjectViews(FOLDERS, [session("m1", { folderId: "folder-a", updatedAt: 123 })]);
  assert.equal(views[2].updatedAt, 123);
  assert.equal(views[0].updatedAt, 0);
});

test("最近项目只列用户项目，空项目排最后", () => {
  const views: AgentProjectView[] = buildProjectViews(
    [...FOLDERS, { id: "folder-b", name: "生理", createdAt: 200, updatedAt: 200 }],
    [session("m1", { folderId: "folder-a", updatedAt: 321 })],
  );
  assert.deepEqual(recentProjects(views).map((view) => view.id), ["folder-a", "folder-b"]);
  assert.deepEqual(recentProjects(views, 1).map((view) => view.id), ["folder-a"]);
});

test("projectNameOf 对悬空 id 返回 null", () => {
  assert.equal(projectNameOf(FOLDERS, "folder-a"), "组胚");
  assert.equal(projectNameOf(FOLDERS, "folder-gone"), null);
  assert.equal(projectNameOf(FOLDERS, null), null);
});